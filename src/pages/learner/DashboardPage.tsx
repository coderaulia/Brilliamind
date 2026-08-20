import StatCard from '@/components/ui/StatCard'
import CourseCard from '@/components/ui/CourseCard'
import ActivityFeedItem from '@/components/ui/ActivityFeedItem'
import ActivityHeatmap from '@/components/ui/ActivityHeatmap'
import ProgressRing from '@/components/ui/ProgressRing'
import {
  IconBook, IconCheck, IconAward, IconClock,
} from '@/components/ui/icons'
import { ENROLLED_COURSES, ACTIVITIES, STAT_ITEMS } from '@/data/mock-data'
import type { ThemeVariant } from '@/constants/design-tokens'
import type { ComponentType, SVGProps } from 'react'

type IconType = ComponentType<SVGProps<SVGSVGElement> & { s?: number }>

const STAT_ICONS: IconType[] = [IconBook, IconCheck, IconAward, IconClock]

interface DashboardPageProps {
  variant?: ThemeVariant
  onOpenCourse?: (id: number) => void
  onNavToCourses?: () => void
}

export default function DashboardPage({ variant = 'Deep Navy', onOpenCourse, onNavToCourses }: DashboardPageProps) {
  const v = variant === 'Bright Canvas' ? 'B' : 'A'
  const heatScheme = v === 'A' ? 'teal' : 'blue'

  const totalLessons = ENROLLED_COURSES.reduce((s, c) => s + c.lessons, 0)
  const totalDone    = ENROLLED_COURSES.reduce((s, c) => s + c.completed, 0)
  const overallPct   = Math.round((totalDone / totalLessons) * 100)

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28, background: 'var(--page-bg)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>

        {/* Hero */}
        {v === 'A' ? (
          <div style={{
            background: 'linear-gradient(135deg, #0C1526 0%, #0f3433 45%, #0d9488 100%)',
            borderRadius: 20, padding: '36px 40px', marginBottom: 24,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            color: '#fff', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: '8%', top: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(45,212,191,0.06)' }} />
            <div style={{ position: 'absolute', right: '30%', bottom: -70, width: 160, height: 160, borderRadius: '50%', background: 'rgba(6,182,212,0.05)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, opacity: 0.7, marginBottom: 6 }}>
                {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }}>
                Welcome back, Aulia
              </h1>
              <p style={{ fontSize: 15, opacity: 0.75, fontWeight: 500, lineHeight: 1.5 }}>
                You've completed {totalDone} of {totalLessons} lessons across {ENROLLED_COURSES.length} courses
              </p>
              <button
                onClick={() => onOpenCourse?.(ENROLLED_COURSES[0]?.id || 1)}
                style={{
                  marginTop: 18, padding: '11px 28px', borderRadius: 10, border: 'none',
                  background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', backdropFilter: 'blur(12px)', fontFamily: 'inherit',
                  transition: 'all 0.2s', letterSpacing: '0.01em',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'none' }}
              >
                Continue Learning →
              </button>
            </div>
            <ProgressRing
              progress={overallPct} size={130} strokeWidth={9}
              color="#2dd4bf" bgColor="rgba(255,255,255,0.12)" label="Overall"
            />
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>
                {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
                Welcome back, Aulia
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                  {totalDone}/{totalLessons} lessons
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-1)' }}>
                  {overallPct}% complete
                </div>
              </div>
              <ProgressRing
                progress={overallPct} size={52} strokeWidth={5}
                color="#3b82f6" bgColor="rgba(59,130,246,0.1)" showPercent={false}
              />
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {STAT_ITEMS.map((s, i) => (
            <div key={i} className="fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <StatCard icon={STAT_ICONS[i]} label={s.label} value={s.value} index={i} variant={v} />
            </div>
          ))}
        </div>

        {/* Courses */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>My Courses</h2>
            <span
              onClick={onNavToCourses}
              style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-1)', cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              View all →
            </span>
          </div>

          {v === 'A' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {ENROLLED_COURSES.map((c, i) => (
                <div key={c.id} className="fade-in-up" style={{ animationDelay: `${i * 0.07 + 0.15}s` }}>
                  <CourseCard course={c} variant="A" onClick={() => onOpenCourse?.(c.id)} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
              {ENROLLED_COURSES.map((c, i) => (
                <div key={c.id} className="fade-in-up" style={{ minWidth: 260, flexShrink: 0, animationDelay: `${i * 0.07 + 0.15}s` }}>
                  <CourseCard course={c} variant="B" onClick={() => onOpenCourse?.(c.id)} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Heatmap + Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          <div style={{
            background: 'var(--card-bg)', borderRadius: 16, padding: '22px 24px',
            border: '1px solid var(--card-border)',
          }} className="fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Learning Activity</h3>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Past 12 months</span>
            </div>
            <ActivityHeatmap scheme={heatScheme} />
          </div>

          <div style={{
            background: 'var(--card-bg)', borderRadius: 16, padding: '22px 24px',
            border: '1px solid var(--card-border)',
          }} className="fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Activity</h3>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-1)', cursor: 'pointer' }}>See all</span>
            </div>
            <div style={{ position: 'relative' }}>
              {v === 'A' && (
                <div style={{
                  position: 'absolute', left: 4, top: 10, bottom: 10,
                  width: 2, background: 'var(--card-border)', borderRadius: 1,
                }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: v === 'A' ? 18 : 10 }}>
                {ACTIVITIES.map((a, i) => (
                  <ActivityFeedItem key={i} activity={a} variant={v} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}
