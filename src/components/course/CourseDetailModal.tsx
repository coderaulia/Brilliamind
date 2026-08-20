import { useState } from 'react'
import type { Course } from '@/data/mock-data'
import {
  IconX, IconStarFilled, IconClock, IconBook,
  IconCheck, IconPlay, IconFileText, IconHelpCircle, IconAward
} from '@/components/ui/icons'

interface CourseDetailModalProps {
  course: Course
  onClose: () => void
  onStartLearning: (courseId: number) => void
}

export default function CourseDetailModal({
  course,
  onClose,
  onStartLearning,
}: CourseDetailModalProps) {
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({ m1: true, m2: true, m3: true })

  const toggleModule = (modId: string) => {
    setOpenModules(prev => ({ ...prev, [modId]: !prev[modId] }))
  }

  const modules = course.modules ?? []
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0) || course.lessons

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10, 15, 29, 0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px', animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 840, maxHeight: '90vh',
          background: 'var(--card-bg)', borderRadius: 20,
          border: '1px solid var(--card-border)',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          position: 'relative', animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #0C1526 0%, #172554 100%)',
          color: '#fff', position: 'relative', overflow: 'hidden'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 20, right: 20,
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.2s', zIndex: 2
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          >
            <IconX s={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{
              padding: '4px 12px', borderRadius: 20,
              background: 'rgba(45, 212, 191, 0.15)', color: '#2dd4bf',
              fontSize: 12, fontWeight: 700, letterSpacing: '0.04em'
            }}>
              {course.category}
            </span>
            <span style={{
              padding: '4px 10px', borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.12)', color: '#e2e8f0',
              fontSize: 12, fontWeight: 600
            }}>
              {course.level}
            </span>
            {course.enrolled && (
              <span style={{
                padding: '4px 10px', borderRadius: 20,
                background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80',
                fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4
              }}>
                <IconCheck s={13} /> Enrolled
              </span>
            )}
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.25, marginBottom: 10, maxWidth: 680 }}>
            {course.title}
          </h2>

          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, marginBottom: 18, maxWidth: 680 }}>
            {course.overview || course.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#fbbf24', display: 'flex' }}><IconStarFilled s={15} /></span>
              <span style={{ fontWeight: 700 }}>{course.rating.toFixed(1)}</span>
              <span style={{ opacity: 0.6 }}>({course.students.toLocaleString()} students)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconBook s={15} />
              <span>{totalLessons} lessons</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconClock s={15} />
              <span>{course.hours} hours on-demand</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconAward s={15} />
              <span>Certificate of Completion</span>
            </div>
          </div>
        </div>

        {/* Modal Body: Scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', background: 'var(--page-bg)' }}>
          {/* Instructor Snapshot */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 20px', borderRadius: 14,
            background: 'var(--card-bg)', border: '1px solid var(--card-border)',
            marginBottom: 24
          }}>
            <div style={{
              width: 46, height: 46, borderRadius: 12,
              background: 'linear-gradient(135deg, #3b82f6, #0d9488)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 16
            }}>
              {course.instructorAvatar}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Course Instructor
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                {course.instructor}
              </div>
              {course.instructorRole && (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {course.instructorRole}
                </div>
              )}
            </div>
          </div>

          {/* What you'll learn */}
          {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
            <div style={{
              background: 'var(--card-bg)', borderRadius: 16,
              border: '1px solid var(--card-border)', padding: 22, marginBottom: 24
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
                What you'll master in this course
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {course.whatYouWillLearn.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }}>
                      <IconCheck s={16} />
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.45, fontWeight: 500 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Curriculum Accordion */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                Course Curriculum
              </h3>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                {modules.length} Modules • {totalLessons} Lessons
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {modules.map(mod => {
                const isOpen = openModules[mod.id] ?? false
                return (
                  <div
                    key={mod.id}
                    style={{
                      borderRadius: 14, background: 'var(--card-bg)',
                      border: '1px solid var(--card-border)', overflow: 'hidden'
                    }}
                  >
                    <button
                      onClick={() => toggleModule(mod.id)}
                      style={{
                        width: '100%', padding: '14px 18px', display: 'flex',
                        alignItems: 'center', justifyContent: 'space-between',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        textAlign: 'left', fontFamily: 'inherit'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {mod.title}
                        </div>
                        {mod.description && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                            {mod.description}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                        {mod.lessons.length} lessons
                      </div>
                    </button>

                    {isOpen && (
                      <div style={{ borderTop: '1px solid var(--card-border)', padding: '8px 12px' }}>
                        {mod.lessons.map(lesson => (
                          <div
                            key={lesson.id}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '10px 12px', borderRadius: 8,
                              fontSize: 13, color: 'var(--text-secondary)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ color: 'var(--text-muted)' }}>
                                {lesson.type === 'video' && <IconPlay s={14} />}
                                {lesson.type === 'article' && <IconFileText s={14} />}
                                {lesson.type === 'quiz' && <IconHelpCircle s={14} />}
                                {lesson.type === 'resource' && <IconAward s={14} />}
                              </span>
                              <span style={{ fontWeight: lesson.completed ? 600 : 500, color: lesson.completed ? 'var(--accent-1)' : 'inherit' }}>
                                {lesson.title}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                              {lesson.completed && (
                                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <IconCheck s={13} /> Completed
                                </span>
                              )}
                              <span>{lesson.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Requirements */}
          {course.requirements && course.requirements.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                Prerequisites & Requirements
              </h3>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {course.requirements.map((req, rIdx) => (
                  <li key={rIdx} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.4 }}>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 28px', borderTop: '1px solid var(--card-border)',
          background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Enrollment Status</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
              {course.enrolled ? `${course.progress}% Completed` : (course.price === 0 ? 'Free Course' : `$${course.price} USD`)}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px', borderRadius: 10,
                border: '1px solid var(--card-border)', background: 'transparent',
                color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose()
                onStartLearning(course.id)
              }}
              style={{
                padding: '10px 28px', borderRadius: 10,
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                color: '#fff', border: 'none', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 12px rgba(20, 184, 166, 0.35)',
                transition: 'transform 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
            >
              {course.enrolled ? (course.progress > 0 ? 'Continue Learning →' : 'Start Course →') : 'Enroll & Start Now →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
