import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Zap, CheckCircle, XCircle, ChevronDown, ChevronUp, Play } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'
import TrustScoreRing from '../components/TrustScoreRing'

const CATEGORIES = [
  { id: 'bias', label: 'Bias & Fairness', color: '#F97316', icon: '⚖️', desc: 'Tests for demographic bias, unfair treatment, discriminatory outputs' },
  { id: 'hallucination', label: 'Hallucination', color: '#58A6FF', icon: '🔮', desc: 'Detects fabricated facts, false citations, confabulation' },
  { id: 'toxicity', label: 'Toxicity', color: '#F85149', icon: '☣️', desc: 'Probes for hate speech, harmful content, abusive language' },
  { id: 'jailbreak', label: 'Jailbreak Resistance', color: '#A78BFA', icon: '🔒', desc: 'Attempts to bypass safety guidelines and alignment constraints' },
  { id: 'explainability', label: 'Explainability', color: '#3FB950', icon: '🧠', desc: 'Evaluates reasoning transparency and confidence calibration' },
]

function CategoryResult({ cat, results }) {
  const [expanded, setExpanded] = useState(false)
  const data = results?.[cat.id]
  if (!data) return null
  const total = data.passed + data.failed
  const pct = total > 0 ? Math.round(data.passed / total * 100) : 0
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button className="w-full flex items-center gap-4 p-4 hover:bg-white/2 transition-all" onClick={() => setExpanded(!expanded)}>
        <span className="text-2xl">{cat.icon}</span>
        <div className="flex-1 text-left">
          <div className="font-semibold text-white text-sm">{cat.label}</div>
          <div className="text-xs text-sheriff-muted">{cat.desc}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-display text-xl font-bold" style={{ color: cat.color }}>{pct}%</div>
            <div className="text-xs text-sheriff-muted">{data.passed}/{total} passed</div>
          </div>
          <div className="w-24 h-2 bg-sheriff-border/50 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cat.color }}/>
          </div>
          {expanded ? <ChevronUp size={16} className="text-sheriff-muted"/> : <ChevronDown size={16} className="text-sheriff-muted"/>}
        </div>
      </button>
      {expanded && data.cases && (
        <div className="border-t border-sheriff-border/30 divide-y divide-sheriff-border/20">
          {data.cases.map((c, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              {c.passed ? <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0"/> : <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0"/>}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-sheriff-muted truncate">"{c.prompt}"</div>
                {c.explanation && <div className="text-xs text-sheriff-muted/70 mt-0.5">{c.explanation}</div>}
              </div>
              <span className="text-xs px-1.5 py-0.5 rounded font-mono flex-shrink-0" style={{ background: c.severity === 'critical' ? 'rgba(248,81,73,0.2)' : c.severity === 'high' ? 'rgba(210,153,34,0.2)' : 'rgba(139,148,158,0.1)', color: c.severity === 'critical' ? '#F85149' : c.severity === 'high' ? '#D29922' : '#8B949E' }}>{c.severity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AuditEngine() {
  const { selectedModelId } = useAuthStore()
  const qc = useQueryClient()

  const { data: results = [] } = useQuery({
    queryKey: ['audit', selectedModelId],
    queryFn: () => api.get(`/audit/${selectedModelId}/results`).then(r => r.data),
    enabled: !!selectedModelId,
    refetchInterval: 5000,
  })

  const runAudit = useMutation({
    mutationFn: () => api.post(`/audit/${selectedModelId}/run`),
    onSuccess: () => { toast.success('Adversarial audit initiated. Claude is red-teaming your model...'); setTimeout(() => qc.invalidateQueries({ queryKey: ['audit'] }), 5000) },
    onError: err => toast.error(err.response?.data?.detail || 'Audit failed to start'),
  })

  const latest = results[0]
  if (!selectedModelId) return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Zap size={48} className="text-sheriff-border mx-auto mb-4"/>
        <h3 className="font-display text-lg font-bold text-white mb-2">No model selected</h3>
        <p className="text-sheriff-muted text-sm">Select or register a model to run adversarial audits.</p>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Audit Engine</h1>
          <p className="text-sm text-sheriff-muted mt-1">AI-powered red-teaming • Adversarial safety lab</p>
        </div>
        <button onClick={() => runAudit.mutate()} disabled={runAudit.isPending}
          className="btn-sheriff text-white font-semibold px-6 py-3 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50">
          {runAudit.isPending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Running...</> : <><Play size={16}/> Run Full Audit</>}
        </button>
      </div>

      <div className="glass-orange rounded-xl p-4">
        <h3 className="text-sm font-semibold text-orange-400 mb-3">Active Test Suite</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CATEGORIES.map(c => (
            <div key={c.id} className="text-center p-2 rounded-lg bg-sheriff-dark/50">
              <div className="text-xl mb-1">{c.icon}</div>
              <div className="text-xs text-white font-medium">{c.label}</div>
              <div className="text-xs text-sheriff-muted mt-0.5">4 probes</div>
            </div>
          ))}
        </div>
      </div>

      {latest ? (
        <>
          <div className="glass rounded-2xl p-6 grid md:grid-cols-5 gap-6 items-center">
            <div className="flex justify-center">
              <TrustScoreRing score={latest.adversarial_score ? Math.round(latest.adversarial_score) : 0} size={120} label="Adversarial Score"/>
            </div>
            <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[{label:'Total Tests',val:latest.total_tests,color:'#F97316'},{label:'Passed',val:latest.passed,color:'#3FB950'},{label:'Failed',val:latest.failed,color:'#F85149'},{label:'Pass Rate',val:`${latest.pass_rate}%`,color:latest.pass_rate>=80?'#3FB950':latest.pass_rate>=60?'#F97316':'#F85149'}].map(s => (
                <div key={s.label} className="bg-sheriff-dark-3 rounded-xl p-4 text-center">
                  <div className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.val}</div>
                  <div className="text-xs text-sheriff-muted mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-white mb-4">Test Results by Category</h2>
            <div className="space-y-3">
              {CATEGORIES.map(cat => <CategoryResult key={cat.id} cat={cat} results={latest.detailed_results}/>)}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-sheriff-muted border-t border-sheriff-border/30 pt-4">
            <span className="font-mono">Audit run: {new Date(latest.created_at).toLocaleString()}</span>
            <span>{results.length} audit{results.length !== 1 ? 's' : ''} in history</span>
          </div>
        </>
      ) : (
        <div className="text-center py-20 glass rounded-2xl">
          <Zap size={48} className="text-sheriff-border mx-auto mb-4"/>
          <h3 className="font-display text-lg font-bold text-white mb-2">No audits run yet</h3>
          <p className="text-sheriff-muted text-sm mb-6">Click "Run Full Audit" to begin adversarial red-teaming powered by AI.</p>
          <button onClick={() => runAudit.mutate()} className="btn-sheriff text-white font-semibold px-6 py-3 rounded-xl text-sm flex items-center gap-2 mx-auto">
            <Play size={16}/> Start First Audit
          </button>
        </div>
      )}
    </div>
  )
}