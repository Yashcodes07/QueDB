import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Bot, User, Sparkles, ChevronRight } from 'lucide-react'
import api from '../../api/client'
import { useAppStore } from '../../store/appStore'
import clsx from 'clsx'

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={clsx('flex gap-3 animate-slide-up', isUser && 'flex-row-reverse')}>
      <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
        isUser ? 'bg-accent/20 border border-accent/30' : 'bg-bg-tertiary border border-border')}>
        {isUser ? <User size={12} className="text-accent" /> : <Bot size={12} className="text-text-secondary" />}
      </div>
      <div className="max-w-[80%] space-y-2">
        <div className={clsx('px-4 py-3 rounded-xl text-sm leading-relaxed',
          isUser
            ? 'bg-accent text-white rounded-tr-sm'
            : 'bg-bg-tertiary border border-border text-text-primary rounded-tl-sm')}>
          {msg.content}
        </div>
        {msg.followups?.length > 0 && (
          <div className="space-y-1">
            <p className="text-text-muted text-xs flex items-center gap-1 ml-1">
              <Sparkles size={10} /> Suggested follow-ups
            </p>
            {msg.followups.map((q, i) => (
              <button key={i} onClick={() => msg.onFollowup(q)}
                className="flex items-center gap-2 text-xs text-text-secondary hover:text-accent bg-bg-tertiary hover:bg-accent/5 border border-border hover:border-accent/30 px-3 py-1.5 rounded-lg transition-all w-full text-left">
                <ChevronRight size={10} className="shrink-0" />{q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatBox() {
  const conn = useAppStore(s => s.selectedConnection)
  const [messages, setMessages] = useState([
    { id: 0, role: 'assistant', content: "Ask me anything about your database in plain English. I'll convert it to SQL and explain the results." }
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function sendMessage(question) {
    if (!question.trim() || !conn || loading) return
    const q = question.trim()
    setInput('')
    setMessages(p => [...p, { id: Date.now(), role: 'user', content: q }])
    setLoading(true)
    try {
      const { data } = await api.post('/query/ask', { connection_id: conn.id, question: q })
      const followups = data.followup_questions || []
      setMessages(p => [...p, {
        id: Date.now() + 1, role: 'assistant',
        content: data.success ? data.answer : `Error: ${data.error_explanation?.explanation || 'Something went wrong'}`,
        followups, onFollowup: (fq) => sendMessage(fq),
      }])
    } catch {
      setMessages(p => [...p, { id: Date.now() + 1, role: 'assistant', content: 'Failed to connect to server.' }])
    } finally { setLoading(false) }
  }

  if (!conn) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <Bot size={40} className="text-text-muted mb-3" />
      <p className="text-text-primary font-medium mb-1">No connection selected</p>
      <p className="text-text-secondary text-sm">Select a connection from the sidebar</p>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-bg-secondary">
        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-slow" />
        <span className="text-text-secondary text-xs">Connected to <span className="text-text-primary font-medium">{conn.name}</span></span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => <Message key={msg.id} msg={msg} />)}
        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-bg-tertiary border border-border flex items-center justify-center">
              <Bot size={12} className="text-text-secondary" />
            </div>
            <div className="bg-bg-tertiary border border-border rounded-xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="How many users signed up this month?"
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            disabled={loading} />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} className="btn-primary px-3">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
        <p className="text-text-muted text-xs mt-2 px-1">Press Enter to send</p>
      </div>
    </div>
  )
}
