import { useState, type ReactNode } from 'react'
import AppSidebar from './AppSidebar'
import AppTopNav from './AppTopNav'
import { THEMES, type ThemeVariant } from '@/constants/design-tokens'
import type { PageId } from '@/types/nav'

export type { PageId }

interface AppShellProps {
  children: ReactNode
  activePage: PageId
  onNav: (id: PageId) => void
  variant?: ThemeVariant
  showStreak?: boolean
}

export default function AppShell({
  children,
  activePage,
  onNav,
  variant = 'Deep Navy',
  showStreak = true,
}: AppShellProps) {
  const theme = THEMES[variant]

  return (
    <div
      style={{
        ...theme,
        width: '100%', height: '100vh',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        color: 'var(--text-primary)',
        transition: 'background 0.35s ease, color 0.35s ease',
      } as React.CSSProperties}
    >
      <AppTopNav variant={variant} showStreak={showStreak} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <AppSidebar active={activePage} onNav={onNav} variant={variant} />
        {children}
      </div>
    </div>
  )
}

// Theme switcher hook — shared across pages
export function useTheme(defaultVariant: ThemeVariant = 'Deep Navy') {
  const [variant, setVariant] = useState<ThemeVariant>(defaultVariant)
  return { variant, setVariant }
}
