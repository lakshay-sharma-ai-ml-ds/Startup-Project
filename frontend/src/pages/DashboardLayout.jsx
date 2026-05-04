import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Database, Zap, Scale, TrendingDown, Bell, LogOut, Settings, ChevronRight, Shield } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import SheriffLogo from '../components/SheriffLogo'
import ModelSelector from '../components/ModelSelector'
import SheriffAssistant from '../components/SheriffAssistant'
import NotificationBell from '../components/NotificationBell'
import { useRealtimeAlerts } from '../hooks/useRealtimeAlerts'
import api from '../utils/api'

const NAV = [
  { to: '/dashboard', label: 'Command Center', icon: LayoutDashboard, exact: true },
  { to: '/dashboard/registry', label: 'Model Registry', icon: Database },
  { to: '/dashboard/audit', label: 'Audit Engine', icon: Zap },
  { to: '/dashboard/compliance', label: 'Compliance Engine', icon: Scale },
  { to: '/dashboard/drift', label: 'Drift Detection', icon: TrendingDown },
  { to: '/dashboard/alerts', label: 'Alert System', icon: Bell },
]

const BOTTOM_NAV = [
  { to: '/trust', label: 'Public Trust Registry', icon: Shield, external: true },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const TIER_BADGE = { free: 'badge-free', personal: 'badge-personal', enterprise: 'badge-enterprise' }

export default function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  useRealtimeAlerts()

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get('/alerts/').then(r => r.data),
    refetchInterval: 15000,
  })
  const unread = alerts.filter(a => !a.is_read).length

  return (
    <div className="flex h-screen bg-sheriff-dark overflow-hidden">
      <aside className="w-64 flex flex-col border-r border-sheriff-border/50 bg-sheriff-dark-2 flex-shrink-0">
        <div className="p-5 border-b border-sheriff-border/30"><SheriffLogo size={34}/></div>
        <div className="p-3 border-b border-sheriff-border/30"><ModelSelector/></div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${isActive ? 'bg-orange-500/15 text-orange-400 border border-orange-500/25' : 'text-sheriff-muted hover:text-white hover:bg-white/5'}`}>
              {({ isActive }) => (
                <>
                  <item.icon size={16} className={isActive ? 'text-orange-500' : 'group-hover:text-orange-500/70 transition-colors'}/>
                  <span className="flex-1">{item.label}</span>
                  {item.label === 'Alert System' && unread > 0 && (
                    <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[20px] text-center font-mono">{unread}</span>
                  )}
                  {isActive && <ChevronRight size={12} className="text-orange-500/60"/>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-2 border-b border-sheriff-border/30 space-y-0.5">
          {BOTTOM_NAV.map(item => (
            <NavLink key={item.to} to={item.to} target={item.external ? '_blank' : undefined}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${isActive && !item.external ? 'bg-orange-500/15 text-orange-400 border border-orange-500/25' : 'text-sheriff-muted hover:text-white hover:bg-white/5'}`}>
              <item.icon size={15} className="group-hover:text-orange-500/70 transition-colors"/>
              <span className="flex-1">{item.label}</span>
              {item.external && <span className="text-[10px] text-sheriff-muted/40">↗</span>}
            </NavLink>
          ))}
        </div>

        <div className="p-3 border-t border-sheriff-border/30">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-2">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-sm flex-shrink-0">
              {user?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium truncate">{user?.full_name || 'User'}</div>
              <div className="text-xs text-sheriff-muted truncate">{user?.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 mb-2 px-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${TIER_BADGE[user?.tier] || 'badge-free'}`}>{user?.tier || 'free'} plan</span>
          </div>
          <button onClick={() => { logout(); navigate('/') }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sheriff-muted hover:text-red-400 hover:bg-red-500/5 transition-all">
            <LogOut size={14}/> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto flex flex-col">
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-b border-sheriff-border/30 bg-sheriff-dark/80 backdrop-blur-sm flex-shrink-0">
          <NotificationBell/>
          <button onClick={() => navigate('/dashboard/settings')} className="p-2 rounded-lg text-sheriff-muted hover:text-white hover:bg-white/5 transition-all">
            <Settings size={15}/>
          </button>
        </div>
        <div className="flex-1"><Outlet/></div>
      </main>

      <SheriffAssistant/>
    </div>
  )
}