import { useState } from 'react'
import { MOCK_CALENDAR_EVENTS, type CalendarEvent } from '@/data/mock-data'
import {
  IconCalendar, IconClock, IconVideo, IconCheckCircle,
  IconFire, IconExternalLink, IconPlus, IconChevLeft, IconChevRight, IconX
} from '@/components/ui/icons'

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_CALENDAR_EVENTS)
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('2026-08-25')
  const [newTime, setNewTime] = useState('20:00 WIB')
  const [newType, setNewType] = useState<CalendarEvent['type']>('study_goal')
  const [newCourse, setNewCourse] = useState('UX Design Fundamentals')

  const handleAddEvent = () => {
    if (!newTitle.trim()) return
    const ev: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      date: newDate,
      time: newTime,
      duration: '45 min',
      courseTitle: newCourse
    }
    setEvents(prev => [...prev, ev])
    setShowAddModal(false)
    setNewTitle('')
  }

  // Days in August 2026 (Aug 1 is Saturday)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1)
  const startDayOffset = 6 // Saturday

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 28, background: 'var(--page-bg)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'rgba(59,130,246,0.12)', color: '#3b82f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <IconCalendar s={22} />
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
                Study Schedule & Live Sessions
              </h1>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
              Stay on track with live instructor workshops, quiz deadlines, and daily study targets.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              display: 'flex', background: 'var(--card-bg)', borderRadius: 10,
              border: '1px solid var(--card-border)', padding: 3
            }}>
              <button
                onClick={() => setViewMode('month')}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: 'none',
                  background: viewMode === 'month' ? 'var(--accent-1)' : 'transparent',
                  color: viewMode === 'month' ? '#fff' : 'var(--text-secondary)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                Month Grid
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: 'none',
                  background: viewMode === 'agenda' ? 'var(--accent-1)' : 'transparent',
                  color: viewMode === 'agenda' ? '#fff' : 'var(--text-secondary)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                Agenda List
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 10,
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                color: '#fff', border: 'none', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 12px rgba(20,184,166,0.3)'
              }}
            >
              <IconPlus s={16} /> Add Study Target
            </button>
          </div>
        </div>

        {/* Study Goals Banner */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24
        }}>
          <div style={{
            background: 'var(--card-bg)', borderRadius: 16, padding: '18px 20px',
            border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: 14
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#92400e',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <IconFire s={22} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                12 Days
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                Active Learning Streak 🔥
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--card-bg)', borderRadius: 16, padding: '18px 20px',
            border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: 14
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(59,130,246,0.12)', color: '#3b82f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <IconClock s={22} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                4.5 / 6.0 Hours
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                Weekly Target (75%)
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--card-bg)', borderRadius: 16, padding: '18px 20px',
            border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: 14
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(16,185,129,0.12)', color: '#10b981',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <IconCheckCircle s={22} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                2 Live Sessions
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                Upcoming this week
              </div>
            </div>
          </div>
        </div>

        {/* Main Calendar / Agenda View */}
        {viewMode === 'month' ? (
          <div style={{
            background: 'var(--card-bg)', borderRadius: 18,
            border: '1px solid var(--card-border)', padding: 24, marginBottom: 32
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                August 2026
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--page-bg)', border: '1px solid var(--card-border)', cursor: 'pointer' }}>
                  <IconChevLeft s={16} />
                </button>
                <button style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--page-bg)', border: '1px solid var(--card-border)', cursor: 'pointer' }}>
                  <IconChevRight s={16} />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 10, textAlign: 'center' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} style={{ minHeight: 90, opacity: 0.3, background: 'var(--page-bg)', borderRadius: 10 }} />
              ))}

              {daysInMonth.map(dayNum => {
                const dateStr = `2026-08-${dayNum.toString().padStart(2, '0')}`
                const dayEvents = events.filter(e => e.date === dateStr)
                const isToday = dayNum === 20

                return (
                  <div
                    key={dayNum}
                    style={{
                      minHeight: 96, borderRadius: 10, padding: 8,
                      background: isToday ? 'rgba(20,184,166,0.06)' : 'var(--page-bg)',
                      border: isToday ? '2px solid var(--accent-1)' : '1px solid var(--card-border)',
                      display: 'flex', flexDirection: 'column', gap: 4
                    }}
                  >
                    <div style={{
                      fontSize: 12, fontWeight: isToday ? 800 : 600,
                      color: isToday ? 'var(--accent-1)' : 'var(--text-primary)'
                    }}>
                      {dayNum} {isToday && '• Today'}
                    </div>

                    {dayEvents.map(ev => {
                      const isLive = ev.type === 'live'
                      return (
                        <div
                          key={ev.id}
                          style={{
                            padding: '3px 6px', borderRadius: 6,
                            background: isLive ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)',
                            color: isLive ? '#3b82f6' : '#d97706',
                            fontSize: 10, fontWeight: 700, lineHeight: 1.2,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                          }}
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Agenda List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
            {events.map(ev => {
              const isLive = ev.type === 'live'
              return (
                <div
                  key={ev.id}
                  style={{
                    background: 'var(--card-bg)', borderRadius: 16,
                    border: '1px solid var(--card-border)', padding: '20px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: isLive ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)',
                      color: isLive ? '#3b82f6' : '#d97706',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isLive ? <IconVideo s={22} /> : <IconClock s={22} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {ev.title}
                        </span>
                        <span style={{
                          padding: '2px 8px', borderRadius: 4,
                          background: isLive ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)',
                          color: isLive ? '#3b82f6' : '#d97706',
                          fontSize: 11, fontWeight: 700
                        }}>
                          {ev.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {ev.courseTitle} • {ev.date} at {ev.time} ({ev.duration})
                      </div>
                    </div>
                  </div>

                  {ev.meetingLink && (
                    <a
                      href={ev.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 18px', borderRadius: 8,
                        background: '#3b82f6', color: '#fff',
                        textDecoration: 'none', fontSize: 13, fontWeight: 700
                      }}
                    >
                      <IconExternalLink s={14} /> Join Workshop
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(10,15,29,0.75)', backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
            }}
            onClick={() => setShowAddModal(false)}
          >
            <div
              style={{
                width: '100%', maxWidth: 480, background: 'var(--card-bg)',
                borderRadius: 20, border: '1px solid var(--card-border)',
                padding: 28, position: 'relative'
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  position: 'absolute', top: 16, right: 16,
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                }}
              >
                <IconX s={18} />
              </button>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)' }}>
                Schedule Study Reminder
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. Finish JavaScript Arrays Project"
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      border: '1px solid var(--card-border)', background: 'var(--page-bg)',
                      color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Course
                  </label>
                  <select
                    value={newCourse}
                    onChange={e => setNewCourse(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      border: '1px solid var(--card-border)', background: 'var(--page-bg)',
                      color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'inherit'
                    }}
                  >
                    <option>UX Design Fundamentals</option>
                    <option>Advanced JavaScript</option>
                    <option>Data Analytics with Python</option>
                    <option>Product Management 101</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Target Type
                  </label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as CalendarEvent['type'])}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      border: '1px solid var(--card-border)', background: 'var(--page-bg)',
                      color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'inherit'
                    }}
                  >
                    <option value="study_goal">Daily Study Goal</option>
                    <option value="quiz_deadline">Quiz Deadline</option>
                    <option value="live">Live Session</option>
                    <option value="assignment">Assignment</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 10,
                        border: '1px solid var(--card-border)', background: 'var(--page-bg)',
                        color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Time
                    </label>
                    <input
                      type="text"
                      value={newTime}
                      onChange={e => setNewTime(e.target.value)}
                      placeholder="20:00 WIB"
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 10,
                        border: '1px solid var(--card-border)', background: 'var(--page-bg)',
                        color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                  <button
                    onClick={() => setShowAddModal(false)}
                    style={{
                      padding: '10px 18px', borderRadius: 10,
                      border: '1px solid var(--card-border)', background: 'transparent',
                      color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEvent}
                    style={{
                      padding: '10px 22px', borderRadius: 10,
                      background: 'var(--accent-1)', color: '#fff', border: 'none',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Save Target
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
