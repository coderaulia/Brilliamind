import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { ENROLLED_COURSES, ACTIVITIES } from '@/data/mock-data'
import type { Course, Activity } from '@/data/types'

export interface EnrolledProgressCourse {
  courseId: string
  title: string
  slug: string
  coverUrl: string | null
  category: string
  instructorName: string
  enrolledAt: string
  completedAt: string | null
  totalLessons: number
  completedLessons: number
  progressPct: number
  isCompleted: boolean
}

export interface DashboardResponse {
  enrolledCourses: EnrolledProgressCourse[]
  totalEnrolled: number
  completedCourses: number
}

export interface StatItemLive {
  label: string
  value: string | number
  change?: string
  up?: boolean
}

const DEFAULT_STATS: StatItemLive[] = [
  { label: 'Courses in Progress', value: 4, change: '+2 this month', up: true },
  { label: 'Completed Lessons', value: 38, change: '+12 this week', up: true },
  { label: 'Certificates Earned', value: 2, change: 'Top 5%', up: true },
  { label: 'Hours Learned', value: '42 hrs', change: '+3.5 hrs this week', up: true },
]

export function useLiveDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [stats, setStats] = useState<StatItemLive[]>(DEFAULT_STATS)
  const [activities] = useState<Activity[]>(ACTIVITIES)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<DashboardResponse>('/api/progress/dashboard')
      if (res.enrolledCourses && res.enrolledCourses.length > 0) {
        const mapped: Course[] = res.enrolledCourses.map((c, i) => ({
          id: c.courseId,
          title: c.title,
          instructor: c.instructorName,
          instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
          instructorRole: 'Instructor',
          rating: 4.9,
          students: 1200,
          lessons: c.totalLessons || 1,
          hours: Math.max(1, Math.round(c.totalLessons * 0.25)),
          category: c.category,
          level: 'Beginner',
          price: 0,
          colorIdx: i % 4,
          enrolled: true,
          progress: c.progressPct,
          completed: c.completedLessons,
          description: '',
        }))
        setEnrolledCourses(mapped)

        const totalL = mapped.reduce((acc, crs) => acc + crs.lessons, 0)
        const totalDone = mapped.reduce((acc, crs) => acc + crs.completed, 0)
        const hoursEst = Math.round(totalDone * 0.25)

        setStats([
          { label: 'Courses in Progress', value: mapped.filter(c => c.progress < 100).length, change: '+2 this month', up: true },
          { label: 'Completed Lessons', value: totalDone, change: `${totalL} total`, up: true },
          { label: 'Certificates Earned', value: res.completedCourses, change: 'Top 5%', up: true },
          { label: 'Hours Learned', value: `${hoursEst} hrs`, change: '+3.5 hrs this week', up: true },
        ])
      } else {
        setEnrolledCourses(ENROLLED_COURSES)
      }
    } catch {
      // Offline fallback
      setEnrolledCourses(ENROLLED_COURSES)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return { enrolledCourses, stats, activities, loading, refetch: fetchDashboard }
}
