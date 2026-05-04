import { useEffect, useState } from 'react'
import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

const SIZE_CONFIG = {
  sm: { w: 160, ring: 44, fs: 18, sub: 9, pad: 10 },
  md: { w: 200, ring: 64, fs: 24, sub: 11, pad: 16 },
  lg: { w: 280, ring: 90, fs: 32, sub: 13, pad: 22 },
}

function getRiskConfig(score) {
  if (!score || score === 0) return { color: '#30363D', label: 'NOT AUDITED', Icon: Shield }
  if (score >= 80) return { color: '#3FB950', label: 'LOW RISK', Icon: CheckCircle }
  if (score >= 60) return { color: '#F97316', label: 'MEDIUM RISK', Icon: AlertTriangle }
  if (score >= 40) return { color: '#D29922', label: 'HIGH RISK', Icon: AlertTriangle }
  return { color: '#F85149', label: 'CRITICAL RISK', Icon: XCircle }
}

export default function LiveTrustBadge({ modelId, modelName = 'AI System', score = 0, size = 'md', showDetails = true, compact = false, className = '' }) {
  const [animScore, setAnimScore] = useState(0)
  const cfg = SIZE_CONFIG[size] || SIZE_CONFIG.md
  const risk = getRiskConfig(score)
  const radius = cfg.ring / 2 - 5
  const circ = 2 * Math.PI * radius
  const offset = circ - (animScore / 100) * circ

  useEffect(() => {
    const t = setTimeout(() => setAnimScore(score || 0), 300)
    return () => clearTimeout(t)
  }, [score])

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${className}`}
        style={{ background: `${risk.color}15`, border: `1px solid ${risk.color}40` }}>
        <risk.Icon size={13} style={{ color: risk.color }} />
        <span className="text-xs font-mono font-semibold" style={{ color: risk.color }}>{score > 0 ? `${score}/100` : '—'}</span>
        <span className="text-xs font-medium" style={{ color: risk.color }}>{risk.label}</span>
        <span className="text-xs text-gray-500 ml-1">AI Sheriff</span>
      </div>
    )
  }

  return (
    <div className={`inline-flex flex-col items-center rounded-2xl ${className}`}
      style={{ width: cfg.w, background: '#161B22', border: `1px solid ${risk.color}30`, padding: cfg.pad, boxShadow: `0 0 20px ${risk.color}15` }}>
      <div className="relative mb-2">
        <svg width={cfg.ring} height={cfg.ring} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cfg.ring/2} cy={cfg.ring/2} r={radius} fill="none" stroke="#1C2333" strokeWidth={size === 'lg' ? 6 : 5} />
          <circle cx={cfg.ring/2} cy={cfg.ring/2} r={radius} fill="none" stroke={risk.color} strokeWidth={size === 'lg' ? 6 : 5}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold text-white" style={{ fontSize: cfg.fs }}>{score > 0 ? Math.round(animScore) : '—'}</span>
        </div>
      </div>
      <div className="text-center">
        <div className="font-semibold text-white truncate max-w-full" style={{ fontSize: cfg.sub + 2 }}>{modelName}</div>
        <div className="font-mono font-bold mt-0.5" style={{ fontSize: cfg.sub - 1, color: risk.color }}>{risk.label}</div>
      </div>
      {showDetails && (
        <div className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg py-1.5"
          style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}>
          <svg width="12" height="12" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="none" stroke="#F97316" strokeWidth="2"/>
            <path d="M20 6L30 11L30 22C30 29 25 34 20 36C15 34 10 29 10 22L10 11Z" fill="#F97316" opacity="0.7"/>
          </svg>
          <span className="text-xs font-semibold" style={{ color: '#F97316' }}>AI Sheriff</span>
          <span style={{ fontSize: 9, color: '#8B949E' }}>· Live Trust Score</span>
        </div>
      )}
    </div>
  )
}

export function BadgeShowcase({ score, modelName, modelId }) {
  const [copied, setCopied] = useState(false)
  const embedCode = `<!-- AI Sheriff Trust Badge -->
<script>
  fetch('https://api.aisheriff.com/public/badge/${modelId}')
    .then(r=>r.json())
    .then(d=>{
      document.getElementById('sheriff-badge').innerHTML =
        '<a href="https://aisheriff.com/trust?q=' + d.name + '">' +
        '<img src="https://aisheriff.com/badge/${modelId}.svg" alt="AI Sheriff Trust Score: ' + d.trust_score + '/100" />' +
        '</a>';
    });
</script>
<div id="sheriff-badge"></div>`

  const copy = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-4 font-medium">Badge Sizes</div>
        <div className="flex items-end gap-5 flex-wrap">
          {['sm', 'md', 'lg'].map(s => (
            <div key={s} className="flex flex-col items-center gap-2">
              <LiveTrustBadge score={score} modelName={modelName} size={s} />
              <span className="text-xs text-gray-500 font-mono">{s}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">Compact Pill</div>
        <LiveTrustBadge score={score} modelName={modelName} compact />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">Embed Code</div>
          <button onClick={copy} className="text-xs px-3 py-1 rounded-lg font-medium transition-all"
            style={{ background: copied ? 'rgba(63,185,80,0.15)' : 'rgba(249,115,22,0.1)', color: copied ? '#3FB950' : '#F97316', border: `1px solid ${copied ? 'rgba(63,185,80,0.3)' : 'rgba(249,115,22,0.25)'}` }}>
            {copied ? '✓ Copied!' : 'Copy snippet'}
          </button>
        </div>
        <pre className="text-xs font-mono text-orange-300 p-4 rounded-xl overflow-x-auto" style={{ background: '#0D1117', border: '1px solid #30363D' }}>
          {embedCode}
        </pre>
      </div>
    </div>
  )
}