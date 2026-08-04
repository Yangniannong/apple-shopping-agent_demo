import { generateUUID } from '../utils/uuid'

const AGENT_API_URL = import.meta.env.VITE_AGENT_API_URL
const AGENT_APP_KEY = import.meta.env.VITE_AGENT_APP_KEY
const AGENT_VISITOR_ID = import.meta.env.VITE_AGENT_VISITOR_ID

function validateConfig() {
  if (!AGENT_API_URL || !AGENT_APP_KEY || !AGENT_VISITOR_ID) {
    throw new Error('智能体配置不完整，请检查 .env 文件。')
  }
}

function readSSEEvent(rawEvent, fallbackEventType = 'message') {
  let eventType = fallbackEventType
  let hasEventType = false
  const dataLines = []
  let dataStarted = false

  rawEvent.split(/\r?\n/).forEach((line) => {
    if (line.startsWith('event:')) {
      eventType = line.slice(6).trim()
      hasEventType = true
      return
    }

    if (line.startsWith('data:')) {
      dataStarted = true
      const data = line.slice(5).trim()
      if (data) dataLines.push(data)
      return
    }

    if (dataStarted && line.trim() && !line.startsWith(':')) {
      dataLines.push(line.trim())
    }
  })

  const rawData = dataLines.join('\n').trim()

  if (eventType === 'done') {
    return {
      event: { done: true, eventType },
      pendingEventType: 'message',
    }
  }

  if (!rawData) {
    return {
      event: null,
      pendingEventType: hasEventType ? eventType : fallbackEventType,
    }
  }

  if (rawData === '[DONE]') {
    return {
      event: { done: true, eventType: 'done' },
      pendingEventType: 'message',
    }
  }

  try {
    const payload = JSON.parse(rawData)
    const text = payload.Text ?? payload.Payload?.Text ?? payload.Data?.Text

    if (typeof text !== 'string') {
      return { event: null, pendingEventType: 'message' }
    }

    return {
      event: {
        done: false,
        eventType,
        text,
        replace: eventType === 'text.replace',
      },
      pendingEventType: 'message',
    }
  } catch {
    return { event: null, pendingEventType: 'message' }
  }
}

function emitStreamEvents(events, onText) {
  for (const event of events) {
    if (event.done) return true
    if (!event.text) continue

    onText(event.text, {
      eventType: event.eventType,
      replace: event.replace,
    })
  }

  return false
}

function consumeCompleteEvents(buffer, pendingEventType, onEvent) {
  let remaining = buffer
  let nextEventType = pendingEventType
  let boundary = remaining.match(/\r?\n\r?\n/)

  while (boundary && boundary.index !== undefined) {
    const rawEvent = remaining.slice(0, boundary.index)
    remaining = remaining.slice(boundary.index + boundary[0].length)

    const parsedEvent = readSSEEvent(rawEvent, nextEventType)
    nextEventType = parsedEvent.pendingEventType
    if (parsedEvent.event) onEvent(parsedEvent.event)

    boundary = remaining.match(/\r?\n\r?\n/)
  }

  return { remaining, pendingEventType: nextEventType }
}

export async function streamAgentReply({ question, conversationId, onText }) {
  validateConfig()

  const response = await fetch(AGENT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      RequestId: generateUUID(),
      ConversationId: conversationId,
      AppKey: AGENT_APP_KEY,
      VisitorId: AGENT_VISITOR_ID,
      Contents: [
        {
          Type: 'text',
          Text: question,
        },
      ],
      Incremental: true,
      EnableMultiIntent: true,
      Stream: 'enable',
    }),
  })

  if (!response.ok) {
    throw new Error(`智能体请求失败（HTTP ${response.status}）`)
  }

  if (!response.body) {
    throw new Error('浏览器未收到可读取的流式响应。')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let pendingEventType = 'message'

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const events = []
    const parsedChunk = consumeCompleteEvents(buffer, pendingEventType, (event) => {
      events.push(event)
    })
    buffer = parsedChunk.remaining
    pendingEventType = parsedChunk.pendingEventType

    const streamCompleted = emitStreamEvents(events, onText)
    if (streamCompleted) {
      try {
        await reader.cancel()
      } catch {
        // 服务端可能已主动关闭流，完成事件仍然有效。
      }
      return
    }
  }

  buffer += decoder.decode()
  const finalEvent = readSSEEvent(buffer.trim(), pendingEventType)
  if (finalEvent.event) {
    emitStreamEvents([finalEvent.event], onText)
  }
}
