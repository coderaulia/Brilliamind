import type { Course } from '../types'
import { COURSE_101 } from './course-101'
import { COURSE_102 } from './course-102'
import { COURSES_103_105 } from './courses-103-105'
import { COURSES_106_108 } from './courses-106-108'
import { COURSE_109 } from './course-109'
import { COURSE_110 } from './course-110'
import { COURSE_111 } from './course-111'
import { COURSE_112 } from './course-112'
import { COURSE_113 } from './course-113'
import {
  VANAILA_CHANNEL_INFO,
  EXCEL_DISCUSSIONS,
  EXCEL_RESOURCES,
  SHEETS_DISCUSSIONS,
  SHEETS_RESOURCES,
  SALES_DISCUSSIONS,
  SALES_RESOURCES,
  PM_DISCUSSIONS,
  PM_RESOURCES,
} from './metadata'

export * from './metadata'

const rawCourses: Course[] = [
  COURSE_101,
  COURSE_102,
  ...COURSES_103_105,
  ...COURSES_106_108,
  COURSE_109,
  COURSE_110,
  COURSE_111,
  COURSE_112,
  COURSE_113,
]

// Channel & Attribution mapping per course
function getCourseAttribution(c: Course) {
  if (c.id === 109) {
    return {
      channelTitle: 'How to Hub',
      channelUrl: 'https://www.youtube.com/playlist?list=PLPudAvZgYEwjzEHAqay9qQtraXuvW0rAJ',
      credits: 'Original Kalodata educational series by How to Hub. Curated for BrilliaMind.',
    }
  }
  if (c.id === 110) {
    return {
      channelTitle: 'Derek Kumo',
      channelUrl: 'https://www.youtube.com/playlist?list=PLQdnumwh6d1ANOKa9tgvyEsArJBuhPOCq',
      credits: 'TikTok Shop Affiliate training tutorials by Derek Kumo. Curated for BrilliaMind.',
    }
  }
  if (c.id === 111) {
    return {
      channelTitle: 'Leila Gharani',
      channelUrl: 'https://www.youtube.com/playlist?list=PLmHVyfmcRKywSDL1okIuzUmpj_1tFw_-C',
      credits: 'Excel Pivot Tables series by Leila Gharani (Microsoft MVP). Curated for BrilliaMind.',
    }
  }
  if (c.id === 112) {
    return {
      channelTitle: 'Project Management Application',
      channelUrl: 'https://www.youtube.com/playlist?list=PLGmHUMIVgQ3V4iOOV5kzfHKI_pvEX38S4',
      credits: 'MS Excel for Project Management series by Project Management Application. Curated for BrilliaMind.',
    }
  }
  if (c.id === 113) {
    return {
      channelTitle: 'Engineeringly',
      channelUrl: 'https://www.youtube.com/playlist?list=PL3elkKFOw1HPCDLD_fLqnNfyakb2nmMvW',
      credits: 'Microsoft Excel for Project Management masterclass by Engineeringly. Curated for BrilliaMind.',
    }
  }
  return VANAILA_CHANNEL_INFO
}

export const VANAILA_MOCK_COURSES: Course[] = rawCourses.map((c) => {
  const isExcel = c.category === 'Excel'
  const isSheets = c.category === 'Spreadsheet'
  const isPM = c.category === 'Project Management'
  const attribution = getCourseAttribution(c)

  return {
    ...c,
    ...attribution,
    discussions: isPM
      ? PM_DISCUSSIONS
      : isExcel
        ? EXCEL_DISCUSSIONS
        : isSheets
          ? SHEETS_DISCUSSIONS
          : SALES_DISCUSSIONS,
    resources: isPM
      ? PM_RESOURCES
      : isExcel
        ? EXCEL_RESOURCES
        : isSheets
          ? SHEETS_RESOURCES
          : SALES_RESOURCES,
  }
})
