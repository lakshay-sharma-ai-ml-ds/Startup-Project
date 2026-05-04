import { useEffect, useState } from 'react'

export default function TrustScoreRing({ score, size = 140, label = 'Trust Score', showDetails = true }) {
  const [animScore, setAnimScore] = useState(0)
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animScore / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => setAnimScore(score || 0), 200)
    return () => clearTimeout(timer)
  }, [score])

  const getColor = s => {
    if (s === 0 || s == null) return '#30363D'
    if (s >= 80) return '#3FB950'
    if (s >= 60) return '#F97316'
    if (s >= 40) return '#D29922'
    return '#F85149'
  }

  const getRiskLabel = s => {
    if (!s) return 'N/A'
    if (s >= 80) return 'LOW RISK'
    if (s >= 60) return 'MEDIUM RISK'
    if (s >= 40) return 'HIGH RISK'
    return 'CRITICAL'
  }

  const color = getColor(score)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1C2333" strokeWidth="8"/>
          <circle
            cx={size/2} cy={size/2} r={radius}
            fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.5s ease-out, stroke 0.5s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-white" style={{ fontSize: size * 0.22 }}>
            {score ? Math.round(animScore) : '—'}
          </span>
          {score > 0 && <span style={{ fontSize: size * 0.09, color }} className="font-mono font-medium">/100</span>}
        </div>
        {score > 0 && (
          <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 ${size * 0.2}px ${color}33` }}/>
        )}
      </div>
      {showDetails && (
        <div className="text-center">
          <div className="text-sm text-sheriff-muted font-medium">{label}</div>
          <div className="text-xs font-mono mt-0.5" style={{ color }}>{getRiskLabel(score)}</div>
        </div>
      )}
    </div>
  )
}