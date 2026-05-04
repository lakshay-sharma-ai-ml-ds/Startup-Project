import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Scale, CheckCircle, XCircle, AlertCircle, Download, Play } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'

const FRAMEWORKS = [
  { key: 'eu_ai_act', label: 'EU AI Act', flag: '🇪🇺', color: '#58A6FF', deadline: 'August 2026 deadline', controls_key: 'eu_controls' },
  { key: 'nist_rmf', label: 'NIST RMF', flag: '🇺🇸', color: '#3FB950', deadline: 'US Federal Standard', controls_key: 'nist_controls' },
  { key: 'india_dpdp', label: 'India DPDP Act', flag: '🇮🇳', color: '#F97316', deadline: 'India Data Protection', controls_key: 'dpdp_controls' },
]

function StatusIcon({ status }) {
  if (status === 'passed') return <CheckCircle size={14} className="text-green-400 flex-shrink-0"/>
  if (status === 'failed') return <XCircle size={14} className="text-red-400 flex-shrink-0"/>
  return <AlertCircle size={14} className="text-yellow-400 flex-shrink-0"/>
}

function FrameworkCard({ fw, score, comp }) {
  const controls = comp?.[fw.controls_key] || []
  const evaluated = comp?.framework_details?.[fw.key]?.controls || []
  const evalMap = Object.fromEntries(evaluated.map(c => [c.id, c]))
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="p-5 flex items-center gap-4 border-b border-sheriff-border/30">
        <span className="text-3xl">{fw.flag}</span>
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold text-white">{fw.label}</h3>
          <p className="text-xs text-sheriff-muted">{fw.deadline}</p>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl font-bold" style={{ color: score ? fw.color : '#30363D' }}>{score ? Math.round(score) : '—'}</div>
          <div className="text-xs text-sheriff-muted">/100</div>
        </div>
      </div>
      {score && <div className="h-1.5 bg-sheriff-border/30"><div className="h-full transition-all duration-1000" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${fw.color}80, ${fw.color})` }}/></div>}
      <div className="divide-y divide-sheriff-border/20">
        {controls.map(ctrl => {
          const ev = evalMap[ctrl.id]
          return (
            <div key={ctrl.id} className="flex items-start gap-3 px-5 py-3">
              <StatusIcon status={ev?.status || 'partial'}/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-sheriff-muted">{ctrl.id}</span>
                  <span className="text-sm text-white font-medium">{ctrl.name}</span>
                </div>
                <p className="text-xs text-sheriff-muted mt-0.5">{ctrl.description}</p>
                {ev?.note && <p className="text-xs text-sheriff-muted/60 mt-0.5 italic">{ev.note}</p>}
              </div>
              {ev && (
                <span className="text-xs px-2 py-0.5 rounded font-mono capitalize flex-shrink-0"
                  style={{ background: ev.status==='passed'?'rgba(63,185,80,0.1)':ev.status==='failed'?'rgba(248,81,73,0.1)':'rgba(210,153,34,0.1)', color: ev.status==='passed'?'#3FB950':ev.status==='failed'?'#F85149':'#D29922' }}>
                  {ev.status}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ComplianceEngine() {
  const { selectedModelId } = useAuthStore()
  const qc = useQueryClient()

  const downloadPack = async () => {
    try {
      toast.loading('Generating evidence pack…', { id: 'ep' })
      const token = JSON.parse(localStorage.getItem('ai-sheriff-auth') || '{}')?.state?.token
      const res = await fetch(`/api/compliance/${selectedModelId}/evidence-pack`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'sheriff-evidence-pack.html'; a.click()
      URL.revokeObjectURL(url)
      toast.success('Evidence pack downloaded!', { id: 'ep' })
    } catch { toast.error('Download failed', { id: 'ep' }) }
  }

  const { data: comp } = useQuery({
    queryKey: ['compliance', selectedModelId],
    queryFn: () => api.get(`/compliance/${selectedModelId}/results`).then(r => r.data),
    enabled: !!selectedModelId,
    refetchInterval: 10000,
  })

  const runCompliance = useMutation({
    mutationFn: () => api.post(`/compliance/${selectedModelId}/run`),
    onSuccess: () => { toast.success('Compliance engine running. Mapping to EU AI Act, NIST RMF & DPDP...'); setTimeout(() => qc.invalidateQueries({ queryKey: ['compliance'] }), 8000) },
    onError: err => toast.error(err.response?.data?.detail || 'Failed'),
  })

  if (!selectedModelId) return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="text-center"><Scale size={48} className="text-sheriff-border mx-auto mb-4"/><h3 className="font-display text-lg font-bold text-white mb-2">No model selected</h3><p className="text-sheriff-muted text-sm">Select a model to run compliance mapping.</p></div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Compliance Engine</h1>
          <p className="text-sm text-sheriff-muted mt-1">Regulatory auto-mapping • Evidence pack generation • Live command center</p>
        </div>
        <div className="flex gap-3">
          {comp && <button onClick={downloadPack} className="glass text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 hover:border-orange-500/40 transition-all"><Download size={14}/> Download Evidence Pack</button>}
          <button onClick={() => runCompliance.mutate()} disabled={runCompliance.isPending}
            className="btn-sheriff text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50">
            {runCompliance.isPending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Mapping...</> : <><Play size={14}/> Run Compliance Engine</>}
          </button>
        </div>
      </div>

      {comp ? (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="glass rounded-xl p-5 col-span-1 flex flex-col items-center justify-center">
              <div className="text-xs text-sheriff-muted uppercase tracking-wider mb-2">Overall</div>
              <div className="font-display text-4xl font-black text-white">{Math.round(comp.overall_compliance)}</div>
              <div className="text-sm text-sheriff-muted">/100</div>
              <div className="mt-3 h-1.5 w-full bg-sheriff-border/30 rounded-full"><div className="h-full rounded-full bg-orange-500" style={{ width: `${comp.overall_compliance}%` }}/></div>
            </div>
            {FRAMEWORKS.map(fw => (
              <div key={fw.key} className="glass rounded-xl p-5">
                <div className="text-lg mb-1">{fw.flag}</div>
                <div className="text-xs text-sheriff-muted mb-1">{fw.label}</div>
                <div className="font-display text-2xl font-bold" style={{ color: fw.color }}>{Math.round(comp[`${fw.key}_score`] || 0)}</div>
                <div className="mt-2 h-1 bg-sheriff-border/30 rounded-full"><div className="h-full rounded-full" style={{ width: `${comp[`${fw.key}_score`] || 0}%`, background: fw.color }}/></div>
              </div>
            ))}
          </div>
          {comp.gaps?.length > 0 && (
            <div className="glass rounded-xl p-5 border border-yellow-500/20 bg-yellow-500/5">
              <h3 className="font-semibold text-yellow-400 text-sm mb-3 flex items-center gap-2"><AlertCircle size={16}/> Compliance Gaps ({comp.gaps.length})</h3>
              <ul className="space-y-1.5">{comp.gaps.map((gap, i) => <li key={i} className="flex items-start gap-2 text-sm text-sheriff-muted"><span className="text-yellow-500 mt-0.5">•</span> {gap}</li>)}</ul>
            </div>
          )}
          {comp.framework_details?.recommendations?.length > 0 && (
            <div className="glass rounded-xl p-5 border border-blue-500/20 bg-blue-500/5">
              <h3 className="font-semibold text-blue-400 text-sm mb-3">Recommendations</h3>
              <ul className="space-y-1.5">{comp.framework_details.recommendations.map((r, i) => <li key={i} className="flex items-start gap-2 text-sm text-sheriff-muted"><CheckCircle size={14} className="text-blue-400 mt-0.5 flex-shrink-0"/> {r}</li>)}</ul>
            </div>
          )}
          <div className="space-y-4">{FRAMEWORKS.map(fw => <FrameworkCard key={fw.key} fw={fw} score={comp[`${fw.key}_score`]} comp={comp}/>)}</div>
          <div className="text-xs text-sheriff-muted font-mono text-right pt-2">Last mapped: {new Date(comp.created_at).toLocaleString()}</div>
        </>
      ) : (
        <div className="text-center py-20 glass rounded-2xl">
          <Scale size={48} className="text-sheriff-border mx-auto mb-4"/>
          <h3 className="font-display text-lg font-bold text-white mb-2">No compliance data yet</h3>
          <p className="text-sheriff-muted text-sm mb-2">Run the audit engine first, then map to regulatory frameworks.</p>
          <p className="text-xs text-sheriff-muted/60 mb-6">Supports: EU AI Act • NIST RMF • India DPDP Act</p>
          <button onClick={() => runCompliance.mutate()} className="btn-sheriff text-white font-semibold px-6 py-3 rounded-xl text-sm mx-auto flex items-center gap-2">
            <Play size={16}/> Run Compliance Engine
          </button>
        </div>
      )}
    </div>
  )
}