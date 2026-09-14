import type {
  Course,
  Activity,
  HeatmapDay,
  CertificateItem,
  CalendarEvent,
  DiscussionComment,
} from './types'
import { SAMPLE_MODULES } from './sample-modules'
import { VANAILA_MOCK_COURSES } from './vanaila-mock-courses'

// Re-export all types so existing imports continue to work without change
export * from './types'
export * from './sample-modules'

export const CATALOG_COURSES: Course[] = [
  {
    id: 1,
    title: 'UX Design Fundamentals',
    instructor: 'Sarah Chen',
    instructorAvatar: 'SC',
    instructorRole: 'Principal Product Designer at Stripe',
    rating: 4.8,
    students: 2340,
    lessons: 24,
    hours: 18,
    category: 'Design',
    level: 'Beginner',
    price: 0,
    colorIdx: 0,
    enrolled: true,
    progress: 68,
    completed: 16,
    description:
      'Master the fundamentals of user experience design. Learn research methods, wireframing, prototyping, and usability testing from industry experts.',
    overview:
      'This comprehensive course equips you with the real-world skills to research, design, and validate intuitive digital products. Guided by top product designers, you will build portfolio-ready case studies.',
    whatYouWillLearn: [
      'Conduct empathy-driven user interviews and qualitative research',
      'Apply Jakob Nielsen 10 Usability Heuristics to product audits',
      'Construct scalable 8-pt spatial grid layouts and wireframes',
      'Benchmark product usability with SUS, CSAT and task completion metrics',
      'Deliver developer-ready design system tokens in Figma',
    ],
    requirements: [
      'No prior design or coding experience required',
      'A computer with modern web browser and free Figma account',
      'Willingness to conduct 2 mock user interview sessions',
    ],
    modules: SAMPLE_MODULES[1],
  },
  {
    id: 2,
    title: 'Advanced JavaScript',
    instructor: 'Marcus Webb',
    instructorAvatar: 'MW',
    instructorRole: 'Staff Frontend Engineer & TC39 Contributor',
    rating: 4.9,
    students: 3120,
    lessons: 32,
    hours: 28,
    category: 'Development',
    level: 'Advanced',
    price: 49,
    colorIdx: 1,
    enrolled: true,
    progress: 42,
    completed: 13,
    description:
      'Deep dive into advanced JavaScript concepts including closures, async patterns, design patterns, and performance optimization techniques.',
    overview:
      'Unlock the underlying mechanics of the JavaScript V8 engine, asynchronous concurrency models, memory allocation, closures, event loops, and functional architecture patterns.',
    whatYouWillLearn: [
      'Master V8 engine execution contexts, call stack, and garbage collection',
      'Deep dive into microtask vs macrotask event loop queues',
      'Build robust custom Async Iterators and Web Streams',
      'Implement design patterns: Proxy, Observer, Factory, and Singleton in ESNext',
      'Profile memory leaks and optimize bundle execution speeds',
    ],
    requirements: [
      'Solid intermediate understanding of JavaScript & ES6 syntax',
      'Familiarity with Node.js and modern web browsers',
    ],
    modules: SAMPLE_MODULES[1],
  },
  {
    id: 3,
    title: 'Data Analytics with Python',
    instructor: 'Priya Patel',
    instructorAvatar: 'PP',
    instructorRole: 'Lead Data Scientist at Grab',
    rating: 4.7,
    students: 1850,
    lessons: 18,
    hours: 14,
    category: 'Analytics',
    level: 'Intermediate',
    price: 39,
    colorIdx: 2,
    enrolled: true,
    progress: 91,
    completed: 16,
    description:
      'Learn to analyze and visualize data using Python, pandas, and matplotlib. Build real-world data analysis projects from scratch.',
    overview:
      'Transform raw data into strategic business insights using industry-standard Python libraries. Clean, transform, model, and visualize data efficiently.',
    whatYouWillLearn: [
      'Manipulate large tabular datasets with Pandas DataFrames',
      'Generate publication-quality charts with Seaborn and Matplotlib',
      'Perform statistical hypothesis testing and correlation analysis',
      'Automate ETL data cleaning workflows',
    ],
    requirements: [
      'Basic Python programming experience',
      'Jupyter Notebook or VS Code installed',
    ],
    modules: SAMPLE_MODULES[1],
  },
  {
    id: 4,
    title: 'Product Management 101',
    instructor: 'James Liu',
    instructorAvatar: 'JL',
    instructorRole: 'VP of Product at GoTo',
    rating: 4.6,
    students: 980,
    lessons: 20,
    hours: 16,
    category: 'Business',
    level: 'Beginner',
    price: 0,
    colorIdx: 3,
    enrolled: true,
    progress: 15,
    completed: 3,
    description:
      'Understand the product lifecycle, stakeholder management, roadmapping, and agile methodologies to become an effective product manager.',
    overview:
      'Learn the essentials of modern product leadership: identifying market opportunities, writing crisp PRDs, prioritizing roadmaps with RICE framework, and running agile sprints.',
    whatYouWillLearn: [
      'Formulate product strategy and North Star metrics',
      'Write comprehensive Product Requirement Documents (PRDs)',
      'Apply prioritization models (RICE, MoSCoW, Kano)',
      'Lead cross-functional engineering and design squads',
    ],
    requirements: ['No previous business or tech background needed'],
    modules: SAMPLE_MODULES[1],
  },
  {
    id: 5,
    title: 'Machine Learning Basics',
    instructor: 'Dr. Amir Karim',
    instructorAvatar: 'AK',
    instructorRole: 'AI Researcher & Former Google Scholar',
    rating: 4.9,
    students: 4200,
    lessons: 28,
    hours: 22,
    category: 'Analytics',
    level: 'Intermediate',
    price: 59,
    colorIdx: 4,
    enrolled: false,
    progress: 0,
    completed: 0,
    description:
      'Build a strong foundation in machine learning algorithms, model evaluation, and practical applications with scikit-learn.',
    overview:
      'Step into modern applied AI. Understand supervised vs unsupervised learning, gradient descent, neural networks, and deploying models to production.',
    whatYouWillLearn: [
      'Train regression, classification, and clustering models in Scikit-Learn',
      'Evaluate precision, recall, ROC-AUC, and F1 metrics',
      'Understand loss functions and gradient descent optimization',
      'Deploy REST inference endpoints with FastAPI',
    ],
    requirements: ['Intermediate Python & basic calculus/linear algebra'],
    modules: SAMPLE_MODULES[1],
  },
  {
    id: 6,
    title: 'UI Design with Figma',
    instructor: 'Nina Rodriguez',
    instructorAvatar: 'NR',
    instructorRole: 'Design Systems Lead',
    rating: 4.8,
    students: 2860,
    lessons: 22,
    hours: 17,
    category: 'Design',
    level: 'Beginner',
    price: 29,
    colorIdx: 0,
    enrolled: false,
    progress: 0,
    completed: 0,
    description:
      'Create stunning user interfaces using Figma. Learn component systems, auto-layout, prototyping, and design handoff workflows.',
    overview:
      'Master Figma from zero to advanced component properties, auto-layout 5.0, responsive constraints, variables, and design tokens.',
    whatYouWillLearn: [
      'Master auto-layout resizing, hugging, and padding controls',
      'Build reusable component sets with variant properties and booleans',
      'Implement light/dark mode variables and token alias hierarchies',
      'Craft animated smart-animate transitions and micro-interactions',
    ],
    requirements: ['Free Figma account'],
    modules: SAMPLE_MODULES[1],
  },
  {
    id: 7,
    title: 'React & Next.js Masterclass',
    instructor: 'Alex Turner',
    instructorAvatar: 'AT',
    instructorRole: 'Principal Architect',
    rating: 4.7,
    students: 1540,
    lessons: 36,
    hours: 30,
    category: 'Development',
    level: 'Advanced',
    price: 69,
    colorIdx: 1,
    enrolled: false,
    progress: 0,
    completed: 0,
    description:
      'Build production-ready applications with React and Next.js. Covers server components, API routes, authentication, and deployment.',
    overview:
      'Everything you need to ship enterprise full-stack web applications with React 19, Next.js App Router, Server Actions, Tailwind CSS, and edge databases.',
    whatYouWillLearn: [
      'Leverage React Server Components (RSC) and Suspense streaming',
      'Build secure database mutations with React 19 Server Actions',
      'Implement robust authentication and RBAC authorization',
      'Deploy and optimize Core Web Vitals on Cloudflare and Vercel',
    ],
    requirements: ['Good understanding of React basics and JavaScript ES6+'],
    modules: SAMPLE_MODULES[1],
  },
  {
    id: 8,
    title: 'Digital Marketing Strategy',
    instructor: 'Laura Kim',
    instructorAvatar: 'LK',
    instructorRole: 'Growth Marketing Director',
    rating: 4.5,
    students: 1120,
    lessons: 16,
    hours: 12,
    category: 'Business',
    level: 'Beginner',
    price: 0,
    colorIdx: 3,
    enrolled: false,
    progress: 0,
    completed: 0,
    description:
      'Develop comprehensive digital marketing strategies including SEO, content marketing, social media, and paid advertising campaigns.',
    overview:
      'Acquire high-converting customers through organic search, programmatic ad funnels, email automation, and conversion rate optimization (CRO).',
    whatYouWillLearn: [
      'Master modern SEO keyword clustering and technical crawl audits',
      'Design high-converting paid Google and Meta ad campaigns',
      'Set up automated lifecycle email funnels',
      'Calculate CAC, LTV, ROAS, and cohort retention',
    ],
    requirements: ['No prior experience required'],
    modules: SAMPLE_MODULES[1],
  },
  {
    id: 9,
    title: 'Cloud Architecture on AWS',
    instructor: 'Raj Mahajan',
    instructorAvatar: 'RM',
    instructorRole: 'AWS Solutions Architect Fellow',
    rating: 4.8,
    students: 2100,
    lessons: 26,
    hours: 24,
    category: 'Development',
    level: 'Advanced',
    price: 79,
    colorIdx: 4,
    enrolled: false,
    progress: 0,
    completed: 0,
    description:
      'Design and implement scalable cloud architectures on AWS. Covers EC2, S3, Lambda, DynamoDB, and infrastructure as code.',
    overview:
      'Build high-availability, fault-tolerant infrastructure on Amazon Web Services following the AWS Well-Architected Framework.',
    whatYouWillLearn: [
      'Design multi-AZ VPC topologies with public/private subnets and NAT gateways',
      'Implement serverless event-driven architectures with Lambda & SQS',
      'Configure auto-scaling groups with Application Load Balancers',
      'Deploy infrastructure as code using Terraform and CloudFormation',
    ],
    requirements: ['Basic Linux command line and networking concepts'],
    modules: SAMPLE_MODULES[1],
  },
  ...VANAILA_MOCK_COURSES,
]

export const ENROLLED_COURSES = CATALOG_COURSES.filter((c) => c.enrolled)

export const CATEGORIES = ['All', 'Design', 'Development', 'Analytics', 'Business', 'Excel', 'Spreadsheet', 'Sales']
export const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

export const ACTIVITIES: Activity[] = [
  {
    type: 'lesson',
    text: 'Completed "Conducting Effective User Interviews"',
    course: 'UX Design Fundamentals',
    time: '2h ago',
  },
  {
    type: 'quiz',
    text: 'Scored 100% on Heuristics & Research Quiz',
    course: 'UX Design Fundamentals',
    time: '4h ago',
  },
  {
    type: 'start',
    text: 'Started "Information Architecture & Grids"',
    course: 'UX Design Fundamentals',
    time: 'Yesterday',
  },
  {
    type: 'cert',
    text: 'Earned Verified Certificate in UI Foundations',
    course: 'UI Design Foundations',
    time: '3 days ago',
  },
  {
    type: 'enroll',
    text: 'Enrolled in "Product Management 101"',
    course: 'Product Management 101',
    time: '5 days ago',
  },
]

export const STAT_ITEMS = [
  { label: 'Enrolled', value: 4 },
  { label: 'Completed', value: 1 },
  { label: 'Certificates', value: 1 },
  { label: 'Hours', value: 58 },
]

export const MOCK_CERTIFICATES: CertificateItem[] = [
  {
    id: 'cert-1',
    uuid: 'bm-cert-2026-8942-ux',
    courseId: 1,
    courseTitle: 'UI Design Foundations & Design Systems',
    recipientName: 'Aulia Rahman',
    issueDate: 'August 12, 2026',
    grade: 'With Distinction (96%)',
    score: 96,
    instructorName: 'Sarah Chen',
    instructorRole: 'Principal Product Designer',
    skillsAcquired: ['Design Systems', 'Figma Variables', 'User Testing', 'Responsive Grids', 'Design Tokens'],
    credentialUrl: '/verify/bm-cert-2026-8942-ux',
  },
]

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    title: 'Live Workshop: UX Portfolio Critique & AMA',
    type: 'live',
    date: '2026-08-22',
    time: '19:00 - 20:30 WIB',
    duration: '90 min',
    courseTitle: 'UX Design Fundamentals',
    instructor: 'Sarah Chen',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: 'ev-2',
    title: 'Quiz Deadline: Module 2 Assessment',
    type: 'quiz_deadline',
    date: '2026-08-24',
    time: '23:59 WIB',
    duration: '20 min',
    courseTitle: 'UX Design Fundamentals',
  },
  {
    id: 'ev-3',
    title: 'Daily Study Goal (45 mins)',
    type: 'study_goal',
    date: '2026-08-21',
    time: '20:00 - 20:45 WIB',
    duration: '45 min',
    courseTitle: 'Advanced JavaScript',
  },
  {
    id: 'ev-4',
    title: 'Live Q&A: Async Patterns in V8',
    type: 'live',
    date: '2026-08-26',
    time: '18:30 - 19:30 WIB',
    duration: '60 min',
    courseTitle: 'Advanced JavaScript',
    instructor: 'Marcus Webb',
    meetingLink: 'https://meet.google.com/xyz-uvw-rst',
  },
]

export const MOCK_DISCUSSIONS: DiscussionComment[] = [
  {
    id: 'd-1',
    authorName: 'Budi Santoso',
    authorAvatar: 'BS',
    authorRole: 'Learner',
    createdAt: '2 hours ago',
    content:
      'When defining 8-point grid rules, should icon container sizes also strictly follow 8px intervals or is 20px / 28px standard for icons?',
    upvotes: 6,
    hasUpvoted: true,
    replies: [
      {
        id: 'd-1-r1',
        authorName: 'Sarah Chen',
        authorAvatar: 'SC',
        authorRole: 'Instructor',
        createdAt: '1 hour ago',
        content:
          'Great question Budi! Standard icon bounding boxes typically use a 4px sub-grid interval (e.g. 16px, 20px, 24px, 32px), with 24x24 being the industry standard for desktop and mobile navigation. The 8px rule applies strictly to structural margins and layout padding!',
        upvotes: 9,
      },
    ],
  },
  {
    id: 'd-2',
    authorName: 'Rina Wijaya',
    authorAvatar: 'RW',
    authorRole: 'Learner',
    createdAt: 'Yesterday',
    content:
      'The checklist for user interview questions is super helpful. I tested it on our company internal tool and caught 3 critical navigation flaws right away!',
    upvotes: 4,
  },
]

// Seeded heatmap data — stable across renders
export const HEATMAP_DATA: HeatmapDay[] = (() => {
  const days: HeatmapDay[] = []
  const now = new Date(2026, 7, 20)
  let seed = 54321
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  for (let i = 371; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dow = d.getDay()
    const weekday = dow > 0 && dow < 6
    const lvl = rand() < (weekday ? 0.62 : 0.22) ? Math.ceil(rand() * 4) : 0
    days.push({ date: new Date(d), level: lvl })
  }
  const startIdx = days.findIndex((d) => d.date.getDay() === 0)
  return days.slice(startIdx)
})()
