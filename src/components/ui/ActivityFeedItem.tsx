import { ACT_COLORS } from '@/constants/design-tokens'
import {
  IconCheck, IconStar, IconPlay, IconAward, IconPlus,
} from './icons'
import type { Activity } from '@/data/mock-data'
import type { ComponentType, SVGProps } from 'react'

type IconType = ComponentType<SVGProps<SVGSVGElement> & { s?: number }>

const ACT_ICONS: Record<string, IconType> = {
  lesson: IconCheck,
  quiz:   IconStar,
  start:  IconPlay,
  cert:   IconAward,
  enroll: IconPlus,
}

interface ActivityFeedItemProps {
  activity: Activity
  variant?: 'A' | 'B'
}

export default function ActivityFeedItem({ activity, variant = 'A' }: ActivityFeedItemProps) {
  const color = ACT_COLORS[activity.type] ?? '#94a3b8'
  const Icon = ACT_ICONS[activity.type] ?? IconCheck

  if (variant === 'B') {
    return (
      <div style={{
        background: 'var(--card-bg)', borderRadius: 12, padding: '12px 14px',
        border: '1px solid var(--card-border)',
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: color + '15', color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon s={15} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
            {activity.text}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>
            {activity.course} · {activity.time}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', position: 'relative', paddingLeft: 22 }}>
      <div style={{
        position: 'absolute', left: 0, top: 5,
        width: 10, height: 10, borderRadius: '50%',
        background: color, boxShadow: `0 0 0 3px ${color}25`,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
          {activity.text}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>
          {activity.course} · {activity.time}
        </div>
      </div>
    </div>
  )
}
