import { useState } from 'react'
import { Search, Shield, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react'
import SheriffLogo from '../components/SheriffLogo'
import TrustScoreRing from '../components/TrustScoreRing'
import { useNavigate } from 'react-router-dom'

const DEMO_MODELS = {
  'gpt-4-sheriff': { name: 'GPT-4 Turbo', org: 'OpenAI', trust_score: 84.2, risk_level: 'Low', model_type: 'LLM', last_audited: '2025-03-15', eu_ai_act: 81, nist_rmf: 86, india_dpdp: 79, status: 'certified' },
  'claude-3-sheriff': { name: 'Claude 3 Opus', org: 'Anthropic', trust_score: 91.7, risk_level: 'Low', model_type: 'LLM', last_audited: '2025-03-20', eu_ai_act: 94, nist_rmf: 92, india_dpdp: 88, status: 'certified' },
  'hr-bot-acme': { name: 'ACME HR Screening Bot', org: 'ACME Corp', trust_score: 47.3, risk_level: 'High', model_type: 'Agent', last_audited: '2025-02-28', eu_ai_act: 42, nist_rmf: 51, india_dpdp: 48, status: 'flagged' },
  'loan-model-v2': { name: 'LoanDecide v2', org: 'FinTech Solutions', trust_score: 63.8, risk_level: 'Medium', model_type: 'ML Model', last_audited: '2025-03-10', eu_ai_act: 68, nist_rmf: 62, india_dpdp: 60, status: 'active' },
}

const RISK_CONFIG = {
  Low: { color: '#3FB950', badge: 'bg-green-500/15 text-green-400 border-green-500/30' },
  Medium: { color: '#F97316', badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  High: { color: '#D29922', badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  Critical: { color: '#F85149', badge: 'bg-red-500/15 text-red-400 border-red-500/30' },
}

export default function TrustBadgePage() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    const key = Object.keys(DEMO_MODELS).find(k =>
      DEMO_MODELS[k].name.toLowerCase().includes(query.toLowerCase()) ||
      DEMO_MODELS[k].org.toLowerCase().includes(query.toLowerCase()) ||
      k.includes(query.toLowerCase())
    )
    if (key) { setResult(DEMO_MODELS[key]); setNotFound(false) }
    else { setResult(null); setNotFound(true) }
  }

  const risk = result ? RISK_CONFIG[result.risk_level] : null

  return (
    <div className="min-h-screen bg-sheriff-dark grid-bg">
      <div className="scan-overlay"/>
      <nav className="glass border-b border-sheriff-border/30 px-6 py-4 flex items-center justify-between">
        <SheriffLogo size={36}/>
        <div className="flex gap-3">
          <button onClick={() => navigate('/')} className="text-sm text-sheriff-muted hover:text-white transition-colors">Home</button>
          <button onClick={() => navigate('/auth')} className="btn-sheriff text-white text-sm font-semibold px-4 py-2 rounded-lg">Dashboard</button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass-orange rounded-full px-4 py-2 mb-6 text-sm text-orange-400 font-medium">
            <Shield size={14}/> Public Trust Registry
          </div>
          <h1 className="font-display text-5xl font-bold text-white mb-4">Look up any AI's<br/><span className="gradient-text">Trust Score.</span></h1>
          <p className="text-sheriff-muted text-lg max-w-xl mx-auto">AI Sheriff's public registry lets anyone verify whether an AI system has been audited, certified, and is behaving safely — right now.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sheriff-muted"/>
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search by model name, company, or ID... (try 'Claude', 'ACME', 'Loan')"
              className="w-full glass rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-sheriff-muted/40 bg-transparent focus:outline-none focus:border-orange-500/50 text-sm"/>
          </div>
          <button type="submit" className="btn-sheriff text-white font-semibold px-6 py-3.5 rounded-xl text-sm flex items-center gap-2">
            <Search size={15}/> Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {Object.values(DEMO_MODELS).map(m => (
            <button key={m.name} onClick={() => { setQuery(m.name); setResult(m); setNotFound(false) }}
              className="glass text-xs text-sheriff-muted px-3 py-1.5 rounded-full hover:text-white hover:border-orange-500/30 transition-all">
              {m.name}
            </button>
          ))}
        </div>

        {result && (
          <div className="glass rounded-2xl overflow-hidden glow-orange-sm">
            <div className="flex items-center justify-between px-6 py-3 border-b border-sheriff-border/30"
              style={{ background: result.status==='flagged'?'rgba(248,81,73,0.08)':result.status==='certified'?'rgba(63,185,80,0.08)':'rgba(249,115,22,0.05)' }}>
              <div className="flex items-center gap-2">
                {result.status==='certified' && <CheckCircle size={16} className="text-green-400"/>}
                {result.status==='flagged' && <XCircle size={16} className="text-red-400"/>}
                {result.status==='active' && <AlertTriangle size={16} className="text-orange-400"/>}
                <span className="text-sm font-semibold" style={{ color: result.status==='flagged'?'#F85149':result.status==='certified'?'#3FB950':'#F97316' }}>
                  {result.status==='certified'?'Sheriff Certified':result.status==='flagged'?'Flagged — Risk Detected':'Monitored'}
                </span>
              </div>
              <span className="text-xs font-mono text-sheriff-muted">Last audited: {result.last_audited}</span>
            </div>
            <div className="p-6 grid md:grid-cols-3 gap-6 items-center">
              <div className="flex justify-center"><TrustScoreRing score={result.trust_score} size={140}/></div>
              <div className="md:col-span-2">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-white">{result.name}</h2>
                    <p className="text-sheriff-muted text-sm">{result.org} · {result.model_type}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${risk?.badge || ''}`}>{result.risk_level} Risk</span>
                </div>
                <div className="space-y-3">
                  {[{label:'🇪🇺 EU AI Act',score:result.eu_ai_act,color:'#58A6FF'},{label:'🇺🇸 NIST RMF',score:result.nist_rmf,color:'#3FB950'},{label:'🇮🇳 India DPDP',score:result.india_dpdp,color:'#F97316'}].map(f => (
                    <div key={f.label} className="flex items-center gap-3">
                      <span className="text-xs text-sheriff-muted w-28 flex-shrink-0">{f.label}</span>
                      <div className="flex-1 h-2 bg-sheriff-border/40 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${f.score}%`, background: f.color }}/>
                      </div>
                      <span className="text-xs font-mono font-bold w-8 text-right" style={{ color: f.color }}>{f.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-sheriff-border/30 px-6 py-4 bg-sheriff-dark/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-sheriff-muted font-medium">Embed this badge on your website</span>
                <ExternalLink size={12} className="text-sheriff-muted"/>
              </div>
              <code className="text-xs font-mono text-orange-400 bg-sheriff-dark rounded p-2 block break-all">
                {`<img src="https://aisheriff.com/badge/${result.name.toLowerCase().replace(/\s/g,'-')}" alt="AI Sheriff Trust Badge" />`}
              </code>
            </div>
          </div>
        )}

        {notFound && (
          <div className="text-center py-12 glass rounded-2xl">
            <Shield size={40} className="text-sheriff-border mx-auto mb-3"/>
            <h3 className="font-display text-lg font-bold text-white mb-2">Not Found in Registry</h3>
            <p className="text-sheriff-muted text-sm mb-4">This AI system hasn't been registered with AI Sheriff yet.</p>
            <button onClick={() => navigate('/auth?mode=register')} className="btn-sheriff text-white text-sm font-semibold px-5 py-2.5 rounded-xl">Register Your Model →</button>
          </div>
        )}
      </div>
    </div>
  )
}