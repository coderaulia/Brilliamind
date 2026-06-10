export interface Course {
  id: number
  title: string
  instructor: string
  instructorAvatar: string
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

export const CATALOG_COURSES: Course[] = [
  { id: 1, title: 'UX Design Fundamentals', instructor: 'Sarah Chen', instructorAvatar: 'SC', rating: 4.8, students: 2340, lessons: 24, hours: 18, category: 'Design', level: 'Beginner', price: 0, colorIdx: 0, enrolled: true, progress: 68, completed: 16, description: 'Master the fundamentals of user experience design. Learn research methods, wireframing, prototyping, and usability testing from industry experts.' },
  { id: 2, title: 'Advanced JavaScript', instructor: 'Marcus Webb', instructorAvatar: 'MW', rating: 4.9, students: 3120, lessons: 32, hours: 28, category: 'Development', level: 'Advanced', price: 49, colorIdx: 1, enrolled: true, progress: 42, completed: 13, description: 'Deep dive into advanced JavaScript concepts including closures, async patterns, design patterns, and performance optimization techniques.' },
  { id: 3, title: 'Data Analytics with Python', instructor: 'Priya Patel', instructorAvatar: 'PP', rating: 4.7, students: 1850, lessons: 18, hours: 14, category: 'Analytics', level: 'Intermediate', price: 39, colorIdx: 2, enrolled: true, progress: 91, completed: 16, description: 'Learn to analyze and visualize data using Python, pandas, and matplotlib. Build real-world data analysis projects from scratch.' },
  { id: 4, title: 'Product Management 101', instructor: 'James Liu', instructorAvatar: 'JL', rating: 4.6, students: 980, lessons: 20, hours: 16, category: 'Business', level: 'Beginner', price: 0, colorIdx: 3, enrolled: true, progress: 15, completed: 3, description: 'Understand the product lifecycle, stakeholder management, roadmapping, and agile methodologies to become an effective product manager.' },
  { id: 5, title: 'Machine Learning Basics', instructor: 'Dr. Amir Karim', instructorAvatar: 'AK', rating: 4.9, students: 4200, lessons: 28, hours: 22, category: 'Analytics', level: 'Intermediate', price: 59, colorIdx: 4, enrolled: false, progress: 0, completed: 0, description: 'Build a strong foundation in machine learning algorithms, model evaluation, and practical applications with scikit-learn.' },
  { id: 6, title: 'UI Design with Figma', instructor: 'Nina Rodriguez', instructorAvatar: 'NR', rating: 4.8, students: 2860, lessons: 22, hours: 17, category: 'Design', level: 'Beginner', price: 29, colorIdx: 0, enrolled: false, progress: 0, completed: 0, description: 'Create stunning user interfaces using Figma. Learn component systems, auto-layout, prototyping, and design handoff workflows.' },
  { id: 7, title: 'React & Next.js Masterclass', instructor: 'Alex Turner', instructorAvatar: 'AT', rating: 4.7, students: 1540, lessons: 36, hours: 30, category: 'Development', level: 'Advanced', price: 69, colorIdx: 1, enrolled: false, progress: 0, completed: 0, description: 'Build production-ready applications with React and Next.js. Covers server components, API routes, authentication, and deployment.' },
  { id: 8, title: 'Digital Marketing Strategy', instructor: 'Laura Kim', instructorAvatar: 'LK', rating: 4.5, students: 1120, lessons: 16, hours: 12, category: 'Business', level: 'Beginner', price: 0, colorIdx: 3, enrolled: false, progress: 0, completed: 0, description: 'Develop comprehensive digital marketing strategies including SEO, content marketing, social media, and paid advertising campaigns.' },
  { id: 9, title: 'Cloud Architecture on AWS', instructor: 'Raj Mahajan', instructorAvatar: 'RM', rating: 4.8, students: 2100, lessons: 26, hours: 24, category: 'Development', level: 'Advanced', price: 79, colorIdx: 4, enrolled: false, progress: 0, completed: 0, description: 'Design and implement scalable cloud architectures on AWS. Covers EC2, S3, Lambda, DynamoDB, and infrastructure as code.' },
]

export const ENROLLED_COURSES = CATALOG_COURSES.filter(c => c.enrolled)

export const CATEGORIES = ['All', 'Design', 'Development', 'Analytics', 'Business']
export const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

export const ACTIVITIES: Activity[] = [
  { type: 'lesson', text: 'Completed "Typography Basics"',   course: 'UX Design Fundamentals', time: '2h ago' },
  { type: 'quiz',   text: 'Scored 85% on JS Arrays Quiz',    course: 'Advanced JavaScript',     time: '5h ago' },
  { type: 'start',  text: 'Started "Data Visualization"',    course: 'Data Analytics',           time: 'Yesterday' },
  { type: 'cert',   text: 'Earned certificate',              course: 'UI Design Foundations',    time: '2 days ago' },
  { type: 'enroll', text: 'Enrolled in new course',          course: 'ML Basics',                time: '3 days ago' },
]

export const STAT_ITEMS = [
  { label: 'Enrolled',     value: 5  },
  { label: 'Completed',    value: 2  },
  { label: 'Certificates', value: 1  },
  { label: 'Hours',        value: 47 },
]

// Seeded heatmap data — stable across renders
export const HEATMAP_DATA: HeatmapDay[] = (() => {
  const days: HeatmapDay[] = []
  const now = new Date(2026, 5, 9)
  let seed = 54321
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  for (let i = 371; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    const dow = d.getDay()
    const weekday = dow > 0 && dow < 6
    const lvl = rand() < (weekday ? 0.62 : 0.22) ? Math.ceil(rand() * 4) : 0
    days.push({ date: new Date(d), level: lvl })
  }
  const startIdx = days.findIndex(d => d.date.getDay() === 0)
  return days.slice(startIdx)
})()
