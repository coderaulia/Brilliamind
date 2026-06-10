import { useState } from 'react'
import { IconBell, IconSearch, IconFire, IconChevRight } from '@/components/ui/icons'
import type { ThemeVariant } from '@/constants/design-tokens'

interface AppTopNavProps {
  variant: ThemeVariant
  showStreak?: boolean
}

export default function AppTopNav({ variant, showStreak = true }: AppTopNavProps) {
  const isBright = variant === 'Bright Canvas'
  const [bellHov, setBellHov] = useState(false)
  const [avatarHov, setAvatarHov] = useState(false)

  return (
    <div style={{
      height: 60, background: 'var(--topnav-bg)',
      borderBottom: '1px solid var(--topnav-border)',
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
      flexShrink: 0, position: 'relative',
    }}>
      {isBright && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)',
          borderRadius: '0 0 2px 2px',
        }} />
      )}

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 'auto' }}>
        <div style={{
          height: 26, display: 'flex', alignItems: 'center',
          fontWeight: 800, fontSize: 16, color: '#3B5278',
          letterSpacing: '-0.02em',
        }}>
          Vanaila Digital
        </div>
        <div style={{ width: 1, height: 20, background: 'var(--topnav-border)' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          LEARNING PLATFORM
        </span>
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--page-bg)', borderRadius: 10, padding: '8px 16px',
        width: 300, border: '1px solid var(--card-border)',
      }}>
        <IconSearch s={16} style={{ opacity: 0.4, flexShrink: 0, color: 'var(--text-muted)' } as React.CSSProperties} />
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Search courses...</span>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {showStreak && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#92400e',
          }}>
            <IconFire s={14} />
            12 day streak
          </div>
        )}

        <div
          onMouseEnter={() => setBellHov(true)}
          onMouseLeave={() => setBellHov(false)}
          style={{
            width: 38, height: 38, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-secondary)', position: 'relative',
            background: bellHov ? 'var(--page-bg)' : 'transparent',
            transition: 'background 0.15s',
          }}
        >
          <IconBell s={19} />
          <div style={{
            position: 'absolute', top: 7, right: 7,
            width: 8, height: 8, borderRadius: '50%',
            background: '#ef4444', border: '2px solid var(--topnav-bg)',
          }} />
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--topnav-border)', margin: '0 4px' }} />

        <div
          onMouseEnter={() => setAvatarHov(true)}
          onMouseLeave={() => setAvatarHov(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            padding: '4px 6px', borderRadius: 10,
            background: avatarHov ? 'var(--page-bg)' : 'transparent',
            transition: 'background 0.15s',
          }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #3B5278, #5b7eab)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 700,
          }}>A</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.15 }}>
              Aulia
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Learner</div>
          </div>
          <IconChevRight s={14} style={{ opacity: 0.3 } as React.CSSProperties} />
        </div>
      </div>
    </div>
  )
}
