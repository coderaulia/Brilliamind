import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconBell, IconSearch, IconFire, IconChevRight } from '@/components/ui/icons'
import type { ThemeVariant } from '@/constants/design-tokens'
import type { PageId } from '@/types/nav'
import { useAuthStore } from '@/stores/auth'

interface AppTopNavProps {
  variant: ThemeVariant
  showStreak?: boolean
  onNav?: (id: PageId) => void
}

export default function AppTopNav({ variant, showStreak = true, onNav }: AppTopNavProps) {
  const isBright = variant === 'Bright Canvas'
  const [bellHov, setBellHov] = useState(false)
  const [avatarHov, setAvatarHov] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const displayName = user?.name || 'Learner'
  const firstName = displayName.split(' ')[0] || 'Learner'
  const initials = displayName
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'L'
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Learner'

  const handleSignOut = () => {
    setMenuOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <div style={{
      height: 60, background: 'var(--topnav-bg)',
      borderBottom: '1px solid var(--topnav-border)',
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
      flexShrink: 0, position: 'relative', zIndex: 40,
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
          fontWeight: 800, fontSize: 16, color: 'var(--accent-1)',
          letterSpacing: '-0.02em',
        }}>
          BrilliaMind
        </div>
        <div style={{ width: 1, height: 20, background: 'var(--topnav-border)' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          LEARNING PLATFORM
        </span>
      </div>

      {/* Search */}
      <div
        onClick={() => onNav?.('catalog')}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--page-bg)', borderRadius: 10, padding: '8px 16px',
          width: 300, border: '1px solid var(--card-border)', cursor: 'pointer',
        }}
      >
        <IconSearch s={16} style={{ opacity: 0.4, flexShrink: 0, color: 'var(--text-muted)' } as React.CSSProperties} />
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Search courses...</span>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
        {showStreak && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#92400e',
          }}>
            <IconFire s={14} />
            Active Learner
          </div>
        )}

        <div
          onMouseEnter={() => setBellHov(true)}
          onMouseLeave={() => setBellHov(false)}
          onClick={() => onNav?.('settings')}
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
          onClick={() => setMenuOpen(prev => !prev)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            padding: '4px 6px', borderRadius: 10,
            background: avatarHov || menuOpen ? 'var(--page-bg)' : 'transparent',
            transition: 'background 0.15s',
          }}
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #3B5278, #5b7eab)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 13, fontWeight: 700,
            }}>{initials}</div>
          )}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.15 }}>
              {firstName}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{roleLabel}</div>
          </div>
          <IconChevRight s={14} style={{ opacity: 0.3, transform: menuOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' } as React.CSSProperties} />
        </div>

        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              top: 50,
              right: 0,
              width: 210,
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: 12,
              boxShadow: '0 12px 32px rgba(0,0,0,0.22)',
              padding: 6,
              zIndex: 100,
            }}
          >
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--card-border)', marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{displayName}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || 'learner@brilliamind.com'}
              </div>
            </div>
            {onNav && (
              <button
                onClick={() => { setMenuOpen(false); onNav('settings') }}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8,
                  border: 'none', background: 'transparent', color: 'var(--text-primary)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Account Settings
              </button>
            )}
            {(user?.role === 'instructor' || user?.role === 'admin') && (
              <button
                onClick={() => { setMenuOpen(false); navigate('/instructor/courses') }}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8,
                  border: 'none', background: 'transparent', color: 'var(--accent-1)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Instructor Studio →
              </button>
            )}
            {user?.role === 'admin' && (
              <button
                onClick={() => { setMenuOpen(false); navigate('/admin') }}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8,
                  border: 'none', background: 'transparent', color: 'var(--accent-1)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Admin Console →
              </button>
            )}
            <button
              onClick={handleSignOut}
              style={{
                width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8,
                border: 'none', background: 'transparent', color: '#ef4444',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
