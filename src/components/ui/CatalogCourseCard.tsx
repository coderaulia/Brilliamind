import { useState } from 'react'
import { COVER_GRADIENTS } from '@/constants/design-tokens'
import ProgressRing from './ProgressRing'
import { IconStarFilled } from './icons'
import type { Course } from '@/data/mock-data'

interface CatalogCourseCardProps {
  course: Course
  index?: number
  onOpen?: () => void
}

export default function CatalogCourseCard({ course: c, index = 0, onOpen }: CatalogCourseCardProps) {
  const [hov, setHov] = useState(false)
  const grad = COVER_GRADIENTS[c.colorIdx % COVER_GRADIENTS.length]

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="fade-in-up"
      style={{
        background: 'var(--card-bg)', borderRadius: 16, overflow: 'hidden',
        border: '1px solid var(--card-border)', cursor: 'pointer',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? '0 16px 40px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
        animationDelay: `${index * 0.05}s`,
      }}
    >
      {/* Cover */}
      <div style={{ height: 120, background: grad, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', left: '30%', bottom: -25, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        {c.price === 0 && (
          <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,0.25)', color: '#fff', padding: '4px 10px', borderRadius: 20, backdropFilter: 'blur(8px)' }}>
            FREE
          </div>
        )}
        <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '3px 10px', borderRadius: 20, backdropFilter: 'blur(8px)' }}>
          {c.category}
        </div>
        {c.enrolled && (
          <div style={{ position: 'absolute', bottom: 10, right: 10, width: 40, height: 40 }}>
            <ProgressRing progress={c.progress} size={40} strokeWidth={3} color="#fff" bgColor="rgba(255,255,255,0.2)" showPercent />
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--page-bg)', padding: '2px 8px', borderRadius: 6 }}>
            {c.level}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
            {c.hours}h · {c.lessons} lessons
          </span>
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.35 }}>
          {c.title}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6, flexShrink: 0,
            background: grad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 9, fontWeight: 700,
          }}>
            {c.instructorAvatar}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{c.instructor}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b' }}>
            <IconStarFilled s={13} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{c.rating}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>({c.students.toLocaleString()})</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: c.price === 0 ? '#14b8a6' : 'var(--text-primary)' }}>
            {c.price === 0 ? 'Free' : `$${c.price}`}
          </span>
        </div>
      </div>
    </div>
  )
}
