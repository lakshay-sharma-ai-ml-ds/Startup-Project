import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Cpu, Bot, Brain, Trash2, Upload, Key, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'

const TYPE_OPTS = [
  { id: 'llm', label: 'Large Language Model', icon: Brain, desc: 'GPT-4, Claude, Gemini, Llama, etc.' },
  { id: 'agent', label: 'AI Agent / Workflow', icon: Bot, desc: 'AutoGPT, CrewAI, LangGraph, custom agents' },
  { id: 'ml_model', label: 'Traditional ML Model', icon: Cpu, desc: 'Sklearn, XGBoost, custom classifiers' },
]
const METHOD_OPTS = [
  { id: 'api_key', label: 'API Endpoint', icon: Key, desc: 'Connect via REST API + auth key' },
  { id: 'upload', label: 'Upload Artifact', icon: Upload, desc: 'Upload model weights or config file' },
  { id: 'workflow', label: 'Agent Workflow', icon: Bot, desc: 'Register a multi-step agentic system' },
]
const STATUS_COLORS = { active: '#3FB950', auditing: '#F97316', pending: '#8B949E', flagged: '#F85149' }

export default function ModelRegistry() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', model_type: 'llm', registration_method: 'api_key', endpoint_url: '', api_key: '' })
  const qc = useQueryClient()
  const { setSelectedModel } = useAuthStore()

  const { data: models = [], isLoading } = useQuery({ queryKey: ['models'], queryFn: () => api.get('/models/').then(r => r.data) })

  const register = useMutation({
    mutationFn: data => api.post('/models/register', data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['models'] })
      setSelectedModel(res.data.id)
      setShowForm(false)
      setForm({ name: '', description: '', model_type: 'llm', registration_method: 'api_key', endpoint_url: '', api_key: '' })
      toast.success(`${res.data.name} registered! Run an audit to begin evaluation.`)
    },
    onError: err => toast.error(err.response?.data?.detail || 'Registration failed'),
  })

  const deleteModel = useMutation({
    mutationFn: id => api.delete(`/models/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['models'] }); toast.success('Model removed') },
  })

  const set = k => v => setForm(f => ({ ...f, [k]: typeof v === 'string' ? v : v.target.value }))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Model Registry</h1>
          <p className="text-sm text-sheriff-muted mt-1">Register and manage AI systems for evaluation.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-sheriff text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <Plus size={16}/> Register Model
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-6 border border-orange-500/20 space-y-6">
          <h2 className="font-display text-lg font-bold text-white">Register New AI System</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-sheriff-muted uppercase tracking-wider mb-2 block">Model / Agent Name *</label>
              <input value={form.name} onChange={set('name')} placeholder="e.g. GPT-4-Turbo-v2, My HR Bot..."
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-sheriff-muted/40 bg-transparent focus:outline-none focus:border-orange-500/50 text-sm"/>
            </div>
            <div>
              <label className="text-xs text-sheriff-muted uppercase tracking-wider mb-2 block">API Endpoint (optional)</label>
              <input value={form.endpoint_url} onChange={set('endpoint_url')} placeholder="https://api.example.com/v1/completions"
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-sheriff-muted/40 bg-transparent focus:outline-none focus:border-orange-500/50 text-sm"/>
            </div>
          </div>
          <div>
            <label className="text-xs text-sheriff-muted uppercase tracking-wider mb-2 block">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={2} placeholder="What does this model do? What decisions does it make?"
              className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-sheriff-muted/40 bg-transparent focus:outline-none focus:border-orange-500/50 text-sm resize-none"/>
          </div>
          <div>
            <label className="text-xs text-sheriff-muted uppercase tracking-wider mb-3 block">Model Type</label>
            <div className="grid grid-cols-3 gap-3">
              {TYPE_OPTS.map(t => (
                <button key={t.id} type="button" onClick={() => set('model_type')(t.id)}
                  className={`p-3 rounded-xl text-left transition-all border ${form.model_type === t.id ? 'border-orange-500/50 bg-orange-500/10' : 'glass hover:border-orange-500/20'}`}>
                  <t.icon size={18} className={form.model_type === t.id ? 'text-orange-500 mb-2' : 'text-sheriff-muted mb-2'}/>
                  <div className="text-sm font-medium text-white">{t.label}</div>
                  <div className="text-xs text-sheriff-muted mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-sheriff-muted uppercase tracking-wider mb-3 block">Registration Method</label>
            <div className="grid grid-cols-3 gap-3">
              {METHOD_OPTS.map(m => (
                <button key={m.id} type="button" onClick={() => set('registration_method')(m.id)}
                  className={`p-3 rounded-xl text-left transition-all border ${form.registration_method === m.id ? 'border-orange-500/50 bg-orange-500/10' : 'glass hover:border-orange-500/20'}`}>
                  <m.icon size={18} className={form.registration_method === m.id ? 'text-orange-500 mb-2' : 'text-sheriff-muted mb-2'}/>
                  <div className="text-sm font-medium text-white">{m.label}</div>
                  <div className="text-xs text-sheriff-muted mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>
          {form.registration_method === 'api_key' && (
            <div>
              <label className="text-xs text-sheriff-muted uppercase tracking-wider mb-2 block">API Key (encrypted at rest)</label>
              <input type="password" value={form.api_key} onChange={set('api_key')} placeholder="sk-..."
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-sheriff-muted/40 bg-transparent focus:outline-none focus:border-orange-500/50 text-sm font-mono"/>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="glass text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:border-orange-500/30 transition-all">Cancel</button>
            <button onClick={() => register.mutate(form)} disabled={!form.name || register.isPending}
              className="btn-sheriff text-white font-semibold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50 flex items-center gap-2">
              {register.isPending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Registering...</> : 'Register & Begin Evaluation →'}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-sheriff-muted">Loading registry...</div>
      ) : models.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl">
          <Brain size={48} className="text-sheriff-border mx-auto mb-4"/>
          <h3 className="font-display text-lg font-bold text-white mb-2">No models registered</h3>
          <p className="text-sheriff-muted text-sm mb-6">Register your first AI model to begin evaluation.</p>
          <button onClick={() => setShowForm(true)} className="btn-sheriff text-white font-semibold px-5 py-2.5 rounded-xl text-sm">Register Your First Model</button>
        </div>
      ) : (
        <div className="space-y-3">
          {models.map(m => {
            const Icon = m.model_type === 'llm' ? Brain : m.model_type === 'agent' ? Bot : Cpu
            const color = STATUS_COLORS[m.status]
            return (
              <div key={m.id} className="glass rounded-xl p-4 flex items-center gap-4 hover:border-orange-500/20 transition-all">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.1)' }}>
                  <Icon size={18} className="text-orange-500"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{m.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize font-mono" style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>{m.status}</span>
                  </div>
                  <div className="text-xs text-sheriff-muted mt-0.5 capitalize">{m.model_type?.replace('_',' ')} • Registered {new Date(m.created_at).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl font-bold" style={{ color: m.trust_score > 0 ? '#F97316' : '#30363D' }}>{m.trust_score > 0 ? m.trust_score : '—'}</div>
                  <div className="text-xs text-sheriff-muted">Trust Score</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { useAuthStore.getState().setSelectedModel(m.id); toast.success(`Switched to ${m.name}`) }}
                    className="glass px-3 py-1.5 rounded-lg text-xs text-white font-medium hover:border-orange-500/40 transition-all flex items-center gap-1">
                    Select <ChevronRight size={12}/>
                  </button>
                  <button onClick={() => deleteModel.mutate(m.id)} className="p-1.5 rounded-lg text-sheriff-muted hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}