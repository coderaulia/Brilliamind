import type { Course } from '../types'
import { COURSE_101 } from './course-101'
import { COURSE_102 } from './course-102'
import { COURSES_103_105 } from './courses-103-105'
import { COURSES_106_108 } from './courses-106-108'

export const VANAILA_MOCK_COURSES: Course[] = [
  COURSE_101,
  COURSE_102,
  ...COURSES_103_105,
  ...COURSES_106_108,
]
