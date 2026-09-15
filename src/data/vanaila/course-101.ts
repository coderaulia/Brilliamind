import type { Course } from "../types"
import { COURSE_101_LESSONS_PART1 } from "./course-101-lessons-part1"
import { COURSE_101_LESSONS_PART2 } from "./course-101-lessons-part2"

export const COURSE_101: Course = {
  id: 101,
  title: "Microsoft Excel Training Tutorials for Beginners, Intermediate and Advanced Learners",
  instructor: "Vanaila Course",
  instructorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
  instructorRole: "Lead Instructor & Training Specialist",
  rating: 4.9,
  students: 1420,
  lessons: 100,
  hours: 25,
  category: "Excel",
  level: "Advanced",
  price: 0,
  colorIdx: 0,
  enrolled: true,
  progress: 12,
  completed: 2,
  description: "✅ Our Excel long tutorials have become some of the most popular content we have ever published on the YouTube channel. To make them easier to find, we have created this playlist with them all in.",
  overview: "Master Excel with this complete video training series: Microsoft Excel Training Tutorials for Beginners, Intermediate and Advanced Learners. Features 100 comprehensive lessons.",
  whatYouWillLearn: [
    "Master Excel core workflows and practical techniques",
    "Work with real-world datasets, dashboards, and automated functions",
    "Gain professional skills directly applicable in business environments",
    "Follow along with hands-on video tutorials"
  ],
  requirements: [
    "No prior experience required; basic computer literacy is helpful"
  ],
  modules: [
    {
      id: "mod-v-1",
      title: "Module 1: Microsoft Excel Training Tutorials for Beginners, Intermediate and Advanced Learners",
      description: "Full video tutorial series for Microsoft Excel Training Tutorials for Beginners, Intermediate and Advanced Learners",
      lessons: [...COURSE_101_LESSONS_PART1, ...COURSE_101_LESSONS_PART2]
    }
  ]
}
