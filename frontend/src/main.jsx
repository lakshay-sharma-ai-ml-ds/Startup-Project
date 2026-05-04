import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import DashboardLayout from './pages/DashboardLayout'
import HomeDashboard from './pages/HomeDashboard'
import ModelRegistry from './pages/ModelRegistry'
import AuditEngine from './pages/AuditEngine'
import ComplianceEngine from './pages/ComplianceEngine'
import DriftDetection from './pages/DriftDetection'
import AlertSystem from './pages/AlertSystem'
import TrustBadgePage from './pages/TrustBadgePage'
import SettingsPage from './pages/SettingsPage'
import { useAuthStore } from './store/authStore'

const queryClient = new QueryClient()

function ProtectedRoute({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? children : <Navigate to="/auth" replace />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { background: '#161B22', color: '#E6EDF3', border: '1px solid #30363D' }, duration: 4000 }} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/trust" element={<TrustBadgePage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<HomeDashboard />} />
            <Route path="registry" element={<ModelRegistry />} />
            <Route path="audit" element={<AuditEngine />} />
            <Route path="compliance" element={<ComplianceEngine />} />
            <Route path="drift" element={<DriftDetection />} />
            <Route path="alerts" element={<AlertSystem />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)