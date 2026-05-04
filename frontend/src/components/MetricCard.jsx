export default function MetricCard({ label, value, unit = '', sub, color = '#F97316', icon, trend, large = false }) {
  const trendColor = trend > 0 ? '#3FB950' : trend < 0 ? '#F85149' : '#8B949E'
  return (
    <div className="glass rounded-xl p-4 hover:border-orange-500/30 transition-all group">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-sheriff-muted font-medium uppercase tracking-wider">{label}</span>
        {icon && <span className="text-sheriff-muted group-hover:text-orange-500 transition-colors">{icon}</span>}
      </div>
      <div className="flex items-end gap-1.5">
        <span className={`font-display font-bold text-white ${large ? 'text-3xl' : 'text-2xl'}`} style={{ color: value === 'N/A' || value === 0 ? '#30363D' : undefined }}>
          {value ?? '—'}
        </span>
        {unit && <span className="text-sm text-sheriff-muted mb-0.5">{unit}</span>}
      </div>
      {(sub || trend !== undefined) && (
        <div className="flex items-center gap-2 mt-1">
          {sub && <span className="text-xs text-sheriff-muted">{sub}</span>}
          {trend !== undefined && trend !== 0 && (
            <span className="text-xs font-mono" style={{ color: trendColor }}>
              {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </span>
          )}
        </div>
      )}
      <div className="mt-3 h-0.5 rounded-full" style={{ background: `${color}22` }}>
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, typeof value === 'number' ? value : 0)}%`, background: color }}/>
      </div>
    </div>
  )
}