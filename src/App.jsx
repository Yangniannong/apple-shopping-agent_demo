import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import './App.css'
import { streamAgentReply } from './api/agent'
import AppleLogo from './components/AppleLogo'
import ChatBox from './components/ChatBox'
import InputBox from './components/InputBox'
import Sidebar from './components/Sidebar'
import WelcomeScreen from './components/WelcomeScreen'
import { calculateDuration } from './utils/time'
import { createTypewriter } from './utils/typewriter'
import { generateUUID } from './utils/uuid'

const initialMessages = [
  {
    id: 1,
    role: 'assistant',
    content: '你好，我是你的智能购物助手。告诉我你想买什么，或直接问我商品、订单和退款问题。',
    status: 'completed',
  },
  {
    id: 2,
    role: 'user',
    content: '我想选一台适合日常办公和轻度剪辑的 Mac。',
  },
  {
    id: 3,
    role: 'assistant',
    content: '没问题。你的预算大概是多少？平时是否需要经常随身携带？',
    status: 'completed',
  },
]

const pageMotion = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

const handleAmbientPointerMove = (event) => {
  if (event.pointerType !== 'mouse') return

  event.currentTarget.style.setProperty('--ambient-x', `${event.clientX}px`)
  event.currentTarget.style.setProperty('--ambient-y', `${event.clientY}px`)
}

const handleAmbientPointerLeave = (event) => {
  event.currentTarget.style.setProperty('--ambient-x', '50vw')
  event.currentTarget.style.setProperty('--ambient-y', '18vh')
}

function App() {
  const [hasStarted, setHasStarted] = useState(false)
  const [messages, setMessages] = useState(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const conversationId = useRef(generateUUID())

  const handleStart = () => {
    window.scrollTo({ top: 0, left: 0 })
    setHasStarted(true)
  }

  const handleSend = async (content) => {
    if (isLoading) return

    const userMessage = { id: generateUUID(), role: 'user', content }
    const assistantMessageId = generateUUID()
    const startTime = Date.now()
    let hasReceivedText = false
    let firstCharacterAt = null
    let streamFinishedAt

    const typewriter = createTypewriter({
      interval: 30,
      onUpdate: (nextContent) => {
        if (!firstCharacterAt && nextContent) {
          firstCharacterAt = Date.now()
        }

        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === assistantMessageId
              ? { ...message, content: nextContent, status: 'streaming' }
              : message,
          ),
        )
      },
    })

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        status: 'thinking',
        firstResponseTime: null,
        totalResponseTime: null,
      },
    ])
    setIsLoading(true)

    try {
      await streamAgentReply({
        question: content,
        conversationId: conversationId.current,
        onText: (text, { eventType, replace }) => {
          hasReceivedText = true

          if (replace || eventType === 'text.replace') {
            typewriter.replace(text)
            return
          }

          typewriter.enqueue(text)
        },
      })

      streamFinishedAt = Date.now()

      if (!hasReceivedText) {
        throw new Error('智能体暂时没有返回内容，请稍后重试。')
      }

      await typewriter.drain()

      const firstResponseTime = calculateDuration(startTime, firstCharacterAt)
      const totalResponseTime = calculateDuration(startTime, streamFinishedAt)
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                status: 'completed',
                firstResponseTime,
                totalResponseTime,
              }
            : message,
        ),
      )
    } catch (error) {
      console.error('Agent request failed:', error)
      typewriter.cancel()

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content: '抱歉，请求失败，请稍后重试',
                status: 'error',
                firstResponseTime: null,
                totalResponseTime: null,
              }
            : message,
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="app-shell"
      id="top"
      onPointerLeave={handleAmbientPointerLeave}
      onPointerMove={handleAmbientPointerMove}
    >
      <span className="ambient-pointer" aria-hidden="true" />
      {!hasStarted ? (
        <WelcomeScreen onStart={handleStart} />
      ) : (
        <>
          <header className="topbar">
            <a className="brand" href="#top" aria-label="智能购物助手首页">
              <span className="brand-symbol" aria-hidden="true">
                <AppleLogo size={17} />
              </span>
              <span>Apple 智能购物助手</span>
            </a>
            <span className="product-status">
              <i aria-hidden="true" />
              Demo
            </span>
          </header>

          <main className="experience">
        <motion.section
          className="hero-copy"
          initial="hidden"
          animate="visible"
          variants={pageMotion}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-emblem" aria-hidden="true">
            <span className="hero-emblem-core">
              <AppleLogo size={29} />
            </span>
          </div>
          <p className="eyebrow">APPLE SHOPPING INTELLIGENCE</p>
          <p className="hero-description">
            从挑选心仪产品到掌握订单进度，<br className="desktop-break" />
            一次对话，轻松搞定。
          </p>
        </motion.section>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={pageMotion}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Sidebar />
        </motion.div>

        <motion.section
          className="chat-panel"
          aria-label="智能购物对话"
          initial="hidden"
          animate="visible"
          variants={pageMotion}
          transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="chat-bar">
            <div className="assistant-identity">
              <span className="assistant-orb" aria-hidden="true">
                <AppleLogo size={19} />
              </span>
              <div>
                <strong>购物助手</strong>
                <span>随时为你解答</span>
              </div>
            </div>
            <span className="online-status"><i aria-hidden="true" /> 在线</span>
          </div>

          <ChatBox messages={messages} />
          <InputBox isLoading={isLoading} onSend={handleSend} />
        </motion.section>

            <p className="privacy-note">你的对话仅用于本次购物体验</p>
          </main>
        </>
      )}
    </div>
  )
}

export default App
