import type { SeedCourse } from './types'
import { coursePm02SectionsPart1 } from './course-pm-02-part1'
import { coursePm02SectionsPart2 } from './course-pm-02-part2'

export const coursePm02: SeedCourse = {
  id: 'crs-vanaila-pm-02',
  title: 'Advanced Microsoft Excel for Project Management: The Complete Professional Masterclass',
  slug: 'vanaila-advanced-excel-project-management-engineeringly',
  description: 'An exhaustive 78-lesson masterclass transforming Excel into an enterprise-grade Project Management Information System (PMIS). Covers EVM S-curves, Monte Carlo risk simulation, interactive KPI dashboards, and Power Query consolidation.',
  coverUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800',
  category: 'Project Management',
  tags: ['Project Management', 'Excel', 'EVM', 'Risk Analysis', 'Power Query'],
  playlistId: 'PL3elkKFOw1HPCDLD_fLqnNfyakb2nmMvW',
  sections: [
    ...coursePm02SectionsPart1,
    ...coursePm02SectionsPart2,
  ]
}
