import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, ChevronDown, Table2, Key, Link, Hash, RefreshCw } from 'lucide-react'
import api from '../../api/client'
import { useAppStore } from '../../store/appStore'
import clsx from 'clsx'

function TypeBadge({ type }) {
  const t = type.toUpperCase()
  const color = t.includes('INT') ? 'text-blue-400' : t.includes('VARCHAR') || t.includes('TEXT') ? 'text-green-400' : t.includes('BOOL') ? 'text-yellow-400' : t.includes('TIME') || t.includes('DATE') ? 'text-purple-400' : 'text-text-muted'
  return <span className={clsx('font-mono text-xs', color)}>{type}</span>
}

function TableRow({ name, info, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="animate-slide-in">
      <button onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-bg-hover rounded-lg transition-all group text-left">
        <span className="text-text-muted">{open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</span>
        <Table2 size={12} className="text-accent shrink-0" />
        <span className="text-text-primary text-sm font-medium flex-1">{name}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-bg-tertiary text-text-muted border border-border">{info.row_count?.toLocaleString() ?? 0}</span>
      </button>
      {open && (
        <div className="ml-6 mb-1 border-l border-border pl-3 space-y-0.5">
          {info.columns.map(col => (
            <div key={col.name} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-bg-hover">
              {col.primary_key ? <Key size={10} className="text-warning shrink-0" /> : <Hash size={10} className="text-text-muted shrink-0" />}
              <span className="text-text-secondary text-xs flex-1 truncate">{col.name}</span>
              <TypeBadge type={col.type} />
              {!col.nullable && <span className="text-xs text-error">*</span>}
            </div>
          ))}
          {info.foreign_keys?.map((fk, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1 text-xs text-text-muted">
              <Link size={10} className="shrink-0 text-purple-400" />
              <span className="truncate">{fk.column?.join(', ')} → {fk.references_table}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SchemaTree() {
  const conn = useAppStore(s => s.selectedConnection)
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['schema', conn?.id],
    queryFn: () => api.get(`/query/schema/${conn.id}`).then(r => r.data.schema),
    enabled: !!conn,
  })

  if (!conn) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <Table2 size={32} className="text-text-muted mb-3" />
      <p className="text-text-secondary text-sm">Select a connection to explore schema</p>
    </div>
  )

  if (isLoading) return (
    <div className="p-4 space-y-3">
      {[...Array(4)].map((_, i) => <div key={i} className="h-8 w-full bg-bg-tertiary rounded animate-pulse" />)}
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <p className="text-text-primary text-sm font-medium">{conn.name}</p>
          <p className="text-text-muted text-xs">{Object.keys(data || {}).length} tables</p>
        </div>
        <button onClick={() => refetch()} className="hover:bg-bg-tertiary text-text-secondary hover:text-text-primary px-2 py-1.5 rounded-lg transition-all text-sm flex items-center gap-1">
          <RefreshCw size={13} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {data && Object.entries(data).map(([name, info], i) => (
          <TableRow key={name} name={name} info={info} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  )
}
