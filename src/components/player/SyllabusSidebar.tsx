import type { CourseModule } from '@/data/mock-data'
import {
  IconCheck,
  IconPlay,
  IconHelpCircle,
  IconFileText,
  IconX,
} from '@/components/ui/icons'

interface SyllabusSidebarProps {
  modules: CourseModule[]
  currentLessonId: string
  completedLessons: Record<string, boolean>
  completedCount: number
  totalLessonCount: number
  onSelectLesson: (lessonId: string) => void
  onClose: () => void
}

export default function SyllabusSidebar({
  modules,
  currentLessonId,
  completedLessons,
  completedCount,
  totalLessonCount,
  onSelectLesson,
  onClose,
}: SyllabusSidebarProps) {
  return (
    <div
      style={{
        width: 340,
        height: '100%',
        background: 'var(--card-bg)',
        borderLeft: '1px solid var(--card-border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--card-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
            Course Syllabus
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {completedCount} of {totalLessonCount} completed
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <IconX s={18} />
        </button>
      </div>

      {/* Syllabus Scroll Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
        {modules.map((mod) => (
          <div key={mod.id} style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '6px 8px',
                marginBottom: 4,
              }}
            >
              {mod.title}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {mod.lessons.map((l) => {
                const isCurrent = l.id === currentLessonId
                const isDone = completedLessons[l.id]
                return (
                  <button
                    key={l.id}
                    onClick={() => onSelectLesson(l.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: isCurrent ? '1px solid var(--accent-1)' : '1px solid transparent',
                      background: isCurrent ? 'rgba(20,184,166,0.1)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: isDone
                            ? '#10b981'
                            : isCurrent
                              ? 'var(--accent-1)'
                              : 'var(--card-border)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          flexShrink: 0,
                        }}
                      >
                        {isDone ? (
                          <IconCheck s={12} />
                        ) : l.type === 'video' ? (
                          <IconPlay s={10} />
                        ) : l.type === 'quiz' ? (
                          <IconHelpCircle s={10} />
                        ) : (
                          <IconFileText s={10} />
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: isCurrent ? 700 : 500,
                          color: isCurrent ? 'var(--accent-1)' : 'var(--text-primary)',
                          lineHeight: 1.3,
                        }}
                      >
                        {l.title}
                      </span>
                    </div>

                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8, flexShrink: 0 }}>
                      {l.duration}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
