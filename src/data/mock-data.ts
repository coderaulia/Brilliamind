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

export const SAMPLE_MODULES: Record<number, CourseModule[]> = {
  1: [
    {
      id: 'm1',
      title: 'Module 1: Foundations of User Experience',
      description: 'Understand core design heuristics, user mental models, and the design thinking loop.',
      lessons: [
        {
          id: 'l1-1',
          title: '1.1 Introduction to Modern UX Heuristics',
          type: 'video',
          duration: '14 min',
          completed: true,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        },
        {
          id: 'l1-2',
          title: '1.2 Conducting Effective User Interviews',
          type: 'article',
          duration: '8 min read',
          completed: true,
          articleContent: `### Conducting Effective User Interviews

User interviews provide qualitative depth that surveys and analytics cannot match. When conducting empathy-driven research, follow these fundamental principles:

1. **Ask open-ended questions**: Never ask leading questions like *"Did you like this button?"*. Instead ask *"Tell me about the last time you completed this task."*
2. **Observe silent pauses**: Allow 3-5 seconds after a participant answers before asking the next question. Often their deepest insight comes in the follow-up reflection.
3. **Focus on past behaviors over hypothetical futures**: Users are notoriously inaccurate at predicting what they *might* do, but accurate when describing what they *already did*.

#### Checklist for your interview kit
- Research goal & hypothesis sheet
- 5 Core open-ended discovery questions
- Recording consent disclaimer
- Note-taking template with timestamp columns`,
        },
        {
          id: 'l1-3',
          title: '1.3 Knowledge Check: UX Heuristics & Research',
          type: 'quiz',
          duration: '4 questions',
          completed: true,
          quizQuestions: [
            {
              id: 'q1',
              question: 'Which of Jakob Nielsen’s heuristics addresses informing users about system status?',
              options: [
                'Visibility of system status',
                'Match between system and real world',
                'User control and freedom',
                'Consistency and standards'
              ],
              correctIndex: 0,
              explanation: 'Visibility of system status ensures that the system always keeps users informed about what is going on through appropriate feedback in reasonable time.'
            },
            {
              id: 'q2',
              question: 'What is the primary danger of asking leading questions during user research?',
              options: [
                'The interview takes too long',
                'Participants bias their answers to satisfy the researcher (Hawthorne effect)',
                'It produces too much quantitative data',
                'It requires expensive software'
              ],
              correctIndex: 1,
              explanation: 'Leading questions introduce confirmation bias and prompt participants to provide affirmative answers rather than genuine feedback.'
            },
            {
              id: 'q3',
              question: 'In qualitative usability testing, how many participants typically uncover ~80% of usability issues?',
              options: ['1-2 users', '5 users', '20 users', '50+ users'],
              correctIndex: 1,
              explanation: 'Nielsen & Landauer research shows that 5 users are sufficient to uncover roughly 85% of critical usability hurdles.'
            },
            {
              id: 'q4',
              question: 'What differentiates a Wireframe from a High-Fidelity Prototype?',
              options: [
                'Wireframes focus on structure and layout hierarchy without final styling',
                'Wireframes always include clickable animations',
                'Prototypes only contain text',
                'There is no difference'
              ],
              correctIndex: 0,
              explanation: 'Wireframes represent skeletal layout structures, whereas high-fidelity prototypes simulate realistic visual hierarchy, interactions, and design systems.'
            }
          ]
        },
        {
          id: 'l1-4',
          title: '1.4 Downloadable UX Persona & Journey Templates',
          type: 'resource',
          duration: '2 files',
          completed: true,
          resources: [
            { title: 'UX_Empathy_Map_Template.pdf', size: '1.8 MB', downloadUrl: '#' },
            { title: 'User_Journey_Figma_Kit.fig', size: '4.2 MB', downloadUrl: '#' }
          ]
        }
      ]
    },
    {
      id: 'm2',
      title: 'Module 2: Information Architecture & Wireframing',
      description: 'Card sorting, site tree structures, and low-fidelity schematic wireframing.',
      lessons: [
        {
          id: 'l2-1',
          title: '2.1 Information Architecture & Tree Testing',
          type: 'video',
          duration: '18 min',
          completed: true,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        },
        {
          id: 'l2-2',
          title: '2.2 Responsive Layout Grids & Visual Hierarchy',
          type: 'article',
          duration: '10 min read',
          completed: true,
          articleContent: `### Responsive Layout Grids & Visual Hierarchy

A disciplined spatial grid creates rhythm, predictability, and emotional calm in complex interfaces.

#### 1. The 8-Point Spatial System
Every padding, margin, row height, and card gap should be a multiple of **8px** (or 4px for fine-grained components like badges).
- Base unit: 8px
- Standard intervals: 8px, 16px, 24px, 32px, 48px, 64px

#### 2. Visual Hierarchy Rules
- **Scale contrast**: Headings should be at least 1.4x to 1.6x the body size.
- **Color contrast**: Use high contrast for primary actions and muted tones for secondary metadata.
- **Proximity grouping**: Elements that belong together should have smaller margins between them than elements from separate groups.`,
        },
        {
          id: 'l2-3',
          title: '2.3 Wireframe Prototyping Workshop',
          type: 'video',
          duration: '24 min',
          completed: false,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        },
        {
          id: 'l2-4',
          title: '2.4 Module 2 Assessment Quiz',
          type: 'quiz',
          duration: '3 questions',
          completed: false,
          quizQuestions: [
            {
              id: 'm2-q1',
              question: 'Why is an 8-point spatial system preferred over arbitrary pixel values?',
              options: [
                'It scales cleanly across varying screen densities (1x, 2x, 3x displays)',
                'It is required by CSS specifications',
                'It uses less RAM in the browser',
                'It is only supported by Figma'
              ],
              correctIndex: 0,
              explanation: '8 is easily divisible by 2 and 4, preventing half-pixel sub-pixel rendering blur on high-density retina displays.'
            },
            {
              id: 'm2-q2',
              question: 'What is the primary purpose of a card sorting exercise?',
              options: [
                'To test color schemes',
                'To understand how users categorize information and design navigation menus',
                'To measure API response times',
                'To write marketing copy'
              ],
              correctIndex: 1,
              explanation: 'Card sorting reveals the mental models of users regarding how content should be grouped and labeled.'
            },
            {
              id: 'm2-q3',
              question: 'In layout hierarchy, what does the Law of Proximity state?',
              options: [
                'Objects placed close to each other are perceived as belonging together',
                'All buttons should be blue',
                'Navigation must always be on top',
                'Text should never exceed 100 words'
              ],
              correctIndex: 0,
              explanation: 'The Gestalt Law of Proximity indicates that visual proximity communicates functional relationship.'
            }
          ]
        }
      ]
    },
    {
      id: 'm3',
      title: 'Module 3: Usability Testing & Design Handoff',
      description: 'Moderated testing protocols, metric evaluation (SUS/CES), and developer handoff.',
      lessons: [
        {
          id: 'l3-1',
          title: '3.1 Usability Testing Metrics: SUS, CSAT & Task Success',
          type: 'article',
          duration: '12 min read',
          completed: false,
          articleContent: `### Measuring Usability Scientifically

Subjective impressions alone cannot validate design decisions. Modern product teams use standardized benchmark metrics:

- **System Usability Scale (SUS)**: 10-item questionnaire yielding a 0-100 score. A score of **68** represents the global average. Scores above **80** represent world-class usability.
- **Task Completion Rate (TCR)**: The percentage of participants who successfully complete a defined scenario without fatal errors. Target: >85%.
- **Time on Task (ToT)**: Measuring efficiency between baseline and revised redesigns.`,
        },
        {
          id: 'l3-2',
          title: '3.2 Design System Tokens & Developer Handoff',
          type: 'video',
          duration: '16 min',
          completed: false,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        },
        {
          id: 'l3-3',
          title: '3.3 Final Course Capstone Quiz & Certification',
          type: 'quiz',
          duration: '5 questions',
          completed: false,
          quizQuestions: [
            {
              id: 'fin-q1',
              question: 'What is considered an above-average System Usability Scale (SUS) benchmark score?',
              options: ['Above 50', 'Above 68', 'Above 95', 'Above 30'],
              correctIndex: 1,
              explanation: 'The standard industry average for SUS across thousands of software evaluations is 68.'
            },
            {
              id: 'fin-q2',
              question: 'What is design token aliasing?',
              options: [
                'Mapping semantic tokens (e.g., color-action-primary) to global raw values (e.g., blue-600)',
                'Exporting SVGs as PNGs',
                'Hiding layers in Figma',
                'Renaming files randomly'
              ],
              correctIndex: 0,
              explanation: 'Aliasing creates a semantic abstraction layer so theme variables can adapt without breaking underlying component styling.'
            },
            {
              id: 'fin-q3',
              question: 'Which WCAG contrast ratio is mandatory for normal body text under AA level?',
              options: ['3:1', '4.5:1', '7:1', '2:1'],
              correctIndex: 1,
              explanation: 'WCAG 2.1 AA mandates a minimum contrast ratio of 4.5:1 for normal body text and 3:1 for large text.'
            },
            {
              id: 'fin-q4',
              question: 'In usability testing, what is the Think-Aloud Protocol?',
              options: [
                'Asking users to verbalize their thoughts, expectations, and hesitations while executing a task',
                'The moderator speaking constantly',
                'Playing background music',
                'Debating answers with the participant'
              ],
              correctIndex: 0,
              explanation: 'The think-aloud protocol exposes the mental friction and reasoning of users in real time.'
            },
            {
              id: 'fin-q5',
              question: 'What is the ideal target size for touch elements on mobile displays according to Apple/Google guidelines?',
              options: ['20x20px', '44x44px to 48x48px', '80x80px', '10x10px'],
              correctIndex: 1,
              explanation: '44x44px (Apple HIG) and 48x48dp (Google Material) prevent mis-taps on mobile touch screens.'
            }
          ]
        }
      ]
    }
  ]
}

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
    description: 'Master the fundamentals of user experience design. Learn research methods, wireframing, prototyping, and usability testing from industry experts.',
    overview: 'This comprehensive course equips you with the real-world skills to research, design, and validate intuitive digital products. Guided by top product designers, you will build portfolio-ready case studies.',
    whatYouWillLearn: [
      'Conduct empathy-driven user interviews and qualitative research',
      'Apply Jakob Nielsen 10 Usability Heuristics to product audits',
      'Construct scalable 8-pt spatial grid layouts and wireframes',
      'Benchmark product usability with SUS, CSAT and task completion metrics',
      'Deliver developer-ready design system tokens in Figma'
    ],
    requirements: [
      'No prior design or coding experience required',
      'A computer with modern web browser and free Figma account',
      'Willingness to conduct 2 mock user interview sessions'
    ],
    modules: SAMPLE_MODULES[1]
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
    description: 'Deep dive into advanced JavaScript concepts including closures, async patterns, design patterns, and performance optimization techniques.',
    overview: 'Unlock the underlying mechanics of the JavaScript V8 engine, asynchronous concurrency models, memory allocation, closures, event loops, and functional architecture patterns.',
    whatYouWillLearn: [
      'Master V8 engine execution contexts, call stack, and garbage collection',
      'Deep dive into microtask vs macrotask event loop queues',
      'Build robust custom Async Iterators and Web Streams',
      'Implement design patterns: Proxy, Observer, Factory, and Singleton in ESNext',
      'Profile memory leaks and optimize bundle execution speeds'
    ],
    requirements: [
      'Solid intermediate understanding of JavaScript & ES6 syntax',
      'Familiarity with Node.js and modern web browsers'
    ],
    modules: SAMPLE_MODULES[1]
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
    description: 'Learn to analyze and visualize data using Python, pandas, and matplotlib. Build real-world data analysis projects from scratch.',
    overview: 'Transform raw data into strategic business insights using industry-standard Python libraries. Clean, transform, model, and visualize data efficiently.',
    whatYouWillLearn: [
      'Manipulate large tabular datasets with Pandas DataFrames',
      'Generate publication-quality charts with Seaborn and Matplotlib',
      'Perform statistical hypothesis testing and correlation analysis',
      'Automate ETL data cleaning workflows'
    ],
    requirements: [
      'Basic Python programming experience',
      'Jupyter Notebook or VS Code installed'
    ],
    modules: SAMPLE_MODULES[1]
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
    description: 'Understand the product lifecycle, stakeholder management, roadmapping, and agile methodologies to become an effective product manager.',
    overview: 'Learn the essentials of modern product leadership: identifying market opportunities, writing crisp PRDs, prioritizing roadmaps with RICE framework, and running agile sprints.',
    whatYouWillLearn: [
      'Formulate product strategy and North Star metrics',
      'Write comprehensive Product Requirement Documents (PRDs)',
      'Apply prioritization models (RICE, MoSCoW, Kano)',
      'Lead cross-functional engineering and design squads'
    ],
    requirements: ['No previous business or tech background needed'],
    modules: SAMPLE_MODULES[1]
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
    description: 'Build a strong foundation in machine learning algorithms, model evaluation, and practical applications with scikit-learn.',
    overview: 'Step into modern applied AI. Understand supervised vs unsupervised learning, gradient descent, neural networks, and deploying models to production.',
    whatYouWillLearn: [
      'Train regression, classification, and clustering models in Scikit-Learn',
      'Evaluate precision, recall, ROC-AUC, and F1 metrics',
      'Understand loss functions and gradient descent optimization',
      'Deploy REST inference endpoints with FastAPI'
    ],
    requirements: ['Intermediate Python & basic calculus/linear algebra'],
    modules: SAMPLE_MODULES[1]
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
    description: 'Create stunning user interfaces using Figma. Learn component systems, auto-layout, prototyping, and design handoff workflows.',
    overview: 'Master Figma from zero to advanced component properties, auto-layout 5.0, responsive constraints, variables, and design tokens.',
    whatYouWillLearn: [
      'Master auto-layout resizing, hugging, and padding controls',
      'Build reusable component sets with variant properties and booleans',
      'Implement light/dark mode variables and token alias hierarchies',
      'Craft animated smart-animate transitions and micro-interactions'
    ],
    requirements: ['Free Figma account'],
    modules: SAMPLE_MODULES[1]
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
    description: 'Build production-ready applications with React and Next.js. Covers server components, API routes, authentication, and deployment.',
    overview: 'Everything you need to ship enterprise full-stack web applications with React 19, Next.js App Router, Server Actions, Tailwind CSS, and edge databases.',
    whatYouWillLearn: [
      'Leverage React Server Components (RSC) and Suspense streaming',
      'Build secure database mutations with React 19 Server Actions',
      'Implement robust authentication and RBAC authorization',
      'Deploy and optimize Core Web Vitals on Cloudflare and Vercel'
    ],
    requirements: ['Good understanding of React basics and JavaScript ES6+'],
    modules: SAMPLE_MODULES[1]
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
    description: 'Develop comprehensive digital marketing strategies including SEO, content marketing, social media, and paid advertising campaigns.',
    overview: 'Acquire high-converting customers through organic search, programmatic ad funnels, email automation, and conversion rate optimization (CRO).',
    whatYouWillLearn: [
      'Master modern SEO keyword clustering and technical crawl audits',
      'Design high-converting paid Google and Meta ad campaigns',
      'Set up automated lifecycle email funnels',
      'Calculate CAC, LTV, ROAS, and cohort retention'
    ],
    requirements: ['No prior experience required'],
    modules: SAMPLE_MODULES[1]
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
    description: 'Design and implement scalable cloud architectures on AWS. Covers EC2, S3, Lambda, DynamoDB, and infrastructure as code.',
    overview: 'Build high-availability, fault-tolerant infrastructure on Amazon Web Services following the AWS Well-Architected Framework.',
    whatYouWillLearn: [
      'Design multi-AZ VPC topologies with public/private subnets and NAT gateways',
      'Implement serverless event-driven architectures with Lambda & SQS',
      'Configure auto-scaling groups with Application Load Balancers',
      'Deploy infrastructure as code using Terraform and CloudFormation'
    ],
    requirements: ['Basic Linux command line and networking concepts'],
    modules: SAMPLE_MODULES[1]
  },
]

export const ENROLLED_COURSES = CATALOG_COURSES.filter(c => c.enrolled)

export const CATEGORIES = ['All', 'Design', 'Development', 'Analytics', 'Business']
export const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

export const ACTIVITIES: Activity[] = [
  { type: 'lesson', text: 'Completed "Conducting Effective User Interviews"', course: 'UX Design Fundamentals', time: '2h ago' },
  { type: 'quiz',   text: 'Scored 100% on Heuristics & Research Quiz',      course: 'UX Design Fundamentals', time: '4h ago' },
  { type: 'start',  text: 'Started "Information Architecture & Grids"',       course: 'UX Design Fundamentals', time: 'Yesterday' },
  { type: 'cert',   text: 'Earned Verified Certificate in UI Foundations',    course: 'UI Design Foundations',  time: '3 days ago' },
  { type: 'enroll', text: 'Enrolled in "Product Management 101"',             course: 'Product Management 101', time: '5 days ago' },
]

export const STAT_ITEMS = [
  { label: 'Enrolled',     value: 4  },
  { label: 'Completed',    value: 1  },
  { label: 'Certificates', value: 1  },
  { label: 'Hours',        value: 58 },
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
    credentialUrl: '/verify/bm-cert-2026-8942-ux'
  }
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
    meetingLink: 'https://meet.google.com/abc-defg-hij'
  },
  {
    id: 'ev-2',
    title: 'Quiz Deadline: Module 2 Assessment',
    type: 'quiz_deadline',
    date: '2026-08-24',
    time: '23:59 WIB',
    duration: '20 min',
    courseTitle: 'UX Design Fundamentals'
  },
  {
    id: 'ev-3',
    title: 'Daily Study Goal (45 mins)',
    type: 'study_goal',
    date: '2026-08-21',
    time: '20:00 - 20:45 WIB',
    duration: '45 min',
    courseTitle: 'Advanced JavaScript'
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
    meetingLink: 'https://meet.google.com/xyz-uvw-rst'
  }
]

export const MOCK_DISCUSSIONS: DiscussionComment[] = [
  {
    id: 'd-1',
    authorName: 'Budi Santoso',
    authorAvatar: 'BS',
    authorRole: 'Learner',
    createdAt: '2 hours ago',
    content: 'When defining 8-point grid rules, should icon container sizes also strictly follow 8px intervals or is 20px / 28px standard for icons?',
    upvotes: 6,
    hasUpvoted: true,
    replies: [
      {
        id: 'd-1-r1',
        authorName: 'Sarah Chen',
        authorAvatar: 'SC',
        authorRole: 'Instructor',
        createdAt: '1 hour ago',
        content: 'Great question Budi! Standard icon bounding boxes typically use a 4px sub-grid interval (e.g. 16px, 20px, 24px, 32px), with 24x24 being the industry standard for desktop and mobile navigation. The 8px rule applies strictly to structural margins and layout padding!',
        upvotes: 9
      }
    ]
  },
  {
    id: 'd-2',
    authorName: 'Rina Wijaya',
    authorAvatar: 'RW',
    authorRole: 'Learner',
    createdAt: 'Yesterday',
    content: 'The checklist for user interview questions is super helpful. I tested it on our company internal tool and caught 3 critical navigation flaws right away!',
    upvotes: 4
  }
]

// Seeded heatmap data — stable across renders
export const HEATMAP_DATA: HeatmapDay[] = (() => {
  const days: HeatmapDay[] = []
  const now = new Date(2026, 7, 20)
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
