import type { Course } from '../types'
import { COURSE_101 } from './course-101'
import { COURSE_102 } from './course-102'
import { COURSES_103_105 } from './courses-103-105'
import { COURSES_106_108 } from './courses-106-108'
import {
  VANAILA_CHANNEL_INFO,
  EXCEL_DISCUSSIONS,
  EXCEL_RESOURCES,
  SHEETS_DISCUSSIONS,
  SHEETS_RESOURCES,
  SALES_DISCUSSIONS,
  SALES_RESOURCES,
} from './metadata'

export * from './metadata'

const rawCourses: Course[] = [
  COURSE_101,
  COURSE_102,
  ...COURSES_103_105,
  ...COURSES_106_108,
]

export const VANAILA_MOCK_COURSES: Course[] = rawCourses.map((c) => {
  const isExcel = c.category === 'Excel'
  const isSheets = c.category === 'Spreadsheet'
  return {
    ...c,
    ...VANAILA_CHANNEL_INFO,
    discussions: isExcel
      ? EXCEL_DISCUSSIONS
      : isSheets
        ? SHEETS_DISCUSSIONS
        : SALES_DISCUSSIONS,
    resources: isExcel
      ? EXCEL_RESOURCES
      : isSheets
        ? SHEETS_RESOURCES
        : SALES_RESOURCES,
  }
})
