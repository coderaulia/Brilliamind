import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { ENROLLED_COURSES, ACTIVITIES } from '@/data/mock-data'
import { MOCK_DATA_ENABLED } from '@/lib/mock-mode'
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
  { label: 'Courses in Progress', value: 0 },
  { label: 'Completed Lessons', value: 0 },
  { label: 'Certificates Earned', value: 0 },
  { label: 'Hours Learned', value: '0 hrs' },
]

export function useLiveDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [stats, setStats] = useState<StatItemLive[]>(DEFAULT_STATS)
  const [activities] = useState<Activity[]>(MOCK_DATA_ENABLED ? ACTIVITIES : [])
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
          rating: 0,
          students: 0,
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
          { label: 'Courses in Progress', value: mapped.filter(c => c.progress < 100).length },
          { label: 'Completed Lessons', value: totalDone, change: `${totalL} total`, up: true },
          { label: 'Certificates Earned', value: res.completedCourses },
          { label: 'Hours Learned', value: `${hoursEst} hrs` },
        ])
      } else {
        setEnrolledCourses(MOCK_DATA_ENABLED ? ENROLLED_COURSES : [])
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      setEnrolledCourses(MOCK_DATA_ENABLED ? ENROLLED_COURSES : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return { enrolledCourses, stats, activities, loading, refetch: fetchDashboard }
}
