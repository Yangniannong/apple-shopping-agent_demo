import { motion } from 'framer-motion'
import { ArrowRight, Boxes, MessageCircle, PackageSearch, Sparkles } from 'lucide-react'
import AppleLogo from './AppleLogo'
import './WelcomeScreen.css'

const capabilities = [
  {
    icon: MessageCircle,
    title: '产品咨询',
    description: '快速了解 Apple 产品信息',
  },
  {
    icon: Sparkles,
    title: '智能推荐',
    description: '根据需求推荐适合设备',
  },
  {
    icon: Boxes,
    title: '型号对比',
    description: '分析不同产品之间的差异',
  },
  {
    icon: PackageSearch,
    title: '订单查询',
    description: '随时查询订单物流状态',
  },
]

const reveal = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

function WelcomeScreen({ onStart }) {
  return (
    <main className="welcome-screen">
      <div className="welcome-aura" aria-hidden="true" />

      <section className="welcome-content" aria-labelledby="welcome-title">
        <motion.div
          className="welcome-logo"
          initial="hidden"
          animate="visible"
          variants={reveal}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        >
          <span className="welcome-logo-core">
            <AppleLogo size={34} />
          </span>
        </motion.div>

        <motion.div
          className="welcome-heading"
          initial="hidden"
          animate="visible"
          variants={reveal}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="welcome-eyebrow">APPLE SHOPPING INTELLIGENCE</p>
          <h1 id="welcome-title">Apple 智能购物助手</h1>
          <p className="welcome-subtitle">探索 Apple 产品，获得智能购买建议</p>
        </motion.div>

        <motion.div
          className="welcome-capabilities"
          initial="hidden"
          animate="visible"
          variants={reveal}
          transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          {capabilities.map(({ icon: Icon, title, description }, index) => (
            <motion.article
              className="welcome-card"
              key={title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.22 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="welcome-card-icon" aria-hidden="true">
                <Icon size={18} strokeWidth={1.65} />
              </span>
              <div>
                <h2>{title}</h2>
                <p>{description}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          className="welcome-action"
          initial="hidden"
          animate="visible"
          variants={reveal}
          transition={{ duration: 0.65, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
        >
          <button className="welcome-start" type="button" onClick={onStart}>
            <span>开始体验</span>
            <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
          </button>
          <p>无需设置，直接开始对话</p>
        </motion.div>
      </section>
    </main>
  )
}

export default WelcomeScreen
