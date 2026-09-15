import type { Course } from '../types'
import { COURSE_113_MODULES_PART1 } from './course-113-modules-part1'
import { COURSE_113_MODULES_PART2 } from './course-113-modules-part2'

export const COURSE_113: Course = {
  id: 113,
  title: "Advanced Microsoft Excel for Project Management: The Complete Professional Masterclass",
  instructor: "Engineeringly",
  instructorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
  instructorRole: 'Senior Project Controls Engineer & BI Specialist',
  rating: 4.96,
  students: 4120,
  lessons: 78,
  hours: 18,
  category: 'Project Management',
  level: 'Advanced',
  price: 0,
  colorIdx: 0,
  enrolled: false,
  progress: 0,
  completed: 0,
  description:
    'An exhaustive 78-lesson masterclass transforming Excel into an enterprise-grade Project Management Information System (PMIS). Covers EVM S-curves, Monte Carlo risk simulation, interactive KPI dashboards, and Power Query consolidation.',
  overview:
    'Engineered for seasoned project managers, engineering directors, and project controls specialists. Master dynamic Gantt scheduling, cash flow NPV analysis, burndown charts, WBS structures, and automated macro reporting.',
  whatYouWillLearn: [
    'Build advanced dynamic Gantt and milestone charts tracking planned vs actual progress',
    'Calculate Earned Value Analysis (EVM), Cost/Schedule Performance Indices, and S-curves',
    'Perform Monte Carlo risk simulations and multi-criteria decision analysis (MCDA)',
    'Construct interactive executive project dashboards using Pivot Tables, Slicers, and INDEX/MATCH',
    'Import, transform, and consolidate multi-workbook project datasets using Power Query',
    'Automate recurring project progress reporting with native Excel VBA Macros',
  ],
  requirements: [
    'Intermediate understanding of Excel formulas and chart building',
    'Experience working with project schedules, budgets, or operational teams',
  ],
  modules: [
    ...COURSE_113_MODULES_PART1,
    ...COURSE_113_MODULES_PART2,
  ],
}
