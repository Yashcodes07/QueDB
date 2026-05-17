import { useState } from 'react'
import Sidebar from '../components/Layout/Sidebar'
import TabBar from '../components/Layout/TabBar'
import ChatBox from '../components/QueryInterface/ChatBox'
import SQLEditor from '../components/QueryInterface/SQLEditor'
import SchemaTree from '../components/SchemaExplorer/SchemaTree'
import KBPanel from '../components/KnowledgeBase/KBPanel'
import AddConnectionModal from '../components/ConnectionManager/AddConnectionModal'
import { useAppStore } from '../store/appStore'
import { Database } from 'lucide-react'

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
      <div className="w-16 h-16 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mb-4">
        <Database size={28} className="text-accent" />
      </div>
      <h2 className="text-text-primary font-semibold text-lg mb-2">Welcome to QueDB</h2>
      <p className="text-text-secondary text-sm max-w-xs mb-6">
        Connect your database and start querying with plain English.
      </p>
      <button onClick={onAdd} className="btn-primary">Add your first connection</button>
    </div>
  )
}

export default function Dashboard() {
  const { activeTab, selectedConnection } = useAppStore()
  const [showAddModal, setShowAddModal] = useState(false)

  const renderPanel = () => {
    if (!selectedConnection) return <EmptyState onAdd={() => setShowAddModal(true)} />
    switch (activeTab) {
      case 'chat':      return <ChatBox />
      case 'sql':       return <SQLEditor />
      case 'schema':    return <SchemaTree />
      case 'knowledge': return <KBPanel />
      default:          return <ChatBox />
    }
  }

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      <Sidebar onAddConnection={() => setShowAddModal(true)} />
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConnection && <TabBar />}
        <main className="flex-1 overflow-hidden">{renderPanel()}</main>
      </div>
      {showAddModal && <AddConnectionModal onClose={() => setShowAddModal(false)} />}
    </div>
  )
}
