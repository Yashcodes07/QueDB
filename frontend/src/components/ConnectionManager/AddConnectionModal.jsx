import { useState } from 'react'
import { X, Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../../api/client'
import { useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../../store/appStore'

const DB_TYPES = ['postgresql', 'mysql', 'sqlite', 'csv']

export default function AddConnectionModal({ onClose }) {
  const qc = useQueryClient()
  const setSelectedConnection = useAppStore(s => s.setSelectedConnection)
  const [form, setForm] = useState({ name: '', db_type: 'postgresql', host: 'localhost', port: 5432, database: '', username: '', password: '' })
  const [loading, setLoading]     = useState(false)
  const [testing, setTesting]     = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [error, setError]         = useState('')

  const isFile = ['sqlite', 'csv'].includes(form.db_type)

  async function handleTest() {
    setTesting(true); setTestResult(null)
    try {
      const { data: conn } = await api.post('/connections/', form)
      const { data: result } = await api.get(`/query/test/${conn.id}`)
      setTestResult(result)
      await api.delete(`/connections/${conn.id}`)
    } catch (e) {
      setTestResult({ success: false, error: e.response?.data?.detail || 'Test failed' })
    } finally { setTesting(false) }
  }

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data: conn } = await api.post('/connections/', form)
      try { await api.post(`/knowledge/ingest/${conn.id}`) } catch (_) {}
      await qc.invalidateQueries({ queryKey: ['connections'] })
      setSelectedConnection(conn)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-bg-card border border-border rounded-xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-accent" />
            <h2 className="font-semibold text-text-primary">Add Connection</h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary"><X size={16} /></button>
        </div>

        <form onSubmit={handleSave} className="p-4 space-y-3">
          {error && <div className="bg-error/10 border border-error/30 text-error text-sm rounded-lg px-3 py-2">{error}</div>}

          <div>
            <label className="label">Connection Name</label>
            <input className="input" placeholder="My Local DB" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Database Type</label>
            <select className="input" value={form.db_type}
              onChange={e => setForm(p => ({ ...p, db_type: e.target.value }))}>
              {DB_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
          </div>

          {isFile ? (
            <div>
              <label className="label">{form.db_type === 'sqlite' ? 'Database File Path' : 'CSV File Path'}</label>
              <input className="input font-mono text-xs" placeholder="/path/to/file"
                value={form.database} onChange={e => setForm(p => ({ ...p, database: e.target.value }))} required />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Host</label>
                  <input className="input" placeholder="localhost" value={form.host}
                    onChange={e => setForm(p => ({ ...p, host: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Port</label>
                  <input className="input" type="number" value={form.port}
                    onChange={e => setForm(p => ({ ...p, port: +e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Database</label>
                  <input className="input" placeholder="mydb" value={form.database}
                    onChange={e => setForm(p => ({ ...p, database: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Username</label>
                  <input className="input" placeholder="postgres" value={form.username}
                    onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="(leave blank if none)" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              </div>
            </>
          )}

          {testResult && (
            <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border ${
              testResult.success ? 'bg-success/10 border-success/30 text-success' : 'bg-error/10 border-error/30 text-error'
            }`}>
              {testResult.success ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
              {testResult.success ? 'Connection successful!' : testResult.error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={handleTest} disabled={testing} className="btn-secondary flex-1 justify-center">
              {testing && <Loader2 size={13} className="animate-spin" />}
              {testing ? 'Testing...' : 'Test'}
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading && <Loader2 size={13} className="animate-spin" />}
              {loading ? 'Saving...' : 'Save Connection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
