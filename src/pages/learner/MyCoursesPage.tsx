import CourseCard from '@/components/ui/CourseCard'
import { useLiveCourses } from '@/hooks/useLiveCourses'

interface MyCoursesPageProps {
  onOpenCourse?: (id: string | number) => void
}

export default function MyCoursesPage({ onOpenCourse }: MyCoursesPageProps) {
  const { courses, loading } = useLiveCourses()
  const enrolledCourses = courses.filter(c => c.enrolled)

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28, background: 'var(--page-bg)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
          My Courses
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 24 }}>
          {enrolledCourses.length} courses in progress {loading ? '(refreshing...)' : ''}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {enrolledCourses.map((c, i) => (
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
        {enrolledCourses.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 16, fontWeight: 600 }}>You haven't enrolled in any courses yet</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Browse the course catalog to start learning!</p>
          </div>
        )}
        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}
