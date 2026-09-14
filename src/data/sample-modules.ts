import type { CourseModule } from './types'

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
                'Consistency and standards',
              ],
              correctIndex: 0,
              explanation:
                'Visibility of system status ensures that the system always keeps users informed about what is going on through appropriate feedback in reasonable time.',
            },
            {
              id: 'q2',
              question: 'What is the primary danger of asking leading questions during user research?',
              options: [
                'The interview takes too long',
                'Participants bias their answers to satisfy the researcher (Hawthorne effect)',
                'It produces too much quantitative data',
                'It requires expensive software',
              ],
              correctIndex: 1,
              explanation:
                'Leading questions introduce confirmation bias and prompt participants to provide affirmative answers rather than genuine feedback.',
            },
            {
              id: 'q3',
              question:
                'In qualitative usability testing, how many participants typically uncover ~80% of usability issues?',
              options: ['1-2 users', '5 users', '20 users', '50+ users'],
              correctIndex: 1,
              explanation:
                'Nielsen & Landauer research shows that 5 users are sufficient to uncover roughly 85% of critical usability hurdles.',
            },
            {
              id: 'q4',
              question: 'What differentiates a Wireframe from a High-Fidelity Prototype?',
              options: [
                'Wireframes focus on structure and layout hierarchy without final styling',
                'Wireframes always include clickable animations',
                'Prototypes only contain text',
                'There is no difference',
              ],
              correctIndex: 0,
              explanation:
                'Wireframes represent skeletal layout structures, whereas high-fidelity prototypes simulate realistic visual hierarchy, interactions, and design systems.',
            },
          ],
        },
        {
          id: 'l1-4',
          title: '1.4 Downloadable UX Persona & Journey Templates',
          type: 'resource',
          duration: '2 files',
          completed: true,
          resources: [
            { title: 'UX_Empathy_Map_Template.pdf', size: '1.8 MB', downloadUrl: '#' },
            { title: 'User_Journey_Figma_Kit.fig', size: '4.2 MB', downloadUrl: '#' },
          ],
        },
      ],
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
                'It is only supported by Figma',
              ],
              correctIndex: 0,
              explanation:
                '8 is easily divisible by 2 and 4, preventing half-pixel sub-pixel rendering blur on high-density retina displays.',
            },
            {
              id: 'm2-q2',
              question: 'What is the primary purpose of a card sorting exercise?',
              options: [
                'To test color schemes',
                'To understand how users categorize information and design navigation menus',
                'To measure API response times',
                'To write marketing copy',
              ],
              correctIndex: 1,
              explanation:
                'Card sorting reveals the mental models of users regarding how content should be grouped and labeled.',
            },
            {
              id: 'm2-q3',
              question: 'In layout hierarchy, what does the Law of Proximity state?',
              options: [
                'Objects placed close to each other are perceived as belonging together',
                'All buttons should be blue',
                'Navigation must always be on top',
                'Text should never exceed 100 words',
              ],
              correctIndex: 0,
              explanation:
                'The Gestalt Law of Proximity indicates that visual proximity communicates functional relationship.',
            },
          ],
        },
      ],
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
              explanation:
                'The standard industry average for SUS across thousands of software evaluations is 68.',
            },
            {
              id: 'fin-q2',
              question: 'What is design token aliasing?',
              options: [
                'Mapping semantic tokens (e.g., color-action-primary) to global raw values (e.g., blue-600)',
                'Exporting SVGs as PNGs',
                'Hiding layers in Figma',
                'Renaming files randomly',
              ],
              correctIndex: 0,
              explanation:
                'Aliasing creates a semantic abstraction layer so theme variables can adapt without breaking underlying component styling.',
            },
            {
              id: 'fin-q3',
              question: 'Which WCAG contrast ratio is mandatory for normal body text under AA level?',
              options: ['3:1', '4.5:1', '7:1', '2:1'],
              correctIndex: 1,
              explanation:
                'WCAG 2.1 AA mandates a minimum contrast ratio of 4.5:1 for normal body text and 3:1 for large text.',
            },
            {
              id: 'fin-q4',
              question: 'In usability testing, what is the Think-Aloud Protocol?',
              options: [
                'Asking users to verbalize their thoughts, expectations, and hesitations while executing a task',
                'The moderator speaking constantly',
                'Playing background music',
                'Debating answers with the participant',
              ],
              correctIndex: 0,
              explanation:
                'The think-aloud protocol exposes the mental friction and reasoning of users in real time.',
            },
            {
              id: 'fin-q5',
              question:
                'What is the ideal target size for touch elements on mobile displays according to Apple/Google guidelines?',
              options: ['20x20px', '44x44px to 48x48px', '80x80px', '10x10px'],
              correctIndex: 1,
              explanation:
                '44x44px (Apple HIG) and 48x48dp (Google Material) prevent mis-taps on mobile touch screens.',
            },
          ],
        },
      ],
    },
  ],
}
