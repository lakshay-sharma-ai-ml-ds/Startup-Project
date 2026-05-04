import { useState } from 'react'
import { Copy, Check, Key, User, Shield, CreditCard, ExternalLink, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { BadgeShowcase } from '../components/LiveTrustBadge'
import { useSelectedModel } from '../hooks/useModelData'
import UpgradeModal from '../components/UpgradeModal'

const TIER_DETAILS = {
  free:       { label: 'Free Trial', color: '#8B949E', models: 1, tests: 50, frameworks: 1 },
  personal:   { label: 'Personal',   color: '#58A6FF', models: 5, tests: 500, frameworks: 3 },
  enterprise: { label: 'Enterprise', color: '#F97316', models: '∞', tests: '∞', frameworks: '∞ + custom' },
}

function CopyField({ label, value, mono = true }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success('Copied!') }
  return (
    <div className="glass rounded-xl p-4">
      <div className="text-xs text-sheriff-muted uppercase tracking-wider mb-2">{label}</div>
      <div className="flex items-center gap-3">
        <span className={`flex-1 text-sm text-white truncate ${mono ? 'font-mono' : ''}`}>{value}</span>
        <button onClick={copy} className="flex-shrink-0 p-1.5 rounded-lg text-sheriff-muted hover:text-white hover:bg-white/5 transition-all">
          {copied ? <Check size={14} className="text-green-400"/> : <Copy size={14}/>}
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { model, modelId } = useSelectedModel()
  const tier = TIER_DETAILS[user?.tier] || TIER_DETAILS.free
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <div className="p-6 space-y-8 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-sheriff-muted mt-1">Account, API access, and subscription management.</p>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4"><User size={16} className="text-orange-500"/><h2 className="font-display font-bold text-white">Account</h2></div>
        <div className="space-y-3">
          <CopyField label="Full Name" value={user?.full_name || '—'} mono={false}/>
          <CopyField label="Email" value={user?.email || '—'} mono={false}/>
          {user?.company_name && <CopyField label="Company" value={user.company_name} mono={false}/>}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4"><Key size={16} className="text-orange-500"/><h2 className="font-display font-bold text-white">API Access</h2></div>
        <div className="space-y-3">
          <CopyField label="Your Auth Key" value={user?.auth_key || '—'}/>
          <div className="glass rounded-xl p-4 text-sm text-sheriff-muted">
            Use this key in the <code className="text-orange-400 font-mono">Authorization: Bearer YOUR_KEY</code> header when calling the AI Sheriff API directly.
            <a href="http://localhost:8000/docs" target="_blank" rel="noopener" className="flex items-center gap-1 text-orange-500 hover:text-orange-400 mt-2 text-xs">
              <ExternalLink size={12}/> View API Docs
            </a>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4"><CreditCard size={16} className="text-orange-500"/><h2 className="font-display font-bold text-white">Subscription</h2></div>
        <div className="glass rounded-2xl p-6 border" style={{ borderColor: `${tier.color}30` }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-display text-xl font-bold text-white">{tier.label}</div>
              <div className="text-xs text-sheriff-muted mt-0.5">
                {user?.tier === 'free' ? `Free trial started: ${user?.trial_start ? new Date(user.trial_start).toLocaleDateString() : '—'}` : 'Active subscription'}
              </div>
            </div>
            <span className="text-sm font-mono px-3 py-1 rounded-full" style={{ background: `${tier.color}15`, color: tier.color }}>{user?.tier?.toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[{label:'Models',val:tier.models},{label:'Tests/Month',val:tier.tests},{label:'Frameworks',val:tier.frameworks}].map(m => (
              <div key={m.label} className="text-center p-3 rounded-xl bg-sheriff-dark/50">
                <div className="font-display text-xl font-bold" style={{ color: tier.color }}>{m.val}</div>
                <div className="text-xs text-sheriff-muted mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
          {user?.tier !== 'enterprise' && (
            <button onClick={() => setShowUpgrade(true)} className="w-full btn-sheriff text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
              <Zap size={15}/> Upgrade Plan →
            </button>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4"><Shield size={16} className="text-orange-500"/><h2 className="font-display font-bold text-white">Usage</h2></div>
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-sheriff-muted">Models Registered</span>
            <span className="font-mono text-white">{user?.models_registered || 0} / {tier.models}</span>
          </div>
          {typeof tier.models === 'number' && (
            <div className="h-2 bg-sheriff-border/40 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-orange-500 transition-all duration-1000" style={{ width: `${Math.min(100, ((user?.models_registered || 0) / tier.models) * 100)}%` }}/>
            </div>
          )}
        </div>
      </section>

      {model && (
        <section>
          <div className="flex items-center gap-2 mb-4"><Shield size={16} className="text-orange-500"/><h2 className="font-display font-bold text-white">Living Trust Badge</h2></div>
          <div className="glass rounded-2xl p-6">
            <p className="text-sm text-sheriff-muted mb-6 leading-relaxed">
              Embed AI Sheriff's live trust badge on your product page, docs, or GitHub README. The score updates automatically every time your model is re-audited.
            </p>
            <BadgeShowcase score={model.trust_score} modelName={model.name} modelId={modelId}/>
          </div>
        </section>
      )}

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)}/>}
    </div>
  )
}