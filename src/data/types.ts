export interface Course {
  id: number
  title: string
  instructor: string
  instructorAvatar: string
  instructorRole?: string
  rating: number
  students: number
  lessons: number
  hours: number
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  price: number
  colorIdx: number
  enrolled: boolean
  progress: number
  completed: number
  description: string
  overview?: string
  whatYouWillLearn?: string[]
  requirements?: string[]
  modules?: CourseModule[]
}

export type LessonType = 'video' | 'article' | 'quiz' | 'resource'

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface Lesson {
  id: string
  title: string
  type: LessonType
  duration: string // e.g. "12 min" or "5 min read" or "5 questions"
  completed: boolean
  videoUrl?: string
  articleContent?: string
  quizQuestions?: QuizQuestion[]
  resources?: { title: string; size: string; downloadUrl: string }[]
}

export interface CourseModule {
  id: string
  title: string
  description?: string
  lessons: Lesson[]
}

export interface Activity {
  type: 'lesson' | 'quiz' | 'start' | 'cert' | 'enroll'
  text: string
  course: string
  time: string
}

export interface HeatmapDay {
  date: Date
  level: number
}

export interface CertificateItem {
  id: string
  uuid: string
  courseId: number
  courseTitle: string
  recipientName: string
  issueDate: string
  grade: string
  score: number
  instructorName: string
  instructorRole: string
  skillsAcquired: string[]
  credentialUrl: string
}

export interface CalendarEvent {
  id: string
  title: string
  type: 'live' | 'quiz_deadline' | 'study_goal' | 'assignment'
  date: string // YYYY-MM-DD
  time: string
  duration: string
  courseTitle: string
  instructor?: string
  meetingLink?: string
}

export interface DiscussionComment {
  id: string
  authorName: string
  authorAvatar: string
  authorRole: 'Learner' | 'Instructor' | 'Teaching Assistant'
  createdAt: string
  content: string
  upvotes: number
  hasUpvoted?: boolean
  replies?: DiscussionComment[]
}

export interface LearnerNote {
  id: string
  lessonId: string
  lessonTitle: string
  timestampSec?: number
  content: string
  updatedAt: string
}
