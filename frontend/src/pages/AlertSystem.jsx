import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, AlertTriangle, Info, ShieldAlert, TrendingDown, Zap } from 'lucide-react'
import api from '../utils/api'

const SEV_CONFIG = {
  critical: { color: '#F85149', bg: 'rgba(248,81,73,0.1)', border: 'rgba(248,81,73,0.25)', icon: ShieldAlert },
  high: { color: '#D29922', bg: 'rgba(210,153,34,0.1)', border: 'rgba(210,153,34,0.25)', icon: AlertTriangle },
  medium: { color: '#F97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)', icon: Info },
  low: { color: '#8B949E', bg: 'rgba(139,148,158,0.08)', border: 'rgba(139,148,158,0.15)', icon: Info },
}

const TYPE_ICONS = { audit_failure: Zap, drift_detected: TrendingDown, compliance_gap: ShieldAlert, bias_spike: AlertTriangle }

export default function AlertSystem() {
  const qc = useQueryClient()

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get('/alerts/').then(r => r.data),
    refetchInterval: 10000,
  })

  const markRead = useMutation({
    mutationFn: id => api.post(`/alerts/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })

  const unread = alerts.filter(a => !a.is_read)
  const read = alerts.filter(a => a.is_read)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            Alert System
            {unread.length > 0 && <span className="text-sm bg-red-500 text-white rounded-full px-2 py-0.5 font-mono">{unread.length}</span>}
          </h1>
          <p className="text-sm text-sheriff-muted mt-1">Real-time risk notifications • Threshold breach alerts</p>
        </div>
        {unread.length > 0 && (
          <button onClick={() => unread.forEach(a => markRead.mutate(a.id))}
            className="glass text-white text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-2 hover:border-orange-500/40 transition-all">
            <CheckCheck size={14}/> Mark all read
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {Object.entries(SEV_CONFIG).map(([sev, cfg]) => (
          <div key={sev} className="rounded-xl p-3 text-center" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
            <div className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: cfg.color }}>{sev}</div>
            <div className="text-lg font-display font-bold" style={{ color: cfg.color }}>{alerts.filter(a => a.severity === sev).length}</div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sheriff-muted">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <Bell size={48} className="text-sheriff-border mx-auto mb-4"/>
          <h3 className="font-display text-lg font-bold text-white mb-2">No alerts</h3>
          <p className="text-sheriff-muted text-sm">Alerts fire automatically when risk thresholds are breached. Run an audit to generate data.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {unread.length > 0 && (
            <div>
              <h2 className="text-xs font-mono text-sheriff-muted uppercase tracking-wider mb-3">Unread ({unread.length})</h2>
              <div className="space-y-2">
                {unread.map(alert => {
                  const cfg = SEV_CONFIG[alert.severity] || SEV_CONFIG.low
                  const Icon = TYPE_ICONS[alert.alert_type] || Bell
                  return (
                    <div key={alert.id} className="rounded-xl p-4 flex items-start gap-4 transition-all cursor-pointer hover:opacity-90"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                      onClick={() => markRead.mutate(alert.id)}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}20` }}>
                        <Icon size={16} style={{ color: cfg.color }}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">{alert.title}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded font-mono uppercase" style={{ background: `${cfg.color}20`, color: cfg.color }}>{alert.severity}</span>
                          <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"/>
                        </div>
                        <p className="text-sm text-sheriff-muted">{alert.message}</p>
                        <span className="text-xs text-sheriff-muted/50 font-mono mt-1 block">{new Date(alert.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {read.length > 0 && (
            <div>
              <h2 className="text-xs font-mono text-sheriff-muted uppercase tracking-wider mb-3">Read</h2>
              <div className="space-y-2 opacity-60">
                {read.slice(0, 10).map(alert => {
                  const cfg = SEV_CONFIG[alert.severity] || SEV_CONFIG.low
                  const Icon = TYPE_ICONS[alert.alert_type] || Bell
                  return (
                    <div key={alert.id} className="glass rounded-xl p-4 flex items-start gap-4">
                      <Icon size={16} className="mt-1 flex-shrink-0" style={{ color: cfg.color }}/>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{alert.title}</div>
                        <p className="text-xs text-sheriff-muted mt-0.5">{alert.message}</p>
                        <span className="text-xs text-sheriff-muted/40 font-mono">{new Date(alert.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}