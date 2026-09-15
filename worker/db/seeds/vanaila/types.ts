export interface SeedLesson {
  id: string
  title: string
  type: 'youtube'
  videoUrl: string
  position: number
  isFreePreview: boolean
}

export interface SeedSection {
  id: string
  title: string
  position: number
  lessons: SeedLesson[]
}

export interface SeedCourse {
  id: string
  title: string
  slug: string
  description: string
  coverUrl: string
  category: string
  tags: string[]
  playlistId: string
  section?: SeedSection
  sections?: SeedSection[]
}
