import { useState } from 'react'
import { COVER_GRADIENTS, STAT_COLORS } from '@/constants/design-tokens'
import ProgressRing from './ProgressRing'
import type { Course } from '@/data/mock-data'

interface CourseCardProps {
  course: Course
  variant?: 'A' | 'B'
  onClick?: () => void
}

export default function CourseCard({ course, variant = 'A', onClick }: CourseCardProps) {
  const [hov, setHov] = useState(false)
  const grad = COVER_GRADIENTS[course.colorIdx % COVER_GRADIENTS.length]

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--card-bg)', borderRadius: 16, overflow: 'hidden',
        border: '1px solid var(--card-border)',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? '0 16px 40px rgba(0,0,0,0.12)' : '0 2px 6px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease', cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Cover */}
      <div style={{
        height: variant === 'A' ? 110 : 96,
        background: grad, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -16, top: -16, width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', left: '25%', bottom: -20, width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        {variant === 'A' && (
          <ProgressRing
            progress={course.progress} size={56} strokeWidth={4}
            color="#fff" bgColor="rgba(255,255,255,0.2)" showPercent
          />
        )}
        <div style={{
          position: 'absolute', top: 10, left: 10, fontSize: 10, fontWeight: 700,
          background: 'rgba(255,255,255,0.2)', color: '#fff',
          padding: '3px 10px', borderRadius: 20, backdropFilter: 'blur(8px)', letterSpacing: '0.02em',
        }}>
          {course.category}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px' }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 5, lineHeight: 1.35 }}>
          {course.title}
        </h4>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: variant === 'B' ? 12 : 8, fontWeight: 500 }}>
          {course.instructor}
        </p>

        {variant === 'B' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
              <span>{course.completed}/{course.lessons} lessons</span>
              <span>{course.progress}%</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: 'rgba(148,163,184,0.15)' }}>
              <div style={{ height: '100%', borderRadius: 3, background: grad, width: course.progress + '%', transition: 'width 1.2s ease' }} />
            </div>
          </div>
        )}

        {variant === 'A' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
              {course.completed}/{course.lessons} lessons
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: STAT_COLORS[course.colorIdx % 4] }}>
              {course.progress}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
