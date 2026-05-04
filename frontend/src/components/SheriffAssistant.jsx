import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, Minimize2 } from 'lucide-react'

const QUICK_QUESTIONS = [
  'Why is my trust score low?',
  'What does the EU AI Act require?',
  'How do I fix bias issues?',
  'What is drift detection?',
  'How to generate an evidence pack?',
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-3`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
          style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)' }}>
          <Bot size={12} className="text-orange-500" />
        </div>
      )}
      <div
        className="max-w-[82%] rounded-xl px-3 py-2 text-sm leading-relaxed"
        style={isUser
          ? { background: 'rgba(249,115,22,0.15)', color: '#E6EDF3', border: '1px solid rgba(249,115,22,0.2)' }
          : { background: '#1C2333', color: '#E6EDF3', border: '1px solid #30363D' }
        }
      >
        {msg.content}
        {msg.loading && (
          <span className="inline-flex gap-0.5 ml-1">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-1 h-1 rounded-full bg-orange-500 opacity-60"
                style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
            ))}
          </span>
        )}
      </div>
    </div>
  )
}

export default function SheriffAssistant({ dashboardContext = {} }) {
  const [open, setOpen] = useState(false)
  const [minimised, setMinimised] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm Sheriff AI — your compliance assistant. Ask me anything about your model's audit results, regulatory requirements, or how to improve your trust score." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const q = text || input.trim()
    if (!q || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: q }])
    setLoading(true)
    const loadingId = Date.now()
    setMessages(prev => [...prev, { role: 'assistant', content: '', loading: true, id: loadingId }])

    try {
      const token = JSON.parse(localStorage.getItem('ai-sheriff-auth') || '{}')?.state?.token
      const response = await fetch('/api/chat/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token || ''}` },
        body: JSON.stringify({ message: q, context: dashboardContext }),
      })
      if (!response.ok) throw new Error('API error')
      const data = await response.json()
      setMessages(prev => prev.map(m => m.id === loadingId ? { role: 'assistant', content: data.reply || "I couldn't process that. Please try again." } : m))
    } catch {
      const q_lower = q.toLowerCase()
      let reply = ''
      if (q_lower.includes('trust score') || q_lower.includes('low score')) {
        reply = "Trust scores are calculated from 5 layers: adversarial audit results, compliance mapping, drift detection, living badge score, and alert status. Run an audit to get your model's score. To improve: fix failing test categories, address compliance gaps, and ensure your endpoint is connected."
      } else if (q_lower.includes('eu ai act') || q_lower.includes('europe')) {
        reply = "The EU AI Act (August 2026 deadline) requires: (1) Risk classification, (2) Technical documentation, (3) Human oversight, (4) Bias & accuracy testing, (5) Incident reporting. AI Sheriff auto-maps your model and generates ready-to-submit evidence packs."
      } else if (q_lower.includes('bias')) {
        reply = "Bias means the model treats different demographic groups differently. AI Sheriff tests for gender, racial, age, and geographic bias. To fix: re-train on balanced datasets, apply fairness constraints, or use debiasing prompts. Re-run the Audit Engine after each fix."
      } else if (q_lower.includes('drift')) {
        reply = "Drift occurs when model behavior changes post-deployment — from data distribution shifts, prompt injection, or updates. AI Sheriff monitors 24/7. When drift is detected, the trust score degrades automatically and alerts fire."
      } else if (q_lower.includes('evidence pack')) {
        reply = "Evidence packs are auto-generated reports with: full audit results, compliance mapping to EU AI Act / NIST RMF / DPDP, trust score history, and risk assessment. Go to Compliance Engine → Download Evidence Pack."
      } else if (q_lower.includes('jailbreak')) {
        reply = "Jailbreak resistance measures if your model can be tricked into bypassing safety guidelines. AI Sheriff tests with DAN, developer mode, and instruction injection patterns. To improve: stronger system prompts, output filtering, regular red-team testing."
      } else if (q_lower.includes('nist')) {
        reply = "NIST AI RMF has 4 functions: Govern (risk policies), Map (identify risks), Measure (track metrics), Manage (respond to risks). AI Sheriff maps your audit results to all 4 functions automatically."
      } else if (q_lower.includes('dpdp') || q_lower.includes('india')) {
        reply = "India's DPDP Act requires: user consent, data principal rights (access/correction/erasure), data fiduciary obligations, and grievance redressal. AI Sheriff checks these controls for models processing Indian user data."
      } else {
        reply = "I'm a compliance assistant for AI governance, trust scoring, and regulatory frameworks. Ask me about EU AI Act requirements, improving audit scores, drift monitoring, or generating evidence packs for regulators."
      }
      setMessages(prev => prev.map(m => m.id === loadingId ? { role: 'assistant', content: reply } : m))
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-50 transition-all hover:scale-110"
        style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)', boxShadow: '0 4px 20px rgba(249,115,22,0.4)' }}
      >
        <MessageCircle size={22} className="text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-[#0D1117] text-[8px] flex items-center justify-center text-[#0D1117] font-bold">AI</span>
      </button>
    )
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl overflow-hidden"
      style={{ width: 340, height: minimised ? 48 : 480, background: '#161B22', border: '1px solid #30363D', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', transition: 'height 0.3s ease' }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #1C2333, #161B22)', borderBottom: '1px solid #30363D' }}
        onClick={() => setMinimised(!minimised)}
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(249,115,22,0.15)' }}>
          <Bot size={14} className="text-orange-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white">Sheriff AI</div>
          <div className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Compliance assistant
          </div>
        </div>
        <button onClick={e => { e.stopPropagation(); setMinimised(!minimised) }} className="text-gray-500 hover:text-white transition-colors"><Minimize2 size={14} /></button>
        <button onClick={e => { e.stopPropagation(); setOpen(false) }} className="text-gray-500 hover:text-white transition-colors"><X size={14} /></button>
      </div>

      {!minimised && (
        <>
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            <div ref={bottomRef} />
          </div>
          {messages.length === 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => send(q)}
                  className="text-xs px-2.5 py-1 rounded-full text-orange-400 hover:text-orange-300 transition-all"
                  style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
                  {q}
                </button>
              ))}
            </div>
          )}
          <div className="px-3 pb-3 pt-2 border-t border-[#30363D] flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask about compliance, audits, risks..."
              className="flex-1 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-600 bg-transparent focus:outline-none"
              style={{ background: '#1C2333', border: '1px solid #30363D' }}
              disabled={loading}
            />
            <button onClick={() => send()} disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-all"
              style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}>
              <Send size={13} className="text-white" />
            </button>
          </div>
        </>
      )}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-4px);opacity:1} }`}</style>
    </div>
  )
}