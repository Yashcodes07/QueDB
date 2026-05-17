import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Database, Loader2 } from 'lucide-react'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

export default function Register() {
  const navigate = useNavigate()
  const setAuth  = useAuthStore(s => s.setAuth)
  const [form, setForm]       = useState({ email: '', password: '', full_name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.post('/auth/register', form)
      const params = new URLSearchParams()
      params.append('username', form.email)
      params.append('password', form.password)
      const { data } = await api.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      const me = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${data.access_token}` }
      })
      setAuth(data.access_token, me.data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Database size={16} className="text-white" />
          </div>
          <span className="text-xl font-semibold text-text-primary">QueDB</span>
        </div>
        <div className="card">
          <h1 className="text-lg font-semibold text-text-primary mb-1">Create account</h1>
          <p className="text-text-secondary text-sm mb-6">Start querying databases with AI</p>
          {error && (
            <div className="bg-error/10 border border-error/30 text-error text-sm rounded-lg px-3 py-2 mb-4">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input className="input" placeholder="Yash Kumar"
                value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
        <p className="text-center text-text-muted text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-hover transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
