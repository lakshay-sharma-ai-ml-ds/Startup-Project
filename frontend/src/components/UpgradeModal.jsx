import { useState } from 'react'
import { X, Check, Zap, Shield } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../utils/api'

const TIERS = [
  {
    id: 'personal', label: 'Personal', monthly: 2499, annual: 24990,
    color: '#F97316', icon: Zap,
    features: ['Up to 5 models', '500 adversarial tests/mo', 'All 3 compliance frameworks', 'Real-time drift monitoring', 'Downloadable evidence packs', 'Living Trust Badge'],
  },
  {
    id: 'enterprise', label: 'Enterprise', monthly: 24999, annual: 249990,
    color: '#A78BFA', icon: Shield,
    features: ['Unlimited models', 'Unlimited testing', 'Custom compliance frameworks', 'Agentic AI workflow tracing', 'Regulator-ready evidence packs', 'Dedicated compliance analyst', 'SLA + white-glove onboarding'],
    highlight: true,
  },
]

export default function UpgradeModal({ onClose }) {
  const [billing, setBilling] = useState('monthly')
  const [selected, setSelected] = useState('personal')

  const checkout = useMutation({
    mutationFn: ({ tier, billing }) => api.post('/payments/create-checkout', { tier, billing }),
    onSuccess: (res) => {
      if (res.data.mode === 'demo') {
        toast.success('Demo mode: Set STRIPE_SECRET_KEY in .env to enable real payments.')
        onClose()
      } else {
        window.location.href = res.data.session_url
      }
    },
    onError: () => toast.error('Failed to start checkout'),
  })

  const fmt = (n) => `₹${(n / 100).toLocaleString('en-IN')}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="glass rounded-2xl w-full max-w-2xl shadow-2xl" style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
        <div className="flex items-center justify-between p-6 border-b border-sheriff-border/50">
          <div>
            <h2 className="font-display text-xl font-bold text-white">Upgrade Your Plan</h2>
            <p className="text-sm text-sheriff-muted mt-0.5">Unlock full AI governance capabilities</p>
          </div>
          <button onClick={onClose} className="text-sheriff-muted hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"><X size={18} /></button>
        </div>

        <div className="flex justify-center pt-5 px-6">
          <div className="flex bg-sheriff-dark-3 rounded-xl p-1">
            {['monthly', 'annual'].map(b => (
              <button key={b} onClick={() => setBilling(b)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${billing === b ? 'bg-orange-500 text-white' : 'text-sheriff-muted hover:text-white'}`}>
                {b}
                {b === 'annual' && <span className="ml-1.5 text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Save 17%</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-6">
          {TIERS.map(tier => (
            <div key={tier.id} onClick={() => setSelected(tier.id)}
              className={`rounded-2xl p-5 cursor-pointer transition-all border ${selected === tier.id ? '' : 'glass hover:border-orange-500/20'}`}
              style={selected === tier.id ? { background: `${tier.color}10`, border: `1px solid ${tier.color}40`, boxShadow: `0 0 20px ${tier.color}15` } : {}}>
              {tier.highlight && (
                <div className="text-xs font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full inline-block mb-3">★ Most powerful</div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${tier.color}15` }}>
                  <tier.icon size={16} style={{ color: tier.color }} />
                </div>
                <span className="font-display font-bold text-white">{tier.label}</span>
                <div className="ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: tier.color }}>
                  {selected === tier.id && <div className="w-2 h-2 rounded-full" style={{ background: tier.color }} />}
                </div>
              </div>
              <div className="mb-4">
                <span className="font-display text-2xl font-bold text-white">
                  {fmt(billing === 'monthly' ? tier.monthly : Math.round(tier.annual / 12))}
                </span>
                <span className="text-sheriff-muted text-sm">/month</span>
                {billing === 'annual' && <div className="text-xs text-green-400 mt-0.5">Billed {fmt(tier.annual)}/year</div>}
              </div>
              <ul className="space-y-1.5">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <Check size={12} className="mt-0.5 flex-shrink-0" style={{ color: tier.color }} />
                    <span className="text-sheriff-muted">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={() => checkout.mutate({ tier: selected, billing })}
            disabled={checkout.isPending}
            className="w-full btn-sheriff text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {checkout.isPending
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
              : <>Upgrade to {TIERS.find(t => t.id === selected)?.label} →</>
            }
          </button>
          <p className="text-xs text-center text-sheriff-muted/50 mt-3">Secured by Stripe · Cancel anytime · 14-day money-back guarantee</p>
        </div>
      </div>
    </div>
  )
}