import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Database, Zap, Shield, Brain, ChevronRight, Globe, Lock, BarChart3, ArrowRight, Menu, X, Check } from 'lucide-react'

/* ── tiny hook: intersection observer for scroll reveals ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

/* ── animated SQL terminal ── */
const DEMO_LINES = [
  { delay: 0,    text: '> Connect to production_db', color: '#9090b0' },
  { delay: 800,  text: '✓ Connected via SSL', color: '#10b981' },
  { delay: 1400, text: '> Ask: "Show top 10 customers by revenue this quarter"', color: '#9090b0' },
  { delay: 2200, text: '⚡ Generating SQL…', color: '#f59e0b' },
  { delay: 2900, text: 'SELECT c.name, SUM(o.total) AS revenue', color: '#6366f1' },
  { delay: 3100, text: '  FROM customers c JOIN orders o ON c.id = o.customer_id', color: '#6366f1' },
  { delay: 3300, text: "  WHERE o.created_at >= DATE_TRUNC('quarter', NOW())", color: '#6366f1' },
  { delay: 3500, text: '  GROUP BY c.name ORDER BY revenue DESC LIMIT 10;', color: '#6366f1' },
  { delay: 4000, text: '✓ 10 rows returned in 43ms', color: '#10b981' },
]

function Terminal_() {
  const [lines, setLines] = useState([])
  const scrollRef = useRef(null)

  useEffect(() => {
    const timers = DEMO_LINES.map(({ delay, text, color }) =>
      setTimeout(() => setLines(prev => [...prev, { text, color }]), delay)
    )
    const loop = setTimeout(() => setLines([]), 5800)
    return () => { timers.forEach(clearTimeout); clearTimeout(loop) }
  }, [lines.length === 0 ? 0 : undefined])

  useEffect(() => {
    if (lines.length === DEMO_LINES.length) {
      const t = setTimeout(() => setLines([]), 2500)
      return () => clearTimeout(t)
    }
  }, [lines.length])

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [lines])

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d14] shadow-2xl shadow-indigo-950/60">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#111118] border-b border-white/5">
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <span className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-3 text-xs text-white/30 font-mono">quedb — ai query engine</span>
      </div>
      <div
        ref={scrollRef}
        className="p-5 font-mono text-sm min-h-[260px] max-h-[260px] overflow-y-auto space-y-1.5"
        style={{ scrollbarWidth: 'none' }}
      >
        {lines.map((l, i) => (
          <div key={i} style={{ color: l.color }} className="animate-fade-in leading-relaxed">
            {l.text}
          </div>
        ))}
        <span className="inline-block w-2 h-4 bg-indigo-400 animate-pulse ml-0.5" />
      </div>
    </div>
  )
}

/* ── QueDB Q-ring logo mark ── */
function QueDBLogo({ size = 40 }) {
  const c = size / 2
  // fixed coords on a 40×40 grid, then scaled via viewBox
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="QueDB logo mark"
    >
      {/* solid indigo disc */}
      <circle cx="20" cy="20" r="19" fill="#6366f1" />
      {/* subtle shimmer arc top-left for depth */}
      <path
        d="M 7 13 A 14 14 0 0 1 20 6"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* Q letter — white, bold, centred */}
      <text
        x="20"
        y="27"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="26"
        fontWeight="900"
        fill="white"
      >Q</text>
      {/* cursor tail — white pill extending bottom-right of Q */}
      <rect x="25" y="26" width="9" height="4" rx="2" fill="white" opacity="0.9" />
    </svg>
  )
}


/* ── MascotInline: robot PEEKS from behind the terminal box ── */
function MascotInline() {
  const [pupil,  setPupil]  = useState({ x: 0, y: 0 })
  const [blink,  setBlink]  = useState(false)
  const [waving, setWaving] = useState(false)
  const [bob,    setBob]    = useState(0)
  const ref    = useRef(null)
  const bobRaf = useRef(null)
  const bobT   = useRef(0)

  useEffect(() => {
    const onMove = (e) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const mx = rect.left + rect.width  * 0.5
      const my = rect.top  + rect.height * 0.3
      const dx = e.clientX - mx
      const dy = e.clientY - my
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const r = 3
      setPupil({ x: (dx / dist) * Math.min(r, dist * 0.055), y: (dy / dist) * Math.min(r, dist * 0.055) })
      setWaving(dist < 280)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // gentle bob — moves the whole mascot up/down so peek depth changes
  useEffect(() => {
    const loop = () => {
      bobT.current += 0.028
      setBob(Math.sin(bobT.current) * 5)
      bobRaf.current = requestAnimationFrame(loop)
    }
    bobRaf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(bobRaf.current)
  }, [])

  // random blink
  useEffect(() => {
    const go = () => {
      const t = setTimeout(() => {
        setBlink(true)
        setTimeout(() => { setBlink(false); go() }, 120)
      }, 2000 + Math.random() * 4000)
      return t
    }
    const t = go(); return () => clearTimeout(t)
  }, [])

  const B = '#6366f1'
  const D = '#3730a3'

  return (
    <div
      ref={ref}
      style={{
        transform: `translateY(${bob}px)`,
        transition: 'transform 0.05s linear',
        filter: 'drop-shadow(0 -4px 16px rgba(99,102,241,0.5))',
        // only the head + hands portion is rendered visually;
        // the body is hidden behind the terminal box below
      }}
    >
      {/*
        SVG is 110px wide × 100px tall.
        The bottom ~30px (body stub + hands) will be hidden by the terminal box on top.
        Only the head + antenna (~70px) peeks above.
      */}
      <svg width="110" height="100" viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">

        {/* ── antenna ── */}
        <line x1="55" y1="0" x2="55" y2="12" stroke={B} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="55" cy="0" r="4.5" fill="#a5b4fc"/>
        <circle cx="55" cy="0" r="7"   fill="none" stroke={B} strokeWidth="1.2" opacity="0.3"/>

        {/* ── head ── */}
        <rect x="14" y="10" width="82" height="62" rx="18" fill={B}/>
        {/* sheen */}
        <rect x="19" y="12" width="36" height="11" rx="5" fill="white" opacity="0.1"/>

        {/* ── eyes ── */}
        <circle cx="38"  cy="36" r="13" fill="white"/>
        <circle cx="72" cy="36" r="13" fill="white"/>
        {blink ? (
          <>
            <rect x="25"  y="31" width="26" height="10" rx="5" fill={B}/>
            <rect x="59" y="31" width="26" height="10" rx="5" fill={B}/>
          </>
        ) : (
          <>
            <circle cx={38  + pupil.x} cy={36 + pupil.y} r="6.5" fill="#1e1b4b"/>
            <circle cx={72 + pupil.x} cy={36 + pupil.y} r="6.5" fill="#1e1b4b"/>
            <circle cx={40  + pupil.x} cy={33 + pupil.y} r="2.2" fill="white" opacity="0.75"/>
            <circle cx={74 + pupil.x} cy={33 + pupil.y} r="2.2" fill="white" opacity="0.75"/>
          </>
        )}

        {/* ── smile / mouth strip ── */}
        <rect x="22" y="58" width="66" height="10" rx="5" fill="#0f0f1a"/>
        <text x="55" y="66" textAnchor="middle" fontFamily="monospace" fontSize="7.5" fontWeight="700" fill={B}>QueDB</text>

        {/* ── hands gripping the top edge of the terminal box ── */}
        {/* left hand */}
        <rect x="0"  y="78" width="22" height="14" rx="7" fill={D}/>
        <rect x="2"  y="83" width="6"  height="10" rx="3" fill={B}/>
        <rect x="9"  y="83" width="6"  height="10" rx="3" fill={B}/>
        <rect x="16" y="83" width="4"  height="10" rx="2" fill={B}/>
        {/* right hand */}
        <rect x="88" y="78" width="22" height="14" rx="7" fill={D}/>
        <rect x="88" y="83" width="6"  height="10" rx="3" fill={B}/>
        <rect x="96" y="83" width="6"  height="10" rx="3" fill={B}/>
        <rect x="103" y="83" width="6" height="10" rx="3" fill={B}/>

        {/* right arm raises slightly when waving */}
        {waving && (
          <g transform="translate(92, 62) rotate(-35, 10, 0)">
            <rect x="0" y="0" width="14" height="22" rx="7" fill={B} opacity="0.9"/>
          </g>
        )}
      </svg>
    </div>
  )
}


/* ── features ── */
const FEATURES = [
  { icon: Brain,     title: 'Natural Language to SQL',  desc: 'Type questions in plain English. QueDB instantly translates them into optimised, production-ready SQL — no syntax memorisation required.' },
  { icon: Zap,       title: 'Sub-50ms Execution',       desc: 'Intelligent query caching and index-aware planning ensure your analytics run at the speed of thought, not the speed of the database.' },
  { icon: Shield,    title: 'Enterprise Security',      desc: 'End-to-end encryption, role-based access control, audit logs, and zero-trust architecture keep your data locked down tight.' },
  { icon: Globe,     title: 'Any Database',             desc: 'PostgreSQL, MySQL, SQLite, MongoDB, BigQuery — connect anything with one-click integrations and a unified query interface.' },
  { icon: BarChart3, title: 'Instant Visualisations',   desc: 'Results auto-render as charts, tables, or KPI cards. Share dashboards with a link, no BI tool required.' },
  { icon: Lock,      title: 'Schema-Aware AI',          desc: 'QueDB reads your schema on connect, so the AI understands your exact column names, types, and relationships before answering.' },
]

const STEPS = [
  { n: '01', title: 'Connect Your DB',   desc: 'Paste your connection string. We support SSL, SSH tunnels, and private VPCs.' },
  { n: '02', title: 'Ask a Question',    desc: 'Type in plain English — "Which products had declining sales last 3 months?"' },
  { n: '03', title: 'Review & Execute',  desc: 'Inspect the generated SQL, tweak if needed, then run with one click.' },
  { n: '04', title: 'Share & Automate', desc: 'Export results, build dashboards, or schedule queries as reports.' },
]

/* ── main ── */
export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const [heroRef,  heroVisible]  = useInView(0.1)
  const [featRef,  featVisible]  = useInView(0.1)
  const [howRef,   howVisible]   = useInView(0.1)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="min-h-screen text-white" style={{ background: '#07070f', fontFamily: "'DM Sans', system-ui, sans-serif" }}>


      {/* ── NAVBAR ── */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#07070f]/90 backdrop-blur-md border-b border-white/5 shadow-lg shadow-black/40' : ''}`}>
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            {/* Q-ring logo mark — solid indigo disc, white Q */}
            <div className="transition-transform group-hover:scale-105 duration-200 flex-shrink-0">
              <QueDBLogo size={42} />
            </div>
            {/* wordmark + tagline pill */}
            <div className="flex flex-col leading-none gap-1">
              <span className="text-[16px] font-bold tracking-tight">Que<span className="text-indigo-400">DB</span></span>
              <span className="inline-flex items-center gap-1 bg-indigo-950/70 border border-indigo-700/40 rounded-full px-2 py-0.5 text-[10px] text-indigo-300 font-medium tracking-wide whitespace-nowrap">
                <Zap size={8} className="text-indigo-400" />
                AI query engine
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm text-white/50">
            {['Features', 'How it works'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5">
              Sign in
            </Link>
            <Link to="/register"
              className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-indigo-950/60 flex items-center gap-1.5">
              Get started <ArrowRight size={13} />
            </Link>
          </div>

          <button className="md:hidden text-white/60 hover:text-white" onClick={() => setMenuOpen(p => !p)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="md:hidden bg-[#0d0d16] border-t border-white/5 px-6 py-5 flex flex-col gap-4 text-sm">
            {['Features', 'How it works'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                className="text-white/60 hover:text-white" onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
            <div className="flex gap-3 pt-2 border-t border-white/5">
              <Link to="/login"    className="flex-1 text-center py-2 rounded-lg border border-white/10 text-white/70 hover:bg-white/5" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/register" className="flex-1 text-center py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium"         onClick={() => setMenuOpen(false)}>Get started</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative pt-36 pb-28 px-6 overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, #1e1060 0%, transparent 70%)' }}
      >
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute top-24 left-1/4 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 right-1/4 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className={`max-w-4xl mx-auto text-center transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-700/40 rounded-full px-4 py-1.5 text-xs text-indigo-300 mb-8 backdrop-blur-sm">
            <Zap size={11} className="text-indigo-400" />
            AI-powered query engine — now in public beta
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-[1.07] mb-6" style={{ letterSpacing: '-0.03em' }}>
            Talk to your database<br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
              in plain English
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/45 max-w-2xl mx-auto leading-relaxed mb-10">
            QueDB translates natural language into optimised SQL, executes it instantly, and visualises results —
            so your whole team can query data without writing a single line of code.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all text-sm shadow-xl shadow-indigo-950/60 hover:-translate-y-0.5">
              Start for free <ChevronRight size={15} />
            </Link>
            <a href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 hover:bg-white/5 text-white/70 hover:text-white font-medium px-7 py-3.5 rounded-xl transition-all text-sm">
              See how it works
            </a>
          </div>

          <div className={`relative transition-all duration-700 delay-300 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            {/* mascot peeks from BEHIND the terminal — z-0 so box covers its body */}
            <div className="absolute z-0 pointer-events-none" style={{ top: '-52px', left: '32px' }}>
              <MascotInline />
            </div>
            {/* terminal sits on top (z-10) so it masks the mascot's body */}
            <div className="relative z-10">
              <Terminal_ />
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mt-14 grid grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {[['10k+', 'Queries daily'], ['< 50ms', 'Avg execution'], ['99.9%', 'Uptime SLA']].map(([val, label]) => (
            <div key={label} className="bg-[#0d0d16] px-6 py-5 text-center">
              <div className="text-2xl font-bold text-white mb-0.5">{val}</div>
              <div className="text-xs text-white/35">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" ref={featRef} className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-500 ${featVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Everything your data team needs</h2>
            <p className="mt-4 text-white/40 max-w-xl mx-auto">From solo devs to analysts at scale — QueDB adapts to every workflow.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div key={title}
                className={`group bg-[#0d0d16] border border-white/5 hover:border-indigo-700/40 rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-950/40 ${featVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800/30 flex items-center justify-center mb-4 group-hover:bg-indigo-900/60 transition-colors">
                  <Icon size={18} className="text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" ref={howRef} className="py-28 px-6"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, #0f0b2a 0%, transparent 70%)' }}>
        <div className="max-w-4xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-500 ${howVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">How it works</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Live in four steps</h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-10 bottom-10 w-px bg-gradient-to-b from-indigo-600/50 via-violet-600/30 to-transparent hidden md:block" />
            <div className="space-y-6">
              {STEPS.map(({ n, title, desc }, i) => (
                <div key={n}
                  className={`flex gap-6 items-start transition-all duration-500 ${howVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}
                  style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[#0d0d16] border border-white/8 flex items-center justify-center">
                    <span className="text-lg font-bold text-indigo-400" style={{ fontFamily: 'DM Mono, monospace' }}>{n}</span>
                  </div>
                  <div className="pt-4">
                    <h3 className="font-semibold text-white mb-1">{title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative rounded-3xl p-14 overflow-hidden border border-indigo-700/30"
            style={{ background: 'radial-gradient(ellipse 80% 100% at 50% 120%, #1e1060 0%, #0d0d16 60%)' }}>
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
            <Database size={32} className="text-indigo-400 mx-auto mb-5" />
            <h2 className="text-4xl font-bold tracking-tight mb-4">Ready to query smarter?</h2>
            <p className="text-white/40 mb-8 leading-relaxed">
              Join developers and analysts already using QueDB to get answers from their databases — instantly.
            </p>
            <Link to="/register"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-all shadow-xl shadow-indigo-950/70 hover:-translate-y-0.5">
              Create free account <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <QueDBLogo size={26} />
            <span className="text-sm font-semibold">Que<span className="text-indigo-400">DB</span></span>
          </div>
          <p className="text-xs text-white/20">© {new Date().getFullYear()} QueDB. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
