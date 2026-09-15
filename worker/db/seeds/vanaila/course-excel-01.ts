import type { SeedCourse } from "./types"
import { COURSE_EXCEL_01_LESSONS_PART1 } from "./course-excel-01-part1"
import { COURSE_EXCEL_01_LESSONS_PART2 } from "./course-excel-01-part2"

export const courseExcel01: SeedCourse = {
  id: "crs-vanaila-excel-01",
  title: "Microsoft Excel Training Tutorials for Beginners, Intermediate and Advanced Learners",
  slug: "vanaila-microsoft-excel-training-tutorials-for-beginners-intermediate-and-advanced-learners",
  description: "✅ Our Excel long tutorials have become some of the most popular content we have ever published on the YouTube channel. To make them easier to find, we have created this playlist with them all in.",
  coverUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
  category: "Excel",
  tags: ["Excel", "Vanaila Course", "Tutorial"],
  playlistId: "PLzj7TwUeMQ3g6U7Mwyy7G9Gwh-k2yNtfI",
  section: {
    id: "sec-vanaila-excel-01-01",
    title: "Module 1: Microsoft Excel Training Tutorials for Beginners, Intermediate and Advanced Learners",
    position: 0,
    lessons: [...COURSE_EXCEL_01_LESSONS_PART1, ...COURSE_EXCEL_01_LESSONS_PART2]
  }
}
