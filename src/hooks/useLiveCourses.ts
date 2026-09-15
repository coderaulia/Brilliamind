import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Course, CourseModule, LessonType } from '@/data/types'
import { CATALOG_COURSES } from '@/data/mock-data'

export interface BackendCourse {
  id: string
  title: string
  slug: string
  description: string | null
  coverUrl: string | null
  category: string | null
  tags?: string[]
  price: number
  currency: string
  status: string
  createdAt: string
  instructorName?: string
  instructorAvatar?: string
  colorIdx?: number
  lessons?: number
  hours?: number
  level?: 'Beginner' | 'Intermediate' | 'Advanced'
  enrolled?: boolean
  progress?: number
  completed?: number
  rating?: number
  students?: number
}

export interface BackendLesson {
  id: string
  sectionId: string
  title: string
  type: string
  videoUrl?: string | null
  pdfUrl?: string | null
  contentJson?: Record<string, unknown> | null
  position: number
  isFreePreview?: boolean
}

export interface BackendSection {
  id: string
  courseId: string
  title: string
  position: number
  lessons: BackendLesson[]
}

function mapBackendCourseToFrontend(b: BackendCourse): Course {
  return {
    id: b.id,
    title: b.title,
    instructor: b.instructorName || 'Lead Instructor',
    instructorAvatar: b.instructorAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    instructorRole: 'Course Author',
    rating: b.rating ?? 4.8,
    students: b.students ?? 1250,
    lessons: b.lessons ?? 10,
    hours: b.hours ?? 3,
    category: b.category || 'General',
    level: b.level || 'Beginner',
    price: b.price ?? 0,
    colorIdx: b.colorIdx ?? 0,
    enrolled: Boolean(b.enrolled),
    progress: b.progress ?? 0,
    completed: b.completed ?? 0,
    description: b.description || 'Comprehensive training curriculum.',
    overview: b.description || undefined,
  }
}

function mapBackendTypeToFrontend(type: string): LessonType {
  if (type === 'youtube' || type === 'video') return 'video'
  if (type === 'quiz') return 'quiz'
  if (type === 'pdf') return 'resource'
  return 'article'
}

export function useLiveCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<string[]>(['All'])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<{ courses: BackendCourse[] }>('/api/courses')
      if (res.courses && res.courses.length > 0) {
        const mapped = res.courses.map(mapBackendCourseToFrontend)
        setCourses(mapped)

        // Derive unique categories from backend data
        const cats = Array.from(new Set(mapped.map(c => c.category).filter(Boolean)))
        setCategories(['All', ...cats])
      } else {
        setCourses(CATALOG_COURSES)
      }
    } catch (err) {
      console.warn('Backend API unavailable, falling back to cached seed courses:', err)
      setCourses(CATALOG_COURSES)
      setError('Using cached courses')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const enrollCourse = async (courseId: string | number) => {
    try {
      await api.post(`/api/courses/${courseId}/enroll`)
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, enrolled: true } : c))
      return true
    } catch {
      // optimistic update locally
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, enrolled: true } : c))
      return true
    }
  }

  return { courses, categories, loading, error, refetch: fetchCourses, enrollCourse }
}

export function useLiveCourseDetail(courseId: string | number | null) {
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<CourseModule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!courseId) {
      setCourse(null)
      setModules([])
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    const fetchDetail = async () => {
      try {
        const res = await api.get<{ course: BackendCourse; sections: BackendSection[] }>(`/api/courses/${courseId}`)
        if (!isMounted) return

        const frontendCourse = mapBackendCourseToFrontend(res.course)
        const frontendModules: CourseModule[] = (res.sections || []).map((sec) => ({
          id: sec.id,
          title: sec.title,
          lessons: sec.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            type: mapBackendTypeToFrontend(l.type),
            duration: l.type === 'youtube' ? '15 min' : '10 min',
            completed: false,
            videoUrl: l.videoUrl || undefined,
            articleContent: l.type === 'text' ? (l.contentJson?.text as string) : undefined,
          })),
        }))

        frontendCourse.modules = frontendModules
        setCourse(frontendCourse)
        setModules(frontendModules)
      } catch (err) {
        if (!isMounted) return
        console.warn(`Failed to fetch course ${courseId} from worker API, searching local catalog:`, err)
        const fallback = CATALOG_COURSES.find(c => String(c.id) === String(courseId)) || CATALOG_COURSES[0]
        setCourse(fallback)
        setModules(fallback.modules ?? [])
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchDetail()

    return () => {
      isMounted = false
    }
  }, [courseId])

  return { course, modules, loading, error }
}
