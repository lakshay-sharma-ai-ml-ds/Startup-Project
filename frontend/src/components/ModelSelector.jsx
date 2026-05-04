import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, Plus, Cpu, Bot, Brain } from 'lucide-react'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

const TYPE_ICONS = { llm: Brain, agent: Bot, ml_model: Cpu }
const STATUS_COLORS = { active: '#3FB950', auditing: '#F97316', pending: '#8B949E', flagged: '#F85149' }

export default function ModelSelector() {
  const [open, setOpen] = useState(false)
  const { selectedModelId, setSelectedModel } = useAuthStore()
  const navigate = useNavigate()

  const { data: models = [] } = useQuery({
    queryKey: ['models'],
    queryFn: () => api.get('/models/').then(r => r.data),
    refetchInterval: 10000,
  })

  const selected = models.find(m => m.id === selectedModelId)
  const Icon = selected ? (TYPE_ICONS[selected.model_type] || Cpu) : null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 glass rounded-lg px-3 py-2 hover:border-orange-500/40 transition-all min-w-[220px]"
      >
        {selected ? (
          <>
            <span className="status-dot" style={{ background: STATUS_COLORS[selected.status] || '#8B949E', animation: selected.status === 'active' ? undefined : 'none' }}/>
            {Icon && <Icon size={14} className="text-orange-500"/>}
            <span className="text-sm text-white font-medium truncate flex-1 text-left">{selected.name}</span>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316' }}>
              {selected.trust_score > 0 ? `${selected.trust_score}` : '—'}
            </span>
          </>
        ) : (
          <span className="text-sm text-sheriff-muted flex-1 text-left">Select a model...</span>
        )}
        <ChevronDown size={14} className={`text-sheriff-muted transition-transform ${open ? 'rotate-180' : ''}`}/>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 glass rounded-xl shadow-2xl z-50 overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          {models.length === 0 ? (
            <div className="p-4 text-center text-sheriff-muted text-sm">No models registered yet</div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {models.map(m => {
                const MIcon = TYPE_ICONS[m.model_type] || Cpu
                return (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedModel(m.id); setOpen(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-500/5 transition-colors text-left border-b border-sheriff-border/30 last:border-0 ${m.id === selectedModelId ? 'bg-orange-500/10' : ''}`}
                  >
                    <span className="status-dot flex-shrink-0" style={{ background: STATUS_COLORS[m.status] || '#8B949E' }}/>
                    <MIcon size={14} className="text-orange-500 flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium truncate">{m.name}</div>
                      <div className="text-xs text-sheriff-muted capitalize">{m.model_type?.replace('_',' ')} • {m.status}</div>
                    </div>
                    <div className="text-xs font-mono text-orange-400">{m.trust_score > 0 ? m.trust_score : '—'}</div>
                  </button>
                )
              })}
            </div>
          )}
          <button
            onClick={() => { navigate('/dashboard/registry'); setOpen(false) }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-orange-500 hover:bg-orange-500/5 transition-colors border-t border-sheriff-border/50"
          >
            <Plus size={14}/> Register New Model
          </button>
        </div>
      )}
    </div>
  )
}