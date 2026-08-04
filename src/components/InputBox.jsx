import { useState } from 'react'
import { ArrowUp, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import './InputBox.css'

function InputBox({ isLoading, onSend }) {
  const [value, setValue] = useState('')

  const submitMessage = () => {
    const message = value.trim()
    if (!message || isLoading) return
    onSend(message)
    setValue('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submitMessage()
    }
  }

  return (
    <div className="input-area">
      <div className="input-box">
        <button className="attach-button" type="button" aria-label="添加附件">
          <Plus size={19} strokeWidth={1.8} />
        </button>
        <textarea
          aria-label="输入购物需求"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="想了解什么？尽管问我"
          rows="1"
          value={value}
        />
        <motion.button
          className="send-button"
          disabled={!value.trim() || isLoading}
          onClick={submitMessage}
          type="button"
          aria-label="发送消息"
          whileTap={value.trim() && !isLoading ? { scale: 0.9 } : undefined}
        >
          <ArrowUp size={17} strokeWidth={2.4} />
        </motion.button>
      </div>
      <p className="input-hint">
        {isLoading ? '智能体正在回复…' : '已连接腾讯云智能体服务'}
      </p>
    </div>
  )
}

export default InputBox
