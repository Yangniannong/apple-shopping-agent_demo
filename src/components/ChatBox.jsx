import { useEffect, useRef } from 'react'
import { Clock3, Zap } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './ChatBox.css'

function ChatBox({ messages }) {
  const chatBoxRef = useRef(null)

  useEffect(() => {
    const chatBox = chatBoxRef.current
    if (!chatBox) return

    chatBox.scrollTop = chatBox.scrollHeight
  }, [messages])

  return (
    <div className="chat-box" aria-live="polite" ref={chatBoxRef}>
      <div className="message-list">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              className={`message-row ${message.role}`}
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={
                message.role === 'user'
                  ? { type: 'spring', stiffness: 390, damping: 30 }
                  : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
              }
            >
              <div className="message-content">
                <span className="message-author">
                  {message.role === 'assistant' ? '购物助手' : '你'}
                </span>
                {message.role === 'assistant' ? (
                  <div className="message-bubble">
                    {message.status === 'thinking' ? (
                      <span className="thinking-label">
                        <span>正在思考</span>
                        <i className="thinking-dots" aria-hidden="true">
                          <b />
                          <b />
                          <b />
                        </i>
                      </span>
                    ) : message.status === 'completed' ? (
                      <div className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="streaming-content">{message.content}</p>
                    )}
                  </div>
                ) : (
                  <p className="message-bubble">{message.content}</p>
                )}
                {message.role === 'assistant' &&
                  message.status === 'completed' &&
                  message.firstResponseTime &&
                  message.totalResponseTime && (
                    <span className="message-metrics">
                      <span className="metric-pill">
                        <Zap size={10} strokeWidth={2} aria-hidden="true" />
                        首字响应 {message.firstResponseTime}s
                      </span>
                      <span className="metric-pill">
                        <Clock3 size={10} strokeWidth={1.8} aria-hidden="true" />
                        总耗时 {message.totalResponseTime}s
                      </span>
                    </span>
                  )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ChatBox
