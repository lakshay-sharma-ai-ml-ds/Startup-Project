import { useState, useRef, useEffect } from 'react'
import { Bell, CheckCheck, AlertTriangle, ShieldAlert, Zap, TrendingDown, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api'

const SEV_CONFIG = {
  critical: { color: '#F85149', bg: 'rgba(248,81,73,0.1)', Icon: ShieldAlert },
  high:     { color: '#D29922', bg: 'rgba(210,153,34,0.1)', Icon: AlertTriangle },
  medium:   { color: '#F97316', bg: 'rgba(249,115,22,0.08)', Icon: Zap },
  low:      { color: '#8B949E', bg: 'rgba(139,148,158,0.08)', Icon: Bell },
}

const TYPE_ICONS = {
  audit_failure: Zap,
  drift_detected: TrendingDown,
  compliance_gap: ShieldAlert,
  bias_spike: AlertTriangle,
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const qc = useQueryClient()

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get('/alerts/').then(r => r.data),
    refetchInterval: 10000,
  })

  const markRead = useMutation({
    mutationFn: id => api.post(`/alerts/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })

  const markAllRead = async () => {
    for (const a of alerts.filter(a => !a.is_read)) {
      await api.post(`/alerts/${a.id}/read`)
    }
    qc.invalidateQueries({ queryKey: ['alerts'] })
  }

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unread = alerts.filter(a => !a.is_read)
  const recent = alerts.slice(0, 8)

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-sheriff-muted hover:text-white hover:bg-white/5 transition-all"
      >
        <Bell size={16} />
        {unread.length > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white font-mono px-1"
            style={{ background: '#F85149', animation: 'pulse 2s infinite' }}
          >
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden shadow-2xl"
          style={{ width: 340, background: '#161B22', border: '1px solid #30363D', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363D]">
            <div>
              <span className="text-sm font-semibold text-white">Alerts</span>
              {unread.length > 0 && (
                <span className="ml-2 text-xs font-mono px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
                  {unread.length} new
                </span>
              )}
            </div>
            <div className="flex gap-1">
              {unread.length > 0 && (
                <button onClick={markAllRead} className="text-xs text-sheriff-muted hover:text-orange-400 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5">
                  <CheckCheck size={12} /> All read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg text-sheriff-muted hover:text-white hover:bg-white/5 transition-all">
                <X size={13} />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {recent.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={28} className="text-[#30363D] mx-auto mb-2" />
                <p className="text-sm text-sheriff-muted">No alerts yet</p>
                <p className="text-xs text-sheriff-muted/50 mt-1">Alerts appear when risk thresholds are breached</p>
              </div>
            ) : (
              recent.map(alert => {
                const cfg = SEV_CONFIG[alert.severity] || SEV_CONFIG.low
                const TypeIcon = TYPE_ICONS[alert.alert_type] || Bell
                return (
                  <button
                    key={alert.id}
                    onClick={() => { markRead.mutate(alert.id); setOpen(false) }}
                    className="w-full flex items-start gap-3 px-4 py-3 border-b border-[#30363D]/50 last:border-0 hover:bg-white/3 transition-colors text-left"
                    style={{ background: alert.is_read ? 'transparent' : cfg.bg }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${cfg.color}20` }}>
                      <TypeIcon size={13} style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-white leading-snug truncate">{alert.title}</p>
                        {!alert.is_read && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1" style={{ background: cfg.color }} />}
                      </div>
                      <p className="text-xs text-sheriff-muted leading-relaxed mt-0.5 line-clamp-2">{alert.message}</p>
                      <p className="text-[10px] text-sheriff-muted/50 font-mono mt-1">{timeAgo(alert.created_at)}</p>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {alerts.length > 8 && (
            <div className="border-t border-[#30363D] px-4 py-2.5 text-center">
              <button onClick={() => setOpen(false)} className="text-xs text-orange-500 hover:text-orange-400 font-medium">
                View all {alerts.length} alerts →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}