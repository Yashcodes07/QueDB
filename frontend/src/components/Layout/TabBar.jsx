import { MessageSquare, Code2, BookOpen, Table2 } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import clsx from 'clsx'

const TABS = [
  { id: 'chat',      label: 'AI Chat',    icon: MessageSquare },
  { id: 'sql',       label: 'SQL Editor', icon: Code2 },
  { id: 'schema',    label: 'Schema',     icon: Table2 },
  { id: 'knowledge', label: 'Knowledge',  icon: BookOpen },
]

export default function TabBar() {
  const { activeTab, setActiveTab } = useAppStore()
  return (
    <div className="flex items-center gap-1 px-4 border-b border-border bg-bg-secondary">
      {TABS.map(tab => (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-all duration-150 -mb-px",
            activeTab === tab.id
              ? "border-accent text-text-primary"
              : "border-transparent text-text-muted hover:text-text-secondary hover:border-border"
          )}>
          <tab.icon size={13} />
          {tab.label}
        </button>
      ))}
    </div>
  )
}
