import CourseCard from '@/components/ui/CourseCard'
import { ENROLLED_COURSES } from '@/data/mock-data'

interface MyCoursesPageProps {
  onOpenCourse?: (id: number) => void
}

export default function MyCoursesPage({ onOpenCourse }: MyCoursesPageProps) {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28, background: 'var(--page-bg)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
          My Courses
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 24 }}>
          {ENROLLED_COURSES.length} courses in progress
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {ENROLLED_COURSES.map((c, i) => (
            <div
              key={c.id}
              className="fade-in-up"
              style={{ animationDelay: `${i * 0.06}s` }}
              onClick={() => onOpenCourse?.(c.id)}
            >
              <CourseCard course={c} variant="A" onClick={() => onOpenCourse?.(c.id)} />
            </div>
          ))}
        </div>
        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}
