import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import toast from 'react-hot-toast'

export function useModels() {
  return useQuery({
    queryKey: ['models'],
    queryFn: () => api.get('/models/').then(r => r.data),
    refetchInterval: 15000,
    staleTime: 5000,
  })
}

export function useModel(id) {
  return useQuery({
    queryKey: ['model', id],
    queryFn: () => api.get(`/models/${id}`).then(r => r.data),
    enabled: !!id,
  })
}

export function useDashboard(modelId) {
  return useQuery({
    queryKey: ['dashboard', modelId],
    queryFn: () => api.get(`/dashboard/summary/${modelId}`).then(r => r.data),
    enabled: !!modelId,
    refetchInterval: 20000,
    staleTime: 10000,
  })
}

export function useAuditResults(modelId) {
  return useQuery({
    queryKey: ['audit', modelId],
    queryFn: () => api.get(`/audit/${modelId}/results`).then(r => r.data),
    enabled: !!modelId,
    refetchInterval: 6000,
  })
}

export function useRunAudit() {
  const qc = useQueryClient()
  const { selectedModelId } = useAuthStore()
  return useMutation({
    mutationFn: (id) => api.post(`/audit/${id || selectedModelId}/run`),
    onSuccess: () => {
      toast.success('Adversarial audit started — Claude is red-teaming your model...')
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ['audit'] })
        qc.invalidateQueries({ queryKey: ['dashboard'] })
        qc.invalidateQueries({ queryKey: ['models'] })
      }, 8000)
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Audit failed to start'),
  })
}

export function useComplianceResults(modelId) {
  return useQuery({
    queryKey: ['compliance', modelId],
    queryFn: () => api.get(`/compliance/${modelId}/results`).then(r => r.data),
    enabled: !!modelId,
    refetchInterval: 15000,
  })
}

export function useRunCompliance() {
  const qc = useQueryClient()
  const { selectedModelId } = useAuthStore()
  return useMutation({
    mutationFn: (id) => api.post(`/compliance/${id || selectedModelId}/run`),
    onSuccess: () => {
      toast.success('Compliance engine running — mapping to EU AI Act, NIST RMF & DPDP...')
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ['compliance'] })
        qc.invalidateQueries({ queryKey: ['dashboard'] })
      }, 10000)
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Compliance engine failed'),
  })
}

export function useDriftHistory(modelId, days = 30) {
  return useQuery({
    queryKey: ['drift', modelId, days],
    queryFn: () => api.get(`/drift/${modelId}/history?days=${days}`).then(r => r.data),
    enabled: !!modelId,
    refetchInterval: 30000,
  })
}

export function useSimulateDrift() {
  const qc = useQueryClient()
  const { selectedModelId } = useAuthStore()
  return useMutation({
    mutationFn: (id) => api.post(`/drift/${id || selectedModelId}/simulate`),
    onSuccess: () => {
      toast.success('30-day drift history generated.')
      qc.invalidateQueries({ queryKey: ['drift'] })
    },
  })
}

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get('/alerts/').then(r => r.data),
    refetchInterval: 10000,
  })
}

export function useMarkAlertRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.post(`/alerts/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })
}

export function usePricing() {
  return useQuery({
    queryKey: ['pricing'],
    queryFn: () => api.get('/auth/pricing').then(r => r.data),
    staleTime: Infinity,
  })
}

export function useSelectedModel() {
  const { selectedModelId } = useAuthStore()
  const dashboard = useDashboard(selectedModelId)
  const audit = useAuditResults(selectedModelId)
  const compliance = useComplianceResults(selectedModelId)
  const drift = useDriftHistory(selectedModelId)
  const alerts = useAlerts()

  return {
    modelId: selectedModelId,
    dashboard: dashboard.data,
    audit: audit.data?.[0] ?? null,
    allAudits: audit.data ?? [],
    compliance: compliance.data,
    drift: drift.data ?? [],
    alerts: alerts.data ?? [],
    unreadAlerts: (alerts.data ?? []).filter(a => !a.is_read).length,
    isLoading: dashboard.isLoading,
    model: dashboard.data?.model,
  }
}