import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Play, Loader2, Download, Copy, Check } from 'lucide-react'
import api from '../../api/client'
import { useAppStore } from '../../store/appStore'
import ResultsTable from './ResultsTable'

export default function SQLEditor() {
  const conn = useAppStore(s => s.selectedConnection)
  const [sql, setSql]         = useState('SELECT * FROM users LIMIT 10;')
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [copied, setCopied]   = useState(false)

  async function runQuery() {
    if (!conn || !sql.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const { data } = await api.post('/query/sql', { connection_id: conn.id, sql })
      if (data.success) setResult(data)
      else setError(data.error || 'Query failed')
    } catch (e) {
      setError(e.response?.data?.detail || 'Query failed')
    } finally { setLoading(false) }
  }

  function copySQL() {
    navigator.clipboard.writeText(sql)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function downloadCSV() {
    if (!result) return
    const header = result.columns.join(',')
    const rows   = result.rows.map(r => r.map(v => `"${v}"`).join(','))
    const csv    = [header, ...rows].join('\n')
    const blob   = new Blob([csv], { type: 'text/csv' })
    const a      = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'result.csv'
    a.click()
  }

  if (!conn) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-text-muted text-sm">Select a connection to run queries</p>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-bg-secondary">
        <button onClick={runQuery} disabled={loading} className="btn-primary">
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
          {loading ? 'Running...' : 'Run Query'}
        </button>
        <button onClick={copySQL} className="btn-ghost">
          {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        {result && <>
          <button onClick={downloadCSV} className="btn-ghost ml-auto"><Download size={13} /> Export CSV</button>
          <span className="text-text-muted text-xs">{result.row_count} rows</span>
        </>}
      </div>
      <div className="border-b border-border" style={{ height: '220px' }}>
        <Editor height="220px" language="sql" value={sql} onChange={v => setSql(v || '')} theme="vs-dark"
          options={{ fontSize: 13, fontFamily: 'DM Mono, monospace', minimap: { enabled: false },
            scrollBeyondLastLine: false, padding: { top: 12, bottom: 12 } }} />
      </div>
      <div className="flex-1 overflow-auto">
        {error && <div className="m-4 bg-error/10 border border-error/30 text-error text-sm rounded-lg px-4 py-3">{error}</div>}
        {result && <ResultsTable columns={result.columns} rows={result.rows} />}
        {!result && !error && (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">Run a query to see results</div>
        )}
      </div>
    </div>
  )
}
