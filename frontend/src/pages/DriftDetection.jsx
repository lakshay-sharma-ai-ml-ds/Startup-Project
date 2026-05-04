import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingDown, Activity, Play, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg p-3 text-xs border border-sheriff-border/50">
      <div className="text-sheriff-muted mb-1">{new Date(label).toLocaleDateString()}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }}/>
          <span className="text-white">{p.name}: <strong style={{ color: p.color }}>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong></span>
        </div>
      ))}
    </div>
  )
}

export default function DriftDetection() {
  const { selectedModelId } = useAuthStore()
  const qc = useQueryClient()

  const { data: history = [] } = useQuery({
    queryKey: ['drift', selectedModelId],
    queryFn: () => api.get(`/drift/${selectedModelId}/history?days=30`).then(r => r.data),
    enabled: !!selectedModelId,
    refetchInterval: 30000,
  })

  const simulate = useMutation({
    mutationFn: () => api.post(`/drift/${selectedModelId}/simulate`),
    onSuccess: () => { toast.success('30 days of drift data generated.'); qc.invalidateQueries({ queryKey: ['drift'] }) },
  })

  if (!selectedModelId) return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="text-center"><TrendingDown size={48} className="text-sheriff-border mx-auto mb-4"/><p className="text-sheriff-muted text-sm">Select a model to view drift monitoring.</p></div>
    </div>
  )

  const driftEvents = history.filter(h => h.drift_detected)
  const latestScore = history[history.length - 1]?.trust_score
  const firstScore = history[0]?.trust_score
  const delta = latestScore && firstScore ? (latestScore - firstScore).toFixed(1) : null
  const chartData = history.map(h => ({ timestamp: h.timestamp, trust: h.trust_score, behavior: (h.behavior_drift * 100).toFixed(2) }))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Drift Detection</h1>
          <p className="text-sm text-sheriff-muted mt-1">24/7 behavioral monitoring • Real-time score degradation</p>
        </div>
        <button onClick={() => simulate.mutate()} disabled={simulate.isPending}
          className="glass text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 hover:border-orange-500/40 transition-all">
          {simulate.isPending ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"/> : <Play size={14}/>}
          Simulate 30-Day Data
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Current Trust', val: latestScore ? `${latestScore.toFixed(1)}` : '—', unit: '/100', color: latestScore >= 80 ? '#3FB950' : latestScore >= 60 ? '#F97316' : '#F85149' },
          { label: '30d Change', val: delta ? `${delta > 0 ? '+' : ''}${delta}` : '—', color: delta > 0 ? '#3FB950' : delta < 0 ? '#F85149' : '#8B949E' },
          { label: 'Drift Events', val: driftEvents.length, color: driftEvents.length > 0 ? '#F85149' : '#3FB950' },
          { label: 'Data Points', val: history.length, color: '#8B949E' },
        ].map(m => (
          <div key={m.label} className="glass rounded-xl p-4 text-center">
            <div className="text-xs text-sheriff-muted uppercase tracking-wider mb-2">{m.label}</div>
            <div className="font-display text-2xl font-bold" style={{ color: m.color }}>{m.val}{m.unit && <span className="text-sm font-normal text-sheriff-muted ml-0.5">{m.unit}</span>}</div>
          </div>
        ))}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <Activity size={48} className="text-sheriff-border mx-auto mb-4"/>
          <h3 className="font-display text-lg font-bold text-white mb-2">No drift data available</h3>
          <p className="text-sheriff-muted text-sm mb-6">Click "Simulate 30-Day Data" to generate monitoring history.</p>
          <button onClick={() => simulate.mutate()} className="btn-sheriff text-white font-semibold px-6 py-3 rounded-xl text-sm mx-auto flex items-center gap-2"><Play size={16}/> Generate Drift Data</button>
        </div>
      ) : (
        <>
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-base font-bold text-white mb-4 flex items-center gap-2"><Activity size={16} className="text-orange-500"/> Trust Score Over Time (30 Days)</h2>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="trustGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(48,54,61,0.5)"/>
                <XAxis dataKey="timestamp" tick={{ fill: '#8B949E', fontSize: 10 }} tickFormatter={v => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}/>
                <YAxis domain={[0, 100]} tick={{ fill: '#8B949E', fontSize: 10 }}/>
                <Tooltip content={<CustomTooltip/>}/>
                <ReferenceLine y={60} stroke="#D29922" strokeDasharray="4 4" label={{ value: 'Warning', fill: '#D29922', fontSize: 10 }}/>
                <ReferenceLine y={40} stroke="#F85149" strokeDasharray="4 4" label={{ value: 'Critical', fill: '#F85149', fontSize: 10 }}/>
                <Area type="monotone" dataKey="trust" name="Trust Score" stroke="#F97316" fill="url(#trustGrad)" strokeWidth={2} dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-base font-bold text-white mb-4 flex items-center gap-2"><TrendingDown size={16} className="text-blue-400"/> Behavioral Drift Index</h2>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="driftGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#58A6FF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#58A6FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(48,54,61,0.5)"/>
                <XAxis dataKey="timestamp" tick={{ fill: '#8B949E', fontSize: 10 }} tickFormatter={v => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}/>
                <YAxis tick={{ fill: '#8B949E', fontSize: 10 }}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="behavior" name="Drift Index %" stroke="#58A6FF" fill="url(#driftGrad)" strokeWidth={2} dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {driftEvents.length > 0 && (
            <div className="glass rounded-xl p-5 border border-red-500/20 bg-red-500/5">
              <h3 className="font-semibold text-red-400 text-sm mb-3 flex items-center gap-2"><AlertTriangle size={14}/> Drift Events ({driftEvents.length})</h3>
              <div className="space-y-2">
                {driftEvents.slice(0, 5).map((e, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-xs font-mono text-sheriff-muted">{new Date(e.timestamp).toLocaleDateString()}</span>
                    <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: e.drift_severity==='high'?'rgba(248,81,73,0.2)':'rgba(210,153,34,0.2)', color: e.drift_severity==='high'?'#F85149':'#D29922' }}>{e.drift_severity}</span>
                    <span className="text-sheriff-muted">Trust score: {e.trust_score?.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}