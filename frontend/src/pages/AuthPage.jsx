import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Shield, CheckCircle, ArrowLeft, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'
import SheriffLogo from '../components/SheriffLogo'

const TIERS = [
  { id: 'free', name: 'Free Trial', price: '₹0/mo', desc: '1 month, 1 model, basic audit', color: '#8B949E' },
  { id: 'personal', name: 'Personal', price: '₹2,499/mo', desc: '5 models, full audit suite', color: '#F97316' },
  { id: 'enterprise', name: 'Enterprise', price: '₹24,999/mo', desc: 'Unlimited, compliance packs, SLA', color: '#A78BFA' },
]

export default function AuthPage() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login')
  const [tier, setTier] = useState('free')
  const [form, setForm] = useState({ email: '', password: '', full_name: '', company_name: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authKey, setAuthKey] = useState(null)
  const [copied, setCopied] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'register') {
        const { data } = await api.post('/auth/register', { ...form, tier })
        setAuth(data.access_token, data.user)
        setAuthKey(data.user.auth_key)
        toast.success(`Welcome to AI Sheriff, ${data.user.full_name}!`)
      } else {
        const p = new URLSearchParams()
        p.append('username', form.email)
        p.append('password', form.password)
        const { data } = await api.post('/auth/login', p, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
        setAuth(data.access_token, data.user)
        toast.success('Welcome back!')
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (authKey) {
    return (
      <div className="min-h-screen bg-sheriff-dark grid-bg flex items-center justify-center p-6">
        <div className="max-w-md w-full glass rounded-2xl p-8 text-center glow-orange">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.3)' }}>
            <CheckCircle size={32} className="text-green-400"/>
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-sheriff-muted mb-6 text-sm">Save your authentication key — you'll need it to access the API.</p>
          <div className="bg-sheriff-dark rounded-xl p-4 mb-6 font-mono text-sm border border-sheriff-border">
            <div className="text-xs text-sheriff-muted mb-2 text-left">YOUR AUTH KEY</div>
            <div className="text-orange-400 break-all text-left">{authKey}</div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { navigator.clipboard.writeText(authKey); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
              className="flex-1 glass py-2.5 rounded-lg text-sm font-medium text-white hover:border-orange-500/40 transition-all flex items-center justify-center gap-2">
              {copied ? <><Check size={14} className="text-green-400"/> Copied!</> : <><Copy size={14}/> Copy Key</>}
            </button>
            <button onClick={() => navigate('/dashboard')} className="flex-1 btn-sheriff text-white py-2.5 rounded-lg text-sm font-semibold">
              Go to Dashboard →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sheriff-dark grid-bg flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sheriff-muted hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={16}/> Back to home
        </button>
        <div className="glass rounded-2xl p-8">
          <div className="flex justify-center mb-6"><SheriffLogo size={44}/></div>
          <div className="flex bg-sheriff-dark-3 rounded-xl p-1 mb-8">
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${mode === m ? 'bg-orange-500 text-white' : 'text-sheriff-muted hover:text-white'}`}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <input required value={form.full_name} onChange={set('full_name')} placeholder="Full Name"
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-sheriff-muted/50 bg-transparent focus:outline-none focus:border-orange-500/50 text-sm"/>
            )}
            <input required type="email" value={form.email} onChange={set('email')} placeholder="Email address"
              className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-sheriff-muted/50 bg-transparent focus:outline-none focus:border-orange-500/50 text-sm"/>
            <div className="relative">
              <input required type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Password"
                className="w-full glass rounded-xl px-4 py-3 pr-11 text-white placeholder:text-sheriff-muted/50 bg-transparent focus:outline-none focus:border-orange-500/50 text-sm"/>
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sheriff-muted hover:text-white">
                {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            {mode === 'register' && (
              <>
                <div>
                  <div className="text-xs text-sheriff-muted font-medium mb-2 uppercase tracking-wider">Select Plan</div>
                  <div className="space-y-2">
                    {TIERS.map(t => (
                      <button key={t.id} type="button" onClick={() => setTier(t.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left border ${tier === t.id ? '' : 'glass hover:border-orange-500/20'}`}
                        style={tier === t.id ? { background: `${t.color}15`, border: `1px solid ${t.color}40` } : {}}>
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: t.color }}>
                          {tier === t.id && <div className="w-2 h-2 rounded-full" style={{ background: t.color }}/>}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{t.name}</span>
                            {t.id === 'free' && <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">1 month free</span>}
                          </div>
                          <div className="text-xs text-sheriff-muted">{t.desc}</div>
                        </div>
                        <div className="text-xs font-mono" style={{ color: t.color }}>{t.price}</div>
                      </button>
                    ))}
                  </div>
                </div>
                {tier === 'enterprise' && (
                  <input value={form.company_name} onChange={set('company_name')} placeholder="Company Name (required for Enterprise)"
                    className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-sheriff-muted/50 bg-transparent focus:outline-none focus:border-orange-500/50 text-sm"/>
                )}
                {(tier === 'personal' || tier === 'enterprise') && (
                  <div className="glass-orange rounded-xl p-3 text-xs text-orange-400 flex items-start gap-2">
                    <Shield size={14} className="mt-0.5 flex-shrink-0"/>
                    <span>Payment integration required for paid tiers. For this demo, all features are unlocked for 30 days free.</span>
                  </div>
                )}
              </>
            )}
            <button type="submit" disabled={loading}
              className="w-full btn-sheriff text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Processing...</> : (mode === 'login' ? 'Sign In to Dashboard' : 'Create Account')}
            </button>
          </form>
          <p className="text-center text-xs text-sheriff-muted mt-6">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-orange-500 hover:text-orange-400 font-medium">
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}