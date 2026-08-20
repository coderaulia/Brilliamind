import { useState, useRef, useEffect } from 'react'
import DOMPurify from 'dompurify'
import {
  CATALOG_COURSES, MOCK_DISCUSSIONS,
  type Lesson, type CourseModule, type DiscussionComment, type LearnerNote
} from '@/data/mock-data'
import {
  IconChevLeft, IconCheck, IconPlay, IconPause,
  IconVolume, IconVolumeX, IconMaximize, IconFileText, IconHelpCircle,
  IconDownload, IconThumbsUp,
  IconRotateCcw, IconCheckCircle, IconX
} from '@/components/ui/icons'

interface CoursePlayerPageProps {
  courseId: number
  onBack: () => void
}

export default function CoursePlayerPage({ courseId, onBack }: CoursePlayerPageProps) {
  const course = CATALOG_COURSES.find(c => c.id === courseId) || CATALOG_COURSES[0]
  const modules = course.modules ?? []
  
  // Flatten lessons for navigation
  const allLessons: { lesson: Lesson; module: CourseModule }[] = []
  modules.forEach(m => {
    m.lessons.forEach(l => {
      allLessons.push({ lesson: l, module: m })
    })
  })

  const [currentLessonId, setCurrentLessonId] = useState<string>(allLessons[0]?.lesson.id || 'l1-1')
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    allLessons.forEach(item => {
      if (item.lesson.completed) initial[item.lesson.id] = true
    })
    return initial
  })

  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'discussion' | 'resources'>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Video State
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.9)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  // Notes State
  const [notes, setNotes] = useState<LearnerNote[]>([
    {
      id: 'n-1',
      lessonId: 'l1-1',
      lessonTitle: '1.1 Introduction to Modern UX Heuristics',
      timestampSec: 142,
      content: 'Remember: Visibility of system status is crucial for perceived performance.',
      updatedAt: 'Today, 14:20'
    }
  ])
  const [newNoteText, setNewNoteText] = useState('')

  // Discussions State
  const [discussions, setDiscussions] = useState<DiscussionComment[]>(MOCK_DISCUSSIONS)
  const [newQuestionText, setNewQuestionText] = useState('')

  const currentIndex = allLessons.findIndex(item => item.lesson.id === currentLessonId)
  const currentItem = allLessons[currentIndex] || allLessons[0]
  const currentLesson = currentItem.lesson

  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1].lesson : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].lesson : null

  // Reset quiz / playback on lesson switch
  useEffect(() => {
    setIsPlaying(false)
    setQuizAnswers({})
    setQuizSubmitted(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }, [currentLessonId])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      setDuration(videoRef.current.duration || 0)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    setCurrentTime(time)
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setVolume(val)
    if (videoRef.current) {
      videoRef.current.volume = val
      setIsMuted(val === 0)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    if (isMuted) {
      videoRef.current.volume = volume || 0.5
      setIsMuted(false)
    } else {
      videoRef.current.volume = 0
      setIsMuted(true)
    }
  }

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate)
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
    }
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const markComplete = (lessonId: string) => {
    setCompletedLessons(prev => ({ ...prev, [lessonId]: true }))
    if (nextLesson) {
      setCurrentLessonId(nextLesson.id)
    }
  }

  const handleAddNote = () => {
    if (!newNoteText.trim()) return
    const note: LearnerNote = {
      id: `note-${Date.now()}`,
      lessonId: currentLesson.id,
      lessonTitle: currentLesson.title,
      timestampSec: currentLesson.type === 'video' ? Math.floor(currentTime) : undefined,
      content: newNoteText.trim(),
      updatedAt: 'Just now'
    }
    setNotes(prev => [note, ...prev])
    setNewNoteText('')
  }

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return
    const comment: DiscussionComment = {
      id: `comm-${Date.now()}`,
      authorName: 'Aulia Rahman',
      authorAvatar: 'AR',
      authorRole: 'Learner',
      createdAt: 'Just now',
      content: newQuestionText.trim(),
      upvotes: 0
    }
    setDiscussions(prev => [comment, ...prev])
    setNewQuestionText('')
  }

  const handleToggleUpvote = (commentId: string) => {
    setDiscussions(prev => prev.map(c => {
      if (c.id === commentId) {
        const hasUpvoted = !c.hasUpvoted
        return {
          ...c,
          hasUpvoted,
          upvotes: hasUpvoted ? c.upvotes + 1 : c.upvotes - 1
        }
      }
      return c
    }))
  }

  // Calculate overall percentage
  const totalLessonCount = allLessons.length
  const completedCount = Object.values(completedLessons).filter(Boolean).length
  const progressPercent = totalLessonCount > 0 ? Math.round((completedCount / totalLessonCount) * 100) : 0

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: 'var(--page-bg)', color: 'var(--text-primary)',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      overflow: 'hidden'
    }}>
      {/* Top Learning Bar */}
      <div style={{
        height: 58, background: '#0C1526', color: '#fff',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', flexShrink: 0, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.08)', border: 'none',
              padding: '6px 12px', borderRadius: 8, color: '#e2e8f0',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.16)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          >
            <IconChevLeft s={16} /> Back to Dashboard
          </button>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)' }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#2dd4bf', letterSpacing: '0.04em' }}>
              {course.title}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>
              {currentLesson.title}
            </div>
          </div>
        </div>

        {/* Progress Bar & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 120, height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: '#2dd4bf', transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#2dd4bf' }}>
              {progressPercent}% Complete
            </span>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: '6px 12px', borderRadius: 8,
              background: sidebarOpen ? 'rgba(45, 212, 191, 0.2)' : 'rgba(255,255,255,0.08)',
              color: sidebarOpen ? '#2dd4bf' : '#fff',
              border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            {sidebarOpen ? 'Hide Syllabus' : 'Show Syllabus'}
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left / Center Content Viewport */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {/* Main Lesson Stage */}
          <div style={{ background: '#000', minHeight: 460, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {currentLesson.type === 'video' && (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <video
                  ref={videoRef}
                  src={currentLesson.videoUrl}
                  style={{ width: '100%', maxHeight: 520, objectFit: 'contain', background: '#05070d' }}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => markComplete(currentLesson.id)}
                  onClick={togglePlay}
                />

                {/* Custom Video Overlay Controls */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                  padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8
                }}>
                  {/* Scrubber */}
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    style={{
                      width: '100%', accentColor: '#2dd4bf', cursor: 'pointer',
                      height: 4, borderRadius: 2
                    }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <button
                        onClick={togglePlay}
                        style={{
                          background: 'none', border: 'none', color: '#fff',
                          cursor: 'pointer', display: 'flex', alignItems: 'center'
                        }}
                      >
                        {isPlaying ? <IconPause s={20} /> : <IconPlay s={20} />}
                      </button>

                      <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
                        <button
                          onClick={toggleMute}
                          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
                        >
                          {isMuted || volume === 0 ? <IconVolumeX s={18} /> : <IconVolume s={18} />}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          style={{ width: 64, accentColor: '#2dd4bf', height: 3 }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[1, 1.25, 1.5, 2].map(rate => (
                          <button
                            key={rate}
                            onClick={() => handleRateChange(rate)}
                            style={{
                              padding: '2px 6px', borderRadius: 4,
                              background: playbackRate === rate ? '#2dd4bf' : 'rgba(255,255,255,0.1)',
                              color: playbackRate === rate ? '#000' : '#fff',
                              border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            if (document.fullscreenElement) {
                              document.exitFullscreen()
                            } else {
                              videoRef.current.requestFullscreen()
                            }
                          }
                        }}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
                      >
                        <IconMaximize s={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentLesson.type === 'article' && (
              <div style={{
                width: '100%', minHeight: 460, background: 'var(--card-bg)',
                padding: '40px 48px', color: 'var(--text-primary)'
              }}>
                <div style={{ maxWidth: 740, margin: '0 auto' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', borderRadius: 20, background: 'rgba(20,184,166,0.1)',
                    color: 'var(--accent-1)', fontSize: 12, fontWeight: 700, marginBottom: 16
                  }}>
                    <IconFileText s={14} /> Comprehensive Reading Guide
                  </div>
                  <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.3, marginBottom: 20 }}>
                    {currentLesson.title}
                  </h1>
                  <div
                    style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)' }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        (currentLesson.articleContent || '')
                          .replace(/\n\n/g, '<br/><br/>')
                          .replace(/### (.*?)\n/g, '<h3 style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 24px 0 12px;">$1</h3>')
                          .replace(/#### (.*?)\n/g, '<h4 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 18px 0 8px;">$1</h4>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-primary);">$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      )
                    }}
                  />
                </div>
              </div>
            )}

            {currentLesson.type === 'quiz' && (
              <div style={{
                width: '100%', minHeight: 460, background: 'var(--card-bg)',
                padding: '36px 40px', color: 'var(--text-primary)'
              }}>
                <div style={{ maxWidth: 680, margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                      <span style={{
                        padding: '4px 10px', borderRadius: 20,
                        background: 'rgba(245, 158, 11, 0.1)', color: '#d97706',
                        fontSize: 12, fontWeight: 700
                      }}>
                        Interactive Assessment
                      </span>
                      <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>
                        {currentLesson.title}
                      </h2>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                      {currentLesson.quizQuestions?.length || 0} Questions
                    </div>
                  </div>

                  {/* Questions List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {currentLesson.quizQuestions?.map((q, qIdx) => {
                      const selected = quizAnswers[q.id]
                      const isCorrect = selected === q.correctIndex
                      return (
                        <div
                          key={q.id}
                          style={{
                            padding: '20px 24px', borderRadius: 16,
                            background: 'var(--page-bg)', border: '1px solid var(--card-border)'
                          }}
                        >
                          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>
                            {qIdx + 1}. {q.question}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {q.options.map((opt, optIdx) => {
                              const isThisSelected = selected === optIdx
                              let border = '1px solid var(--card-border)'
                              let bg = 'var(--card-bg)'
                              let color = 'var(--text-secondary)'

                              if (isThisSelected) {
                                border = '2px solid var(--accent-1)'
                                bg = 'rgba(20,184,166,0.08)'
                                color = 'var(--text-primary)'
                              }

                              if (quizSubmitted) {
                                if (optIdx === q.correctIndex) {
                                  border = '2px solid #10b981'
                                  bg = 'rgba(16,185,129,0.12)'
                                  color = '#047857'
                                } else if (isThisSelected && !isCorrect) {
                                  border = '2px solid #ef4444'
                                  bg = 'rgba(239,68,68,0.1)'
                                  color = '#b91c1c'
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  disabled={quizSubmitted}
                                  onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '12px 16px', borderRadius: 10,
                                    border, background: bg, color,
                                    fontSize: 14, fontWeight: 500, textAlign: 'left',
                                    cursor: quizSubmitted ? 'default' : 'pointer',
                                    fontFamily: 'inherit', transition: 'all 0.15s'
                                  }}
                                >
                                  <div style={{
                                    width: 22, height: 22, borderRadius: '50%',
                                    border: isThisSelected ? '2px solid var(--accent-1)' : '2px solid var(--card-border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 11, fontWeight: 700, flexShrink: 0
                                  }}>
                                    {String.fromCharCode(65 + optIdx)}
                                  </div>
                                  <span>{opt}</span>
                                </button>
                              )
                            })}
                          </div>

                          {quizSubmitted && (
                            <div style={{
                              marginTop: 14, padding: '12px 16px', borderRadius: 10,
                              background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                              borderLeft: `4px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                              fontSize: 13, lineHeight: 1.5
                            }}>
                              <div style={{ fontWeight: 700, color: isCorrect ? '#047857' : '#b91c1c', marginBottom: 2 }}>
                                {isCorrect ? '✓ Correct!' : '✗ Explanation:'}
                              </div>
                              <div style={{ color: 'var(--text-secondary)' }}>{q.explanation}</div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Quiz Submit Bar */}
                  <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {!quizSubmitted ? (
                      <button
                        onClick={() => {
                          setQuizSubmitted(true)
                          const total = currentLesson.quizQuestions?.length || 1
                          let score = 0
                          currentLesson.quizQuestions?.forEach(q => {
                            if (quizAnswers[q.id] === q.correctIndex) score++
                          })
                          if (score / total >= 0.7) {
                            setCompletedLessons(prev => ({ ...prev, [currentLesson.id]: true }))
                          }
                        }}
                        style={{
                          padding: '12px 32px', borderRadius: 10,
                          background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                          color: '#fff', border: 'none', fontSize: 14, fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'inherit',
                          boxShadow: '0 4px 14px rgba(20,184,166,0.35)'
                        }}
                      >
                        Submit Answers & Check Score
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: '#10b981' }}><IconCheckCircle s={22} /></span>
                          <span style={{ fontSize: 14, fontWeight: 700 }}>
                            Score: {Object.entries(quizAnswers).filter(([qId, val]) => currentLesson.quizQuestions?.find(q => q.id === qId)?.correctIndex === val).length} / {currentLesson.quizQuestions?.length}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setQuizAnswers({})
                            setQuizSubmitted(false)
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 16px', borderRadius: 8,
                            border: '1px solid var(--card-border)', background: 'transparent',
                            color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <IconRotateCcw s={14} /> Retake Quiz
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentLesson.type === 'resource' && (
              <div style={{
                width: '100%', minHeight: 460, background: 'var(--card-bg)',
                padding: '40px 48px', color: 'var(--text-primary)'
              }}>
                <div style={{ maxWidth: 640, margin: '0 auto' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', borderRadius: 20, background: 'rgba(59,130,246,0.1)',
                    color: '#3b82f6', fontSize: 12, fontWeight: 700, marginBottom: 16
                  }}>
                    <IconDownload s={14} /> Downloadable Course Assets
                  </div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
                    {currentLesson.title}
                  </h2>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                    Download the project files, templates, and Figma libraries to follow along with this module.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {currentLesson.resources?.map((res, rIdx) => (
                      <div
                        key={rIdx}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '16px 20px', borderRadius: 12,
                          background: 'var(--page-bg)', border: '1px solid var(--card-border)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: 'rgba(20,184,166,0.12)', color: 'var(--accent-1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <IconFileText s={18} />
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                              {res.title}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {res.size}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => alert(`Downloading ${res.title}...`)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 16px', borderRadius: 8,
                            background: 'var(--accent-1)', color: '#fff', border: 'none',
                            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                          }}
                        >
                          <IconDownload s={14} /> Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interaction Tabs Area */}
          <div style={{ flex: 1, padding: '24px 32px', background: 'var(--page-bg)' }}>
            <div style={{ maxWidth: 880, margin: '0 auto' }}>
              {/* Tab Navigation */}
              <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--card-border)', paddingBottom: 12, marginBottom: 20 }}>
                {[
                  { id: 'overview' as const, label: 'Overview & Notes' },
                  { id: 'discussion' as const, label: `Q&A Discussions (${discussions.length})` },
                  { id: 'resources' as const, label: 'Downloads' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    style={{
                      padding: '8px 18px', borderRadius: 10,
                      border: activeTab === t.id ? 'none' : '1px solid transparent',
                      background: activeTab === t.id ? 'var(--card-bg)' : 'transparent',
                      color: activeTab === t.id ? 'var(--accent-1)' : 'var(--text-secondary)',
                      boxShadow: activeTab === t.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                      fontSize: 14, fontWeight: activeTab === t.id ? 700 : 500,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
                    About this lesson
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                    {course.overview || course.description}
                  </p>

                  {/* Personal Notes Box */}
                  <div style={{
                    background: 'var(--card-bg)', borderRadius: 16,
                    border: '1px solid var(--card-border)', padding: 20
                  }}>
                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
                      Personal Study Notes
                    </h4>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                      <input
                        type="text"
                        value={newNoteText}
                        onChange={e => setNewNoteText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                        placeholder={`Take a note for "${currentLesson.title}"...`}
                        style={{
                          flex: 1, padding: '10px 14px', borderRadius: 10,
                          border: '1px solid var(--card-border)', background: 'var(--page-bg)',
                          color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit', outline: 'none'
                        }}
                      />
                      <button
                        onClick={handleAddNote}
                        style={{
                          padding: '10px 20px', borderRadius: 10,
                          background: 'var(--accent-1)', color: '#fff', border: 'none',
                          fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'
                        }}
                      >
                        Save Note
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {notes.map(n => (
                        <div
                          key={n.id}
                          style={{
                            padding: '12px 14px', borderRadius: 10,
                            background: 'var(--page-bg)', border: '1px solid var(--card-border)',
                            fontSize: 13, color: 'var(--text-secondary)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{n.lessonTitle}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{n.updatedAt}</span>
                          </div>
                          <div>{n.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'discussion' && (
                <div>
                  <div style={{
                    background: 'var(--card-bg)', borderRadius: 16,
                    border: '1px solid var(--card-border)', padding: 20, marginBottom: 20
                  }}>
                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>
                      Ask a Question or Share Feedback
                    </h4>
                    <textarea
                      rows={3}
                      value={newQuestionText}
                      onChange={e => setNewQuestionText(e.target.value)}
                      placeholder="Have a question about Jakob Nielsen heuristics or this lesson's concept? Ask here..."
                      style={{
                        width: '100%', padding: '12px 14px', borderRadius: 10,
                        border: '1px solid var(--card-border)', background: 'var(--page-bg)',
                        color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit',
                        outline: 'none', resize: 'vertical', marginBottom: 10
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={handleAddQuestion}
                        style={{
                          padding: '8px 20px', borderRadius: 8,
                          background: 'var(--accent-1)', color: '#fff', border: 'none',
                          fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'
                        }}
                      >
                        Post Question
                      </button>
                    </div>
                  </div>

                  {/* Thread list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {discussions.map(comm => (
                      <div
                        key={comm.id}
                        style={{
                          background: 'var(--card-bg)', borderRadius: 14,
                          border: '1px solid var(--card-border)', padding: 18
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 8,
                              background: 'linear-gradient(135deg, #3b82f6, #0d9488)',
                              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 700
                            }}>
                              {comm.authorAvatar}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                                {comm.authorName}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{comm.createdAt}</div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleToggleUpvote(comm.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              padding: '4px 10px', borderRadius: 20,
                              background: comm.hasUpvoted ? 'rgba(20,184,166,0.15)' : 'var(--page-bg)',
                              color: comm.hasUpvoted ? 'var(--accent-1)' : 'var(--text-muted)',
                              border: '1px solid var(--card-border)', fontSize: 12, fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <IconThumbsUp s={13} /> {comm.upvotes}
                          </button>
                        </div>

                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: comm.replies ? 14 : 0 }}>
                          {comm.content}
                        </p>

                        {/* Replies */}
                        {comm.replies?.map(rep => (
                          <div
                            key={rep.id}
                            style={{
                              marginLeft: 24, padding: '12px 14px', borderRadius: 10,
                              background: 'var(--page-bg)', borderLeft: '3px solid var(--accent-1)',
                              marginTop: 10
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                                {rep.authorName}
                              </span>
                              <span style={{
                                padding: '2px 6px', borderRadius: 4,
                                background: 'rgba(20,184,166,0.12)', color: 'var(--accent-1)',
                                fontSize: 10, fontWeight: 800
                              }}>
                                {rep.authorRole}
                              </span>
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                              {rep.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'resources' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Course assets, templates, and slide decks available for offline study:
                  </div>
                  {[
                    { name: 'Complete_UX_Design_Handbook_v2.pdf', size: '14.2 MB' },
                    { name: 'Jakob_Nielsen_Heuristics_Cheatsheet.png', size: '2.4 MB' },
                    { name: 'Wireframing_UI_Kit_Components.fig', size: '8.8 MB' }
                  ].map((f, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 18px', borderRadius: 12,
                        background: 'var(--card-bg)', border: '1px solid var(--card-border)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <IconFileText s={18} style={{ color: 'var(--accent-1)' } as React.CSSProperties} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{f.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.size}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`Downloading ${f.name}`)}
                        style={{
                          padding: '6px 14px', borderRadius: 8,
                          background: 'var(--page-bg)', border: '1px solid var(--card-border)',
                          color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Lesson Navigation Bar */}
          <div style={{
            height: 64, borderTop: '1px solid var(--card-border)',
            background: 'var(--card-bg)', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: '0 28px', flexShrink: 0
          }}>
            <button
              disabled={!prevLesson}
              onClick={() => prevLesson && setCurrentLessonId(prevLesson.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 10,
                border: '1px solid var(--card-border)', background: 'transparent',
                color: prevLesson ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: 13, fontWeight: 600, cursor: prevLesson ? 'pointer' : 'not-allowed',
                opacity: prevLesson ? 1 : 0.4
              }}
            >
              <IconChevLeft s={15} /> Previous Lesson
            </button>

            <button
              onClick={() => markComplete(currentLesson.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 10,
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                color: '#fff', border: 'none', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 12px rgba(20,184,166,0.3)'
              }}
            >
              <IconCheck s={16} /> Mark as Completed & Next →
            </button>
          </div>
        </div>

        {/* Right Syllabus Navigation Sidebar */}
        {sidebarOpen && (
          <div style={{
            width: 340, height: '100%', background: 'var(--card-bg)',
            borderLeft: '1px solid var(--card-border)', display: 'flex',
            flexDirection: 'column', flexShrink: 0
          }}>
            <div style={{
              padding: '18px 20px', borderBottom: '1px solid var(--card-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
                  Course Syllabus
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {completedCount} of {totalLessonCount} completed
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <IconX s={18} />
              </button>
            </div>

            {/* Syllabus Scroll Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
              {modules.map(mod => (
                <div key={mod.id} style={{ marginBottom: 16 }}>
                  <div style={{
                    fontSize: 12, fontWeight: 800, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    padding: '6px 8px', marginBottom: 4
                  }}>
                    {mod.title}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {mod.lessons.map(l => {
                      const isCurrent = l.id === currentLessonId
                      const isDone = completedLessons[l.id]
                      return (
                        <button
                          key={l.id}
                          onClick={() => setCurrentLessonId(l.id)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 12px', borderRadius: 10,
                            border: isCurrent ? '1px solid var(--accent-1)' : '1px solid transparent',
                            background: isCurrent ? 'rgba(20,184,166,0.1)' : 'transparent',
                            cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: '50%',
                              background: isDone ? '#10b981' : (isCurrent ? 'var(--accent-1)' : 'var(--card-border)'),
                              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, flexShrink: 0
                            }}>
                              {isDone ? <IconCheck s={12} /> : (
                                l.type === 'video' ? <IconPlay s={10} /> :
                                l.type === 'quiz' ? <IconHelpCircle s={10} /> :
                                <IconFileText s={10} />
                              )}
                            </div>
                            <span style={{
                              fontSize: 13, fontWeight: isCurrent ? 700 : 500,
                              color: isCurrent ? 'var(--accent-1)' : 'var(--text-primary)',
                              lineHeight: 1.3
                            }}>
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
        )}
      </div>
    </div>
  )
}
