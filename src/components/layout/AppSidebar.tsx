import { useState } from 'react'
import {
  IconDashboard, IconBook, IconGrid,
  IconCalendar, IconAward, IconSettings,
} from '@/components/ui/icons'
import type { ThemeVariant } from '@/constants/design-tokens'
import type { PageId } from '@/types/nav'

export const NAV_ITEMS = [
  { id: 'dashboard'    as PageId, label: 'Dashboard',    icon: IconDashboard },
  { id: 'courses'      as PageId, label: 'My Courses',   icon: IconBook },
  { id: 'catalog'      as PageId, label: 'Catalog',      icon: IconGrid },
  { id: 'calendar'     as PageId, label: 'Calendar',     icon: IconCalendar },
  { id: 'certificates' as PageId, label: 'Certificates', icon: IconAward },
  { id: 'settings'     as PageId, label: 'Settings',     icon: IconSettings, bottom: true },
] as const

interface AppSidebarProps {
  active: PageId
  onNav: (id: PageId) => void
  variant: ThemeVariant
}

export default function AppSidebar({ active, onNav, variant }: AppSidebarProps) {
  const isDark = variant === 'Deep Navy'
  const [hovered, setHovered] = useState<string | null>(null)

  const navBtn = (item: typeof NAV_ITEMS[number]) => {
    const isActive = active === item.id
    const isHov = hovered === item.id
    const Icon = item.icon
    return (
      <button
        key={item.id}
        onClick={() => onNav(item.id)}
        onMouseEnter={() => setHovered(item.id)}
        onMouseLeave={() => setHovered(null)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
          borderRadius: 10, border: 'none', cursor: 'pointer', width: '100%',
          background: isActive
            ? 'var(--sidebar-active-bg)'
            : isHov ? 'var(--sidebar-hover-bg)' : 'transparent',
          color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
          fontSize: 14, fontWeight: isActive ? 600 : 500, fontFamily: 'inherit',
          transition: 'all 0.15s ease', textAlign: 'left', position: 'relative',
        }}
      >
        {isDark && isActive && (
          <div style={{
            position: 'absolute', left: -12, top: '50%', transform: 'translateY(-50%)',
            width: 3, height: 22, borderRadius: 2, background: '#14b8a6',
          }} />
        )}
        <Icon s={19} />
        <span>{item.label}</span>
      </button>
    )
  }

  return (
    <div style={{
      width: 232, height: '100%', background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex', flexDirection: 'column', padding: '20px 12px', flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px', marginBottom: 28 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: isDark ? 'linear-gradient(135deg, #3B5278, #2a3d5e)' : '#3B5278',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 16, fontWeight: 800,
        }}>V</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: isDark ? '#e2e8f0' : '#1e293b', lineHeight: 1.1 }}>
            VanOS
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--sidebar-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Learning
          </div>
        </div>
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--sidebar-text)', padding: '0 12px', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.6 }}>
        Menu
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.filter(n => !('bottom' in n)).map(navBtn)}
      </div>

      <div style={{ borderTop: '1px solid var(--sidebar-border)', paddingTop: 12, marginTop: 8 }}>
        {NAV_ITEMS.filter(n => 'bottom' in n).map(navBtn)}
      </div>
    </div>
  )
}
