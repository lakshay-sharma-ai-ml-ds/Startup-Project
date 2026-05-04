import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const SEV_EMOJIS = { critical: '🚨', high: '⚠️', medium: '🔶', low: 'ℹ️' }

export function useRealtimeAlerts() {
  const { token } = useAuthStore()
  const qc = useQueryClient()
  const wsRef = useRef(null)
  const reconnectTimer = useRef(null)
  const mounted = useRef(true)

  const connect = useCallback(() => {
    if (!token || !mounted.current) return

    const ws = new WebSocket(`ws://localhost:8000/ws/alerts?token=${token}`)
    wsRef.current = ws

    ws.onopen = () => console.log('[AI Sheriff] WebSocket connected')

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'alert') {
          const emoji = SEV_EMOJIS[data.severity] || '⚠️'
          const toastFn = data.severity === 'critical' || data.severity === 'high' ? toast.error : toast
          toastFn(`${emoji} ${data.title}`, {
            duration: 6000,
            style: {
              background: '#161B22', color: '#E6EDF3',
              border: `1px solid ${data.severity === 'critical' ? '#F85149' : data.severity === 'high' ? '#D29922' : '#30363D'}`,
            },
          })
          qc.invalidateQueries({ queryKey: ['alerts'] })
          qc.invalidateQueries({ queryKey: ['dashboard'] })
        }
        if (data.type === 'metric_update') {
          qc.invalidateQueries({ queryKey: ['dashboard', data.model_id] })
          qc.invalidateQueries({ queryKey: ['audit', data.model_id] })
          qc.invalidateQueries({ queryKey: ['drift', data.model_id] })
          qc.invalidateQueries({ queryKey: ['models'] })
        }
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }))
        }
      } catch (e) {}
    }

    ws.onclose = (event) => {
      if (!mounted.current) return
      if (event.code !== 1000 && event.code !== 4001) {
        reconnectTimer.current = setTimeout(connect, 5000)
      }
    }

    ws.onerror = () => ws.close()
  }, [token, qc])

  useEffect(() => {
    mounted.current = true
    connect()
    return () => {
      mounted.current = false
      clearTimeout(reconnectTimer.current)
      if (wsRef.current) wsRef.current.close(1000, 'Component unmounted')
    }
  }, [connect])

  const sendMessage = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  return { sendMessage }
}