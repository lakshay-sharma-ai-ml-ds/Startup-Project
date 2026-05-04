import { useQuery } from '@tanstack/react-query'
import { Zap, Scale, TrendingDown, Bell, AlertTriangle, CheckCircle, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import TrustScoreRing from '../components/TrustScoreRing'
import MetricCard from '../components/MetricCard'
import api from '../utils/api'

function EmptyState({ onRegister }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.08)', border: '2px dashed rgba(249,115,22,0.3)' }}>
          <Shield size={40} className="text-orange-500/50"/>
        </div>
      </div>
      <div className="text-center max-w-sm">
        <h3 className="font-display text-xl font-bold text-white mb-2">No model selected</h3>
        <p className="text-sheriff-muted text-sm mb-6">Register an AI model or agent to begin auditing, compliance mapping, and 24/7 trust monitoring.</p>
        <button onClick={onRegister} className="btn-sheriff text-white font-semibold px-6 py-3 rounded-xl text-sm">Register Your First Model →</button>
      </div>
    </div>
  )
}

function StatusPill({ status }) {
  const map = { active: ['#3FB950', 'ACTIVE'], auditing: ['#F97316', 'AUDITING...'], pending: ['#8B949E', 'PENDING'], flagged: ['#F85149', 'FLAGGED'] }
  const [color, label] = map[status] || ['#8B949E', status?.toUpperCase()]
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full" style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color, animation: status === 'active' || status === 'auditing' ? 'pulse 2s infinite' : 'none' }}/>{label}
    </span>
  )
}

export default function HomeDashboard() {
  const { selectedModelId } = useAuthStore()
  const navigate = useNavigate()

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard', selectedModelId],
    queryFn: () => api.get(`/dashboard/summary/${selectedModelId}`).then(r => r.data),
    enabled: !!selectedModelId,
    refetchInterval: 20000,
  })

  if (!selectedModelId) return <EmptyState onRegister={() => navigate('/dashboard/registry')}/>
  if (isLoading) return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"/>
        <span className="text-sheriff-muted text-sm font-mono">Loading intelligence stack...</span>
      </div>
    </div>
  )

  const m = summary?.model
  const audit = summary?.audit
  const comp = summary?.compliance
  const drift = summary?.drift
  const alertCount = summary?.alerts?.unread || 0

  const layers = [
    { num: '01', label: 'Audit Engine', icon: Zap, color: '#F97316', status: audit?.total_tests > 0 ? 'active' : 'pending', value: audit?.pass_rate, unit: '% pass rate', sub: `${audit?.total_tests || 0} tests run` },
    { num: '02', label: 'Compliance Engine', icon: Scale, color: '#58A6FF', status: comp?.overall ? 'active' : 'pending', value: comp?.overall ? Math.round(comp.overall) : null, unit: '% overall', sub: `${comp?.gaps_count || 0} gaps found` },
    { num: '03', label: 'Drift Monitor', icon: TrendingDown, color: '#3FB950', status: drift?.drift_detected ? 'flagged' : 'active', value: null, unit: '', sub: drift?.drift_detected ? `⚠ Drift: ${drift.severity}` : 'No drift detected' },
    { num: '04', label: 'Trust Badge', icon: Shield, color: '#A78BFA', status: m?.trust_score > 0 ? 'active' : 'pending', value: m?.trust_score, unit: '/100', sub: m?.risk_level || 'Not Yet Audited' },
    { num: '05', label: 'Alert System', icon: Bell, color: '#D29922', status: alertCount > 0 ? 'flagged' : 'active', value: alertCount, unit: ' unread', sub: 'Live monitoring active' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-2xl font-bold text-white">{m?.name}</h1>
            <StatusPill status={m?.status}/>
          </div>
          <div className="flex items-center gap-4 text-xs text-sheriff-muted font-mono">
            <span className="capitalize">Type: {m?.model_type?.replace('_',' ')}</span>
            {m?.last_audited && <span>Last audited: {new Date(m.last_audited).toLocaleString()}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/dashboard/audit')} className="glass text-white text-sm font-medium px-4 py-2 rounded-lg hover:border-orange-500/40 transition-all flex items-center gap-2">
            <Zap size={14} className="text-orange-500"/> Run Audit
          </button>
          <button onClick={() => navigate('/dashboard/compliance')} className="btn-sheriff text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2">
            <Scale size={14}/> Check Compliance
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 grid md:grid-cols-4 gap-6">
        <div className="flex items-center justify-center"><TrustScoreRing score={m?.trust_score} size={160}/></div>
        <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard label="Bias Score" value={audit?.bias_score ? Math.round(audit.bias_score) : 'N/A'} unit={audit?.bias_score ? '%' : ''} sub="Lower = more biased" color="#F97316" icon={<AlertTriangle size={14}/>}/>
          <MetricCard label="Hallucination Res." value={audit?.hallucination_score ? Math.round(audit.hallucination_score) : 'N/A'} unit={audit?.hallucination_score ? '%' : ''} sub="Higher = more accurate" color="#58A6FF" icon={<CheckCircle size={14}/>}/>
          <MetricCard label="Toxicity Shield" value={audit?.toxicity_score ? Math.round(audit.toxicity_score) : 'N/A'} unit={audit?.toxicity_score ? '%' : ''} sub="Higher = safer" color="#3FB950" icon={<Shield size={14}/>}/>
          <MetricCard label="Jailbreak Resistance" value={audit?.jailbreak_resistance ? Math.round(audit.jailbreak_resistance) : 'N/A'} unit={audit?.jailbreak_resistance ? '%' : ''} color="#A78BFA"/>
          <MetricCard label="Tests Run" value={audit?.total_tests || 0} sub={`${audit?.passed || 0} passed, ${audit?.failed || 0} failed`} color="#F97316" icon={<Zap size={14}/>}/>
          <MetricCard label="Risk Level" value={m?.risk_level || 'N/A'} color={m?.risk_level === 'Low' ? '#3FB950' : m?.risk_level === 'Critical' ? '#F85149' : '#F97316'}/>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[{label:'EU AI Act',score:comp?.eu_ai_act,color:'#58A6FF',deadline:'Deadline: Aug 2026'},{label:'NIST RMF',score:comp?.nist_rmf,color:'#3FB950',deadline:'US Federal Framework'},{label:'India DPDP Act',score:comp?.india_dpdp,color:'#A78BFA',deadline:'India Data Protection'}].map(f => (
          <div key={f.label} className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-sheriff-muted uppercase tracking-wider">{f.label}</span>
              <span className="text-xs text-sheriff-muted/50 font-mono">{f.deadline}</span>
            </div>
            <div className="font-display text-3xl font-bold mb-1" style={{ color: f.score ? f.color : '#30363D' }}>
              {f.score ? `${Math.round(f.score)}` : '—'}
              {f.score ? <span className="text-base font-normal ml-1 text-sheriff-muted">/100</span> : ''}
            </div>
            <div className="mt-3 h-1.5 bg-sheriff-border/50 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${f.score || 0}%`, background: f.color }}/>
            </div>
            {!f.score && <div className="text-xs text-sheriff-muted mt-1">Run compliance engine</div>}
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-display text-lg font-bold text-white">Five-Layer Intelligence Stack</h2>
          <span className="text-xs text-sheriff-muted font-mono">— Live Status</span>
        </div>
        <div className="space-y-2">
          {layers.map(layer => (
            <div key={layer.num} className="glass rounded-xl p-4 flex items-center gap-4 hover:border-orange-500/20 transition-all">
              <div className="font-display text-2xl font-black text-sheriff-border w-8 flex-shrink-0">{layer.num}</div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${layer.color}15` }}>
                <layer.icon size={16} style={{ color: layer.color }}/>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{layer.label}</div>
                <div className="text-xs text-sheriff-muted">{layer.sub}</div>
              </div>
              <div className="text-right">
                {layer.value !== null && layer.value !== undefined && layer.value !== 0 ? (
                  <div className="font-display text-xl font-bold" style={{ color: layer.color }}>
                    {typeof layer.value === 'number' ? Math.round(layer.value) : layer.value}{layer.unit}
                  </div>
                ) : (
                  <div className="text-sm text-sheriff-muted/50 font-mono">—</div>
                )}
              </div>
              <StatusPill status={layer.status}/>
            </div>
          ))}
        </div>
      </div>

      {drift && (
        <div className={`glass rounded-xl p-4 flex items-center gap-4 border ${drift.drift_detected ? 'border-red-500/30 bg-red-500/5' : 'border-green-500/20 bg-green-500/5'}`}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: drift.drift_detected ? 'rgba(248,81,73,0.1)' : 'rgba(63,185,80,0.1)' }}>
            <TrendingDown size={20} className={drift.drift_detected ? 'text-red-400' : 'text-green-400'}/>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">{drift.drift_detected ? '⚠ Drift Detected' : '✓ No Drift Detected'}</div>
            <div className="text-xs text-sheriff-muted">{drift.drift_detected ? `Severity: ${drift.severity} — Trust score may be degrading.` : 'Model behavior is stable. Trust score is holding.'}</div>
          </div>
          <button onClick={() => navigate('/dashboard/drift')} className="text-xs text-orange-500 hover:text-orange-400 font-medium">View Chart →</button>
        </div>
      )}
    </div>
  )
}