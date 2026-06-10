import { useState, type ComponentType, type SVGProps } from 'react'
import { STAT_COLORS, STAT_GRADIENTS } from '@/constants/design-tokens'

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { s?: number }>

interface StatCardProps {
  icon: IconComponent
  label: string
  value: number | string
  index?: number
  variant?: 'A' | 'B'
}

export default function StatCard({ icon: Icon, label, value, index = 0, variant = 'A' }: StatCardProps) {
  const [hov, setHov] = useState(false)

  if (variant === 'B') {
    return (
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: STAT_GRADIENTS[index % 4],
          borderRadius: 16, padding: '22px 24px',
          color: '#fff', position: 'relative', overflow: 'hidden',
          transform: hov ? 'translateY(-3px)' : 'none',
          boxShadow: hov ? '0 12px 28px rgba(0,0,0,0.18)' : '0 4px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.25s ease', cursor: 'default',
        }}
      >
        <div style={{ position: 'absolute', right: -8, bottom: -8, opacity: 0.12 }}>
          <Icon s={72} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, opacity: 0.9 }}>
          <Icon s={18} />
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.01em' }}>{label}</span>
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      </div>
    )
  }

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--card-bg)', borderRadius: 14, padding: '20px 22px',
        border: '1px solid var(--card-border)',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? '0 8px 24px rgba(0,0,0,0.07)' : '0 1px 3px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease', cursor: 'default',
        display: 'flex', alignItems: 'center', gap: 16,
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: STAT_COLORS[index % 4] + '15',
        color: STAT_COLORS[index % 4],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon s={22} />
      </div>
      <div>
        <div style={{
          fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
          marginBottom: 4, letterSpacing: '0.03em', textTransform: 'uppercase',
        }}>
          {label}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </div>
      </div>
    </div>
  )
}
