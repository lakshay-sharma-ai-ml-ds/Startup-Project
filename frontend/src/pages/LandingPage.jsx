import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Zap, Eye, Globe, AlertTriangle, CheckCircle, ArrowRight, Mail, Star, Lock, Cpu } from 'lucide-react'
import SheriffLogo from '../components/SheriffLogo'

const FEATURES = [
  { icon: Zap, title: 'Adversarial Red-Teaming', desc: 'Thousands of bias, hallucination, toxicity & jailbreak probes run 24/7 against your model.', color: '#F97316' },
  { icon: Globe, title: 'Regulatory Auto-Mapping', desc: 'Behavior auto-mapped to EU AI Act, NIST RMF & India DPDP. Evidence packs generated instantly.', color: '#58A6FF' },
  { icon: Eye, title: 'Live Drift Detection', desc: 'The moment your model changes post-deployment, the trust score degrades automatically.', color: '#3FB950' },
  { icon: Shield, title: 'Living Trust Badge', desc: 'A public CIBIL-style score any company can display. Degrades in real time.', color: '#A78BFA' },
  { icon: AlertTriangle, title: 'Instant Alert System', desc: 'Notifies compliance teams the moment risk thresholds are breached — before regulators do.', color: '#D29922' },
  { icon: Cpu, title: 'Agentic AI Tracing', desc: 'Traces multi-step agent workflows. Identifies where in the chain trust breaks down.', color: '#F472B6' },
]

const STATS = [
  { val: '$50B+', label: 'AI Governance Market by 2030' },
  { val: 'Aug 2026', label: 'EU AI Act Compliance Deadline' },
  { val: '0', label: 'Real-time AI Trust Platforms Today' },
  { val: '€30M', label: 'Max EU Fine for Non-Compliance' },
]

const TIERS = [
  { name: 'Free Trial', price: '₹0', period: '/month', badge: '1 month free', color: '#8B949E', features: ['1 AI model', '50 adversarial tests', 'EU AI Act snapshot', 'Trust score dashboard', 'Email alerts'], cta: 'Start Free Trial', highlight: false },
  { name: 'Personal', price: '₹2,499', period: '/month', badge: 'Most popular', color: '#F97316', features: ['Up to 5 AI models', '500 tests/month', 'All 3 compliance frameworks', 'Real-time drift monitoring', 'Downloadable evidence packs', 'Living Trust Badge'], cta: 'Get Started', highlight: true },
  { name: 'Enterprise', price: '₹24,999', period: '/month', badge: 'For teams & regulators', color: '#A78BFA', features: ['Unlimited models', 'Unlimited auditing', 'Custom compliance frameworks', 'Agentic AI workflow tracing', 'Regulator-ready evidence packs', 'Dedicated compliance analyst', 'SLA + white-glove onboarding'], cta: 'Contact Sales', highlight: false },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const h = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <div className="min-h-screen bg-sheriff-dark overflow-x-hidden">
      <div className="scan-overlay"/>

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'glass border-b border-sheriff-border/50' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <SheriffLogo size={38}/>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Pricing', 'Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ','-')}`} className="text-sm text-sheriff-muted hover:text-white transition-colors font-medium">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/auth')} className="text-sm text-sheriff-muted hover:text-white transition-colors font-medium px-4 py-2">Sign In</button>
            <button onClick={() => navigate('/auth?mode=register')} className="btn-sheriff text-sm font-semibold text-white px-5 py-2 rounded-lg">Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center grid-bg pt-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #F97316, transparent)' }}/>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl" style={{ background: 'radial-gradient(circle, #58A6FF, transparent)' }}/>
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 glass-orange rounded-full px-4 py-2 mb-8 text-sm font-medium text-orange-400">
            <span className="status-dot orange"/>
            <span>EU AI Act deadline: August 2026 — Are you compliant?</span>
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
            The AI that<br/><span className="gradient-text text-glow">audits AI.</span>
          </h1>
          <p className="text-xl md:text-2xl text-sheriff-muted max-w-3xl mx-auto mb-4 font-light leading-relaxed">
            AI Sheriff is the world's first <strong className="text-white font-medium">living compliance engine</strong> for AI systems. Continuous red-teaming, regulatory auto-mapping, and a real-time trust score — all in one platform.
          </p>
          <p className="text-base text-sheriff-muted/70 max-w-xl mx-auto mb-12 font-mono">"Think CIBIL score for AI — but one that updates every time your model does."</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button onClick={() => navigate('/auth?mode=register')} className="btn-sheriff flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl text-lg">
              Start Free Trial <ArrowRight size={20}/>
            </button>
            <button onClick={() => navigate('/auth')} className="flex items-center gap-2 glass text-white font-medium px-8 py-4 rounded-xl text-lg hover:border-orange-500/40 transition-all">
              <Lock size={18} className="text-orange-500"/> Sign Into Dashboard
            </button>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-1 glow-orange" style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}>
              <div className="bg-sheriff-dark-2 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-sheriff-border/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60"/><div className="w-3 h-3 rounded-full bg-yellow-500/60"/><div className="w-3 h-3 rounded-full bg-green-500/60"/>
                  </div>
                  <div className="flex-1 mx-4 glass rounded px-3 py-1 text-xs text-sheriff-muted font-mono">app.aisheriff.com/dashboard</div>
                  <span className="text-xs text-green-400 font-mono flex items-center gap-1"><span className="status-dot green" style={{width:6,height:6}}/> LIVE</span>
                </div>
                <div className="p-6 grid grid-cols-4 gap-4">
                  {[{label:'Trust Score',val:'87.3',color:'#3FB950',bar:87},{label:'Bias Index',val:'94.1',color:'#F97316',bar:94},{label:'Hallucination',val:'91.7',color:'#58A6FF',bar:91},{label:'EU AI Act',val:'82.0',color:'#A78BFA',bar:82}].map(m => (
                    <div key={m.label} className="bg-sheriff-dark-3 rounded-lg p-3">
                      <div className="text-xs text-sheriff-muted mb-2">{m.label}</div>
                      <div className="text-2xl font-display font-bold" style={{ color: m.color }}>{m.val}</div>
                      <div className="mt-2 h-1 bg-sheriff-border rounded-full"><div className="h-full rounded-full" style={{ width: `${m.bar}%`, background: m.color }}/></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-sheriff-border/30 py-12 glass">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl font-bold gradient-text mb-1">{s.val}</div>
              <div className="text-xs text-sheriff-muted font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block text-xs font-mono text-orange-500 tracking-widest mb-4 uppercase">The Problem</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">AI makes life-changing decisions.<br/><span className="text-sheriff-muted">Nothing certifies it.</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[{icon:'🍽️',title:'Restaurants',sub:'Hygiene Rating ✓',desc:'Before you eat',color:'#3FB950',ok:true},{icon:'💊',title:'Medicines',sub:'FDA Approval ✓',desc:'Before you take',color:'#58A6FF',ok:true},{icon:'🤖',title:'AI Models',sub:'Nothing. Zero. ✗',desc:'Before it decides your life',color:'#F85149',ok:false}].map(item => (
            <div key={item.title} className={`glass rounded-2xl p-8 text-center border-2 ${item.ok ? 'border-sheriff-border/30' : 'border-red-500/40 bg-red-500/5'}`}>
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="font-display text-xl font-bold text-white mb-2">{item.title}</h3>
              <div className="font-medium mb-1" style={{ color: item.color }}>{item.sub}</div>
              <div className="text-sm text-sheriff-muted italic">{item.desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-8 glass-orange rounded-xl p-4 text-center">
          <p className="text-orange-400 italic text-sm">"You wouldn't eat at a restaurant with no hygiene rating — so why is your system running AI with none?"</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-mono text-orange-500 tracking-widest mb-4 uppercase">Five-Layer Intelligence Stack</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white">Built for the age of<br/><span className="gradient-text">accountable AI.</span></h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="glass rounded-2xl p-6 hover:border-orange-500/30 transition-all group cursor-default">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                <f.icon size={22} style={{ color: f.color }}/>
              </div>
              <div className="text-xs font-mono text-sheriff-muted mb-1">LAYER {String(i+1).padStart(2,'0')}</div>
              <h3 className="font-display text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-sheriff-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-sheriff-dark-2/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-mono text-orange-500 tracking-widest mb-4 uppercase">How It Works</div>
            <h2 className="font-display text-4xl font-bold text-white">From model to trust score in minutes.</h2>
          </div>
          <div className="space-y-4">
            {[
              {step:'01',title:'Register Your Model',desc:'Connect via API endpoint, upload a model artifact, or register an agentic workflow. Takes under 2 minutes.',color:'#F97316'},
              {step:'02',title:'Audit Engine Runs',desc:'AI Sheriff red-teams your model with thousands of adversarial, bias, hallucination, toxicity & jailbreak probes.',color:'#58A6FF'},
              {step:'03',title:'Compliance is Auto-Mapped',desc:"Your model's behavior is mapped to EU AI Act, NIST RMF, and India DPDP. Evidence packs generated in one click.",color:'#3FB950'},
              {step:'04',title:'Drift Monitor Watches 24/7',desc:'Post-deployment behavioral changes are tracked in real time. Trust score degrades the moment something shifts.',color:'#A78BFA'},
              {step:'05',title:'Alerts Fire Before Regulators Do',desc:'The moment a risk threshold is breached, your team is notified immediately — not weeks later.',color:'#D29922'},
            ].map(s => (
              <div key={s.step} className="flex gap-6 glass rounded-xl p-6 hover:border-orange-500/20 transition-all">
                <div className="font-display text-4xl font-black opacity-20" style={{ color: s.color, minWidth: 60 }}>{s.step}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={16} style={{ color: s.color }}/>
                    <h3 className="font-display font-bold text-white">{s.title}</h3>
                  </div>
                  <p className="text-sm text-sheriff-muted">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-mono text-orange-500 tracking-widest mb-4 uppercase">Pricing</div>
          <h2 className="font-display text-4xl font-bold text-white mb-4">Start free. Scale with confidence.</h2>
          <p className="text-sheriff-muted">1 month free trial for everyone. No credit card required.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TIERS.map(tier => (
            <div key={tier.name} className={`rounded-2xl p-8 flex flex-col transition-all ${tier.highlight ? 'glow-orange' : 'glass'}`}
              style={tier.highlight ? { background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(234,88,12,0.05))', border: '1px solid rgba(249,115,22,0.4)' } : {}}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-white">{tier.name}</h3>
                <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: `${tier.color}20`, color: tier.color }}>{tier.badge}</span>
              </div>
              <div className="mb-6">
                <span className="font-display text-4xl font-black text-white">{tier.price}</span>
                <span className="text-sheriff-muted text-sm ml-1">{tier.period}</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle size={15} className="mt-0.5 flex-shrink-0" style={{ color: tier.color }}/>
                    <span className="text-sheriff-muted">{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/auth?mode=register')}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${tier.highlight ? 'btn-sheriff text-white' : 'glass hover:border-orange-500/40 text-white'}`}>
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-xs font-mono text-orange-500 tracking-widest mb-4 uppercase">Stay Updated</div>
          <h2 className="font-display text-4xl font-bold text-white mb-4">Get the latest on AI compliance.</h2>
          <p className="text-sheriff-muted mb-8">EU AI Act updates, regulatory news, and AI Sheriff product releases — delivered to your inbox.</p>
          {subscribed ? (
            <div className="glass-orange rounded-xl p-6 flex items-center justify-center gap-3">
              <CheckCircle className="text-orange-500"/>
              <span className="text-orange-400 font-medium">You're on the list. We'll be in touch.</span>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); if (email) { setSubscribed(true); setEmail('') }}} className="flex gap-3">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                className="flex-1 glass rounded-xl px-4 py-3 text-white placeholder:text-sheriff-muted/50 focus:outline-none focus:border-orange-500/50 transition-all bg-transparent"/>
              <button type="submit" className="btn-sheriff text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 whitespace-nowrap">
                <Mail size={16}/> Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="border-t border-sheriff-border/30 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <SheriffLogo size={32}/>
          <div className="text-sm text-sheriff-muted text-center">© 2025 AI Sheriff — Team SHERIFF, IIIT Delhi. <span className="text-orange-500">Audit. Comply. Trust.</span></div>
          <div className="flex items-center gap-1 text-xs text-sheriff-muted/50"><Star size={12} className="text-orange-500"/> Built for the AI governance era</div>
        </div>
      </footer>
    </div>
  )
}