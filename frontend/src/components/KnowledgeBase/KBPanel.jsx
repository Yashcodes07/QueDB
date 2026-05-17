import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Loader2, CheckCircle, Search, Sparkles, RefreshCw } from 'lucide-react'
import api from '../../api/client'
import { useAppStore } from '../../store/appStore'

export default function KBPanel() {
  const conn = useAppStore(s => s.selectedConnection)
  const qc   = useQueryClient()
  const [searchQuery, setSearchQuery]     = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [hybridQ, setHybridQ]             = useState('')
  const [hybridResult, setHybridResult]   = useState(null)
  const [hybridLoading, setHybridLoading] = useState(false)

  const { data: status } = useQuery({
    queryKey: ['kb-status', conn?.id],
    queryFn: () => api.get(`/knowledge/status/${conn.id}`).then(r => r.data),
    enabled: !!conn,
  })

  const ingestMutation = useMutation({
    mutationFn: () => api.post(`/knowledge/ingest/${conn.id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kb-status', conn?.id] }),
  })

  async function handleSearch() {
    if (!searchQuery.trim() || !conn) return
    const { data } = await api.post('/knowledge/search', { connection_id: conn.id, query: searchQuery, n_results: 5 })
    setSearchResults(data.results || [])
  }

  async function handleHybrid() {
    if (!hybridQ.trim() || !conn) return
    setHybridLoading(true); setHybridResult(null)
    try {
      const { data } = await api.post('/knowledge/ask', { connection_id: conn.id, question: hybridQ })
      setHybridResult(data)
    } finally { setHybridLoading(false) }
  }

  if (!conn) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <BookOpen size={32} className="text-text-muted mb-3" />
      <p className="text-text-secondary text-sm">Select a connection to manage its knowledge base</p>
    </div>
  )

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="bg-bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={14} className="text-accent" />
            <span className="text-text-primary text-sm font-medium">Knowledge Base</span>
          </div>
          {status?.is_ready && <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">Ready</span>}
        </div>
        <p className="text-text-muted text-xs mb-3">
          {status?.is_ready ? `${status.document_count} documents indexed` : 'Not yet ingested'}
        </p>
        <button onClick={() => ingestMutation.mutate()} disabled={ingestMutation.isPending}
          className="bg-bg-tertiary hover:bg-bg-hover border border-border text-text-primary font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm w-full justify-center">
          {ingestMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          {ingestMutation.isPending ? 'Ingesting...' : status?.is_ready ? 'Re-ingest' : 'Ingest Schema'}
        </button>
        {ingestMutation.isSuccess && (
          <div className="flex items-center gap-2 mt-2 text-success text-xs">
            <CheckCircle size={12} />{ingestMutation.data?.data?.message}
          </div>
        )}
      </div>

      <div className="bg-bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search size={14} className="text-accent" />
          <span className="text-text-primary text-sm font-medium">Semantic Search</span>
        </div>
        <div className="flex gap-2 mb-3">
          <input className="input flex-1" placeholder="user registration date..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          <button onClick={handleSearch} className="btn-primary px-3"><Search size={13} /></button>
        </div>
        {searchResults?.map((r, i) => (
          <div key={i} className="bg-bg-tertiary border border-border rounded-lg px-3 py-2 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">{r.metadata?.type}</span>
              <span className="text-text-muted text-xs">{(r.similarity * 100).toFixed(0)}% match</span>
            </div>
            <p className="text-text-secondary text-xs leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>

      <div className="bg-bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-accent" />
          <span className="text-text-primary text-sm font-medium">Hybrid Query</span>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">RAG + SQL</span>
        </div>
        <div className="flex gap-2 mb-3">
          <input className="input flex-1" placeholder="Ask a complex question..."
            value={hybridQ} onChange={e => setHybridQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleHybrid()} />
          <button onClick={handleHybrid} disabled={hybridLoading} className="btn-primary px-3">
            {hybridLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          </button>
        </div>
        {hybridResult && (
          <div className="bg-bg-tertiary border border-border rounded-lg p-3">
            {hybridResult.kb_enhanced && (
              <div className="flex items-center gap-1.5 text-xs text-accent mb-2">
                <CheckCircle size={11} /> Knowledge base context used
              </div>
            )}
            <p className="text-text-primary text-sm">{hybridResult.answer || hybridResult.error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
