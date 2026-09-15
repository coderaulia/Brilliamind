import { useState, useEffect } from 'react'
import {
  MOCK_DISCUSSIONS,
  type Lesson,
  type CourseModule,
  type DiscussionComment,
  type LearnerNote,
} from '@/data/mock-data'
import { IconChevLeft, IconCheck } from '@/components/ui/icons'
import VideoPlayerStage from '@/components/player/VideoPlayerStage'
import ArticleReaderStage from '@/components/player/ArticleReaderStage'
import QuizRunnerStage from '@/components/player/QuizRunnerStage'
import ResourceDownloadStage from '@/components/player/ResourceDownloadStage'
import PlayerTabs from '@/components/player/PlayerTabs'
import SyllabusSidebar from '@/components/player/SyllabusSidebar'
import { useLiveCourseDetail } from '@/hooks/useLiveCourses'
import { api } from '@/lib/api'

interface CoursePlayerPageProps {
  courseId: string | number
  onBack: () => void
}

export default function CoursePlayerPage({ courseId, onBack }: CoursePlayerPageProps) {
  const { course, modules, loading } = useLiveCourseDetail(courseId)

  // Flatten lessons for navigation
  const allLessons: { lesson: Lesson; module: CourseModule }[] = []
  modules.forEach((m) => {
    m.lessons.forEach((l) => {
      allLessons.push({ lesson: l, module: m })
    })
  })

  const [currentLessonId, setCurrentLessonId] = useState<string>('')
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (allLessons.length > 0 && !currentLessonId) {
      setCurrentLessonId(allLessons[0].lesson.id)
      const initial: Record<string, boolean> = {}
      allLessons.forEach((item) => {
        if (item.lesson.completed) initial[item.lesson.id] = true
      })
      setCompletedLessons(initial)
    }
  }, [allLessons, currentLessonId])

  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  // Notes State
  const [notes, setNotes] = useState<LearnerNote[]>([
    {
      id: 'n-1',
      lessonId: 'l1-1',
      lessonTitle: 'Introduction',
      timestampSec: 142,
      content: 'Remember: Review key concepts and take structured notes during video walkthroughs.',
      updatedAt: 'Today',
    },
  ])

  // Discussions State
  const [discussions, setDiscussions] = useState<DiscussionComment[]>(
    course?.discussions && course.discussions.length > 0 ? course.discussions : MOCK_DISCUSSIONS
  )

  const currentIndex = allLessons.findIndex((item) => item.lesson.id === currentLessonId)
  const currentItem = allLessons[currentIndex] || allLessons[0]
  const currentLesson = currentItem?.lesson

  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1].lesson : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].lesson : null

  // Reset quiz on lesson switch
  useEffect(() => {
    setQuizAnswers({})
    setQuizSubmitted(false)
  }, [currentLessonId])

  const markComplete = async (lessonId: string) => {
    setCompletedLessons((prev) => ({ ...prev, [lessonId]: true }))
    try {
      await api.post('/api/progress/toggle-lesson', { lessonId, completed: true })
    } catch {
      // ignore offline error
    }
    if (nextLesson) {
      setCurrentLessonId(nextLesson.id)
    }
  }

  const handleAddNote = (content: string) => {
    if (!currentLesson) return
    const note: LearnerNote = {
      id: `note-${Date.now()}`,
      lessonId: currentLesson.id,
      lessonTitle: currentLesson.title,
      content,
      updatedAt: 'Just now',
    }
    setNotes((prev) => [note, ...prev])
  }

  const handleAddQuestion = (content: string) => {
    const comment: DiscussionComment = {
      id: `comm-${Date.now()}`,
      authorName: 'Learner',
      authorAvatar: 'L',
      authorRole: 'Learner',
      createdAt: 'Just now',
      content,
      upvotes: 0,
    }
    setDiscussions((prev) => [comment, ...prev])
  }

  const handleToggleUpvote = (commentId: string) => {
    setDiscussions((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const hasUpvoted = !c.hasUpvoted
          return {
            ...c,
            hasUpvoted,
            upvotes: hasUpvoted ? c.upvotes + 1 : c.upvotes - 1,
          }
        }
        return c
      })
    )
  }

  const handleSubmitQuiz = () => {
    if (!currentLesson) return
    setQuizSubmitted(true)
    const total = currentLesson.quizQuestions?.length || 1
    let score = 0
    currentLesson.quizQuestions?.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIndex) score++
    })
    if (score / total >= 0.7) {
      markComplete(currentLesson.id)
    }
  }

  // Calculate overall percentage
  const totalLessonCount = allLessons.length
  const completedCount = Object.values(completedLessons).filter(Boolean).length
  const progressPercent = totalLessonCount > 0 ? Math.round((completedCount / totalLessonCount) * 100) : 0

  if (loading && !course) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0C1526', color: '#fff' }}>
        <p style={{ fontSize: 16, fontWeight: 600 }}>Loading course content from server...</p>
      </div>
    )
  }

  if (!course || !currentLesson) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0C1526', color: '#fff', gap: 16 }}>
        <p style={{ fontSize: 16, fontWeight: 600 }}>No lessons found for this course.</p>
        <button onClick={onBack} style={{ padding: '8px 16px', borderRadius: 8, background: '#2dd4bf', color: '#0C1526', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
          Return to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--page-bg)',
        color: 'var(--text-primary)',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Top Learning Bar */}
      <div
        style={{
          height: 58,
          background: '#0C1526',
          color: '#fff',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              padding: '6px 12px',
              borderRadius: 8,
              color: '#e2e8f0',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.16)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
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
              padding: '6px 12px',
              borderRadius: 8,
              background: sidebarOpen ? 'rgba(45, 212, 191, 0.2)' : 'rgba(255,255,255,0.08)',
              color: sidebarOpen ? '#2dd4bf' : '#fff',
              border: 'none',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {sidebarOpen ? 'Hide Syllabus' : 'Show Syllabus'}
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {/* Main Stage */}
          <div style={{ padding: '24px 32px 16px', maxWidth: 1000, width: '100%', margin: '0 auto' }}>
            {currentLesson.type === 'video' && (
              <VideoPlayerStage
                videoUrl={currentLesson.videoUrl}
                onComplete={() => markComplete(currentLesson.id)}
              />
            )}

            {currentLesson.type === 'article' && (
              <ArticleReaderStage
                title={currentLesson.title}
                content={currentLesson.articleContent}
              />
            )}

            {currentLesson.type === 'quiz' && (
              <QuizRunnerStage
                title={currentLesson.title}
                questions={currentLesson.quizQuestions}
                quizAnswers={quizAnswers}
                quizSubmitted={quizSubmitted}
                onAnswerSelect={(qid: string, idx: number) => setQuizAnswers((p) => ({ ...p, [qid]: idx }))}
                onSubmitQuiz={handleSubmitQuiz}
                onRetakeQuiz={() => {
                  setQuizAnswers({})
                  setQuizSubmitted(false)
                }}
              />
            )}

            {currentLesson.type === 'resource' && (
              <ResourceDownloadStage
                title={currentLesson.title}
                resources={currentLesson.resources}
              />
            )}

            {/* Bottom Nav between lessons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 24,
                paddingTop: 16,
                borderTop: '1px solid var(--card-border)',
              }}
            >
              {prevLesson ? (
                <button
                  onClick={() => setCurrentLessonId(prevLesson.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid var(--card-border)',
                    background: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ← Previous: {prevLesson.title.substring(0, 24)}...
                </button>
              ) : <div />}

              <div style={{ display: 'flex', gap: 12 }}>
                {!completedLessons[currentLesson.id] && (
                  <button
                    onClick={() => markComplete(currentLesson.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'rgba(20, 184, 166, 0.12)',
                      color: '#0d9488',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <IconCheck s={16} /> Mark as Done
                  </button>
                )}

                {nextLesson && (
                  <button
                    onClick={() => setCurrentLessonId(nextLesson.id)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#0d9488',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Next Lesson →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Player Tabs (Overview, Notes, Discussions, Resources) */}
          <div style={{ padding: '0 32px 48px', maxWidth: 1000, width: '100%', margin: '0 auto' }}>
            <PlayerTabs
              courseDescription={course.description}
              currentLessonTitle={currentLesson.title}
              notes={notes}
              discussions={discussions}
              onAddNote={handleAddNote}
              onAddQuestion={handleAddQuestion}
              onToggleUpvote={handleToggleUpvote}
              channelTitle={course.channelTitle}
              channelUrl={course.channelUrl}
              credits={course.credits}
              resources={course.resources}
            />
          </div>
        </div>

        {/* Syllabus Sidebar */}
        {sidebarOpen && (
          <SyllabusSidebar
            modules={modules}
            currentLessonId={currentLesson.id}
            completedLessons={completedLessons}
            completedCount={completedCount}
            totalLessonCount={totalLessonCount}
            onSelectLesson={(lid) => setCurrentLessonId(lid)}
            onClose={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  )
}
