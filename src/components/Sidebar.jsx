import { BadgeHelp, PackageSearch, ReceiptText, RotateCcw } from 'lucide-react'
import './Sidebar.css'

const capabilities = [
  { label: '选购建议', icon: BadgeHelp },
  { label: '商品信息', icon: PackageSearch },
  { label: '订单进度', icon: ReceiptText },
  { label: '退款状态', icon: RotateCcw },
]

function Sidebar() {
  return (
    <aside className="capability-strip" aria-label="助手支持的服务">
      <span className="capability-intro">你可以问我</span>
      <div className="capability-list">
        {capabilities.map(({ label, icon: Icon }) => (
          <div className="capability-item" key={label}>
            <Icon size={16} strokeWidth={1.65} aria-hidden="true" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}

export default Sidebar
