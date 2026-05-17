import { Database, Plus, ChevronRight, LogOut, Layers } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/appStore'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/client'
import clsx from 'clsx'

export default function Sidebar({ onAddConnection }) {
  const logout = useAuthStore(s => s.logout)
  const user   = useAuthStore(s => s.user)
  const { selectedConnection, setSelectedConnection } = useAppStore()

  const { data: connections = [] } = useQuery({
    queryKey: ['connections'],
    queryFn: () => api.get('/connections/').then(r => r.data),
  })

  return (
    <aside className="w-60 bg-bg-secondary border-r border-border flex flex-col h-screen shrink-0">
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
            <Database size={13} className="text-white" />
          </div>
          <span className="font-semibold text-text-primary">QueDB</span>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">v5</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-text-secondary text-xs font-medium uppercase tracking-wider">Connections</span>
          <button onClick={onAddConnection}
            className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-accent hover:bg-accent/10 transition-all">
            <Plus size={12} />
          </button>
        </div>

        {connections.length === 0 ? (
          <div className="text-center py-6">
            <Layers size={20} className="text-text-muted mx-auto mb-2" />
            <p className="text-text-muted text-xs">No connections yet</p>
            <button onClick={onAddConnection} className="text-accent text-xs hover:underline mt-1">Add one</button>
          </div>
        ) : (
          <div className="space-y-1">
            {connections.map(conn => (
              <button key={conn.id} onClick={() => setSelectedConnection(conn)}
                className={clsx(
                  "w-full text-left px-3 py-2 rounded-lg transition-all duration-150 group flex items-center gap-2",
                  selectedConnection?.id === conn.id
                    ? "bg-accent/10 border border-accent/20 text-text-primary"
                    : "hover:bg-bg-hover text-text-secondary hover:text-text-primary border border-transparent"
                )}>
                <div className={clsx("w-1.5 h-1.5 rounded-full shrink-0",
                  selectedConnection?.id === conn.id ? "bg-accent" : "bg-text-muted")} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{conn.name}</p>
                  <p className="text-xs text-text-muted truncate">{conn.db_type} · {conn.database}</p>
                </div>
                <ChevronRight size={12} className="shrink-0 opacity-0 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs text-accent font-semibold">
            {user?.full_name?.[0] || user?.email?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-text-primary text-xs font-medium truncate">{user?.full_name || 'User'}</p>
            <p className="text-text-muted text-xs truncate">{user?.email}</p>
          </div>
          <button onClick={logout} className="text-text-muted hover:text-error transition-colors p-1 rounded">
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  )
}
