import type { SeedCourse } from './vanaila/types'
import { courseExcel01 } from './vanaila/course-excel-01'
import { courseExcel02 } from './vanaila/course-excel-02'
import { coursesExcelMore } from './vanaila/courses-excel-more'
import { coursesSheetsSales } from './vanaila/courses-sheets-sales'

export * from './vanaila/types'

export const vanailaInstructor = {
  id: 'usr-inst-vanaila',
  email: 'vanaila.course@brilliamind.id',
  name: 'Vanaila Course',
  role: 'instructor' as const,
  status: 'active' as const,
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  bio: 'Expert technical training educator specializing in Microsoft Excel, Google Sheets Spreadsheets, and Sales & Marketing BI Dashboards.',
  createdAt: '2026-09-15T00:00:00.000Z',
}

export const vanailaCourses: SeedCourse[] = [
  courseExcel01,
  courseExcel02,
  ...coursesExcelMore,
  ...coursesSheetsSales,
]
