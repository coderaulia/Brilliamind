import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import type { Env, Variables } from '../types'
import { getDb, profiles, courses, sections, lessons, enrollments } from '../db'
import { hashPassword, generateUuid } from '../lib/crypto'

const seedRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

seedRouter.post('/', async (c) => {
  const db = getDb(c.env.DB)

  // 1. Seed Superadmin
  const adminEmail = 'admin@brilliamind.id'
  let admin = await db.select().from(profiles).where(eq(profiles.email, adminEmail)).get()
  const adminPasswordHash = await hashPassword('Admin123!')

  if (!admin) {
    admin = {
      id: 'usr-admin-001',
      email: adminEmail,
      name: 'Super Admin',
      passwordHash: adminPasswordHash,
      role: 'admin',
      status: 'active',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      bio: 'Platform Administrator',
      createdAt: new Date().toISOString(),
    }
    await db.insert(profiles).values(admin)
  } else {
    await db.update(profiles).set({ passwordHash: adminPasswordHash, status: 'active' }).where(eq(profiles.id, admin.id))
  }

  // 2. Seed Active Instructor
  const instructorEmail = 'sarah.mitchell@brilliamind.id'
  let instructor = await db.select().from(profiles).where(eq(profiles.email, instructorEmail)).get()
  const instructorPasswordHash = await hashPassword('Instructor123!')

  if (!instructor) {
    instructor = {
      id: 'usr-inst-001',
      email: instructorEmail,
      name: 'Dr. Sarah Mitchell',
      passwordHash: instructorPasswordHash,
      role: 'instructor',
      status: 'active',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      bio: 'Senior Cloud Architect & Lead Instructor',
      createdAt: new Date().toISOString(),
    }
    await db.insert(profiles).values(instructor)
  } else {
    await db.update(profiles).set({ passwordHash: instructorPasswordHash, status: 'active' }).where(eq(profiles.id, instructor.id))
  }

  // 3. Seed Pending Instructor (for testing approval flow)
  const pendingEmail = 'alex.tan@brilliamind.id'
  const pendingInst = await db.select().from(profiles).where(eq(profiles.email, pendingEmail)).get()
  if (!pendingInst) {
    await db.insert(profiles).values({
      id: 'usr-inst-002',
      email: pendingEmail,
      name: 'Alex Tan',
      passwordHash: await hashPassword('Instructor123!'),
      role: 'instructor',
      status: 'pending',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      bio: 'DevOps & Kubernetes Engineer applying to teach',
      createdAt: new Date().toISOString(),
    })
  }

  // 4. Seed Demo Course with YouTube Lessons
  const courseId = 'crs-web-dev-001'
  const existingCourse = await db.select().from(courses).where(eq(courses.id, courseId)).get()

  if (!existingCourse) {
    await db.insert(courses).values({
      id: courseId,
      instructorId: 'usr-inst-001',
      title: 'Fullstack TypeScript & Cloudflare Workers Masterclass',
      slug: 'fullstack-typescript-cloudflare-workers',
      description: 'Master modern serverless fullstack architecture using React 19, Hono, Cloudflare Workers, and D1 database.',
      coverUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      category: 'Cloud Engineering',
      tags: ['TypeScript', 'Cloudflare', 'Hono', 'React'],
      price: 0,
      currency: 'USD',
      status: 'published',
    })

    const section1Id = generateUuid()
    const section2Id = generateUuid()

    await db.insert(sections).values([
      { id: section1Id, courseId, title: 'Module 1: Foundations & Architecture', position: 0 },
      { id: section2Id, courseId, title: 'Module 2: Serverless Edge Backends', position: 1 },
    ])

    await db.insert(lessons).values([
      {
        id: generateUuid(),
        sectionId: section1Id,
        title: 'Welcome to Cloudflare Edge Architecture',
        type: 'youtube',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        position: 0,
        isFreePreview: true,
      },
      {
        id: generateUuid(),
        sectionId: section1Id,
        title: 'Understanding V8 Isolates vs Docker Containers',
        type: 'youtube',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        position: 1,
        isFreePreview: false,
      },
      {
        id: generateUuid(),
        sectionId: section2Id,
        title: 'Building Ultrafast APIs with Hono',
        type: 'youtube',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        position: 0,
        isFreePreview: false,
      },
    ])
  }

  // 5. Seed Demo Learner (Budi Santoso) enrolled in demo course
  const learnerEmail = 'budi.santoso@brilliamind.id'
  let learner = await db.select().from(profiles).where(eq(profiles.email, learnerEmail)).get()
  const learnerPasswordHash = await hashPassword('Learner123!')

  if (!learner) {
    learner = {
      id: 'usr-learner-001',
      email: learnerEmail,
      name: 'Budi Santoso',
      passwordHash: learnerPasswordHash,
      role: 'learner',
      status: 'active',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      bio: 'Software Engineer & Learner',
      createdAt: new Date().toISOString(),
    }
    await db.insert(profiles).values(learner)

    // Enroll in demo course
    await db.insert(enrollments).values({
      id: generateUuid(),
      userId: 'usr-learner-001',
      courseId,
    })
  }

  return c.json({
    message: 'Database seeded successfully with demo users and course!',
    credentials: {
      superadmin: { email: 'admin@brilliamind.id', password: 'Admin123!' },
      activeInstructor: { email: 'sarah.mitchell@brilliamind.id', password: 'Instructor123!' },
      pendingInstructor: { email: 'alex.tan@brilliamind.id', password: 'Instructor123!' },
      learner: { email: 'budi.santoso@brilliamind.id', password: 'Learner123!' },
    },
  })
})

export default seedRouter
