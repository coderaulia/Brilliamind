import { useState, useEffect } from 'react'
import {
  CATALOG_COURSES,
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

interface CoursePlayerPageProps {
  courseId: number
  onBack: () => void
}

export default function CoursePlayerPage({ courseId, onBack }: CoursePlayerPageProps) {
  const course = CATALOG_COURSES.find((c) => c.id === courseId) || CATALOG_COURSES[0]
  const modules = course.modules ?? []

  // Flatten lessons for navigation
  const allLessons: { lesson: Lesson; module: CourseModule }[] = []
  modules.forEach((m) => {
    m.lessons.forEach((l) => {
      allLessons.push({ lesson: l, module: m })
    })
  })

  const [currentLessonId, setCurrentLessonId] = useState<string>(allLessons[0]?.lesson.id || 'l1-1')
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    allLessons.forEach((item) => {
      if (item.lesson.completed) initial[item.lesson.id] = true
    })
    return initial
  })

  const [sidebarOpen, setSidebarOpen] = useState(true)

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
      updatedAt: 'Today, 14:20',
    },
  ])

  // Discussions State
  const [discussions, setDiscussions] = useState<DiscussionComment[]>(MOCK_DISCUSSIONS)

  const currentIndex = allLessons.findIndex((item) => item.lesson.id === currentLessonId)
  const currentItem = allLessons[currentIndex] || allLessons[0]
  const currentLesson = currentItem.lesson

  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1].lesson : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].lesson : null

  // Reset quiz on lesson switch
  useEffect(() => {
    setQuizAnswers({})
    setQuizSubmitted(false)
  }, [currentLessonId])

  const markComplete = (lessonId: string) => {
    setCompletedLessons((prev) => ({ ...prev, [lessonId]: true }))
    if (nextLesson) {
      setCurrentLessonId(nextLesson.id)
    }
  }

  const handleAddNote = (content: string) => {
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
      authorName: 'Aulia Rahman',
      authorAvatar: 'AR',
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
    setQuizSubmitted(true)
    const total = currentLesson.quizQuestions?.length || 1
    let score = 0
    currentLesson.quizQuestions?.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIndex) score++
    })
    if (score / total >= 0.7) {
      setCompletedLessons((prev) => ({ ...prev, [currentLesson.id]: true }))
    }
  }

  // Calculate overall percentage
  const totalLessonCount = allLessons.length
  const completedCount = Object.values(completedLessons).filter(Boolean).length
  const progressPercent = totalLessonCount > 0 ? Math.round((completedCount / totalLessonCount) * 100) : 0

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

      {/* Main Workspace Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Center Content Viewport */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {/* Main Lesson Stage */}
          <div style={{ background: '#000', minHeight: 460, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                onAnswerSelect={(qId, optIdx) => setQuizAnswers((prev) => ({ ...prev, [qId]: optIdx }))}
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
          </div>

          {/* Interaction Tabs Area */}
          <PlayerTabs
            courseDescription={course.overview || course.description}
            currentLessonTitle={currentLesson.title}
            notes={notes}
            onAddNote={handleAddNote}
            discussions={discussions}
            onAddQuestion={handleAddQuestion}
            onToggleUpvote={handleToggleUpvote}
          />

          {/* Bottom Lesson Navigation Bar */}
          <div
            style={{
              height: 64,
              borderTop: '1px solid var(--card-border)',
              background: 'var(--card-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 28px',
              flexShrink: 0,
            }}
          >
            <button
              disabled={!prevLesson}
              onClick={() => prevLesson && setCurrentLessonId(prevLesson.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                borderRadius: 10,
                border: '1px solid var(--card-border)',
                background: 'transparent',
                color: prevLesson ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: 13,
                fontWeight: 600,
                cursor: prevLesson ? 'pointer' : 'not-allowed',
                opacity: prevLesson ? 1 : 0.4,
              }}
            >
              <IconChevLeft s={15} /> Previous Lesson
            </button>

            <button
              onClick={() => markComplete(currentLesson.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                color: '#fff',
                border: 'none',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 4px 12px rgba(20,184,166,0.3)',
              }}
            >
              <IconCheck s={16} /> Mark as Completed & Next →
            </button>
          </div>
        </div>

        {/* Right Syllabus Navigation Sidebar */}
        {sidebarOpen && (
          <SyllabusSidebar
            modules={modules}
            currentLessonId={currentLessonId}
            completedLessons={completedLessons}
            completedCount={completedCount}
            totalLessonCount={totalLessonCount}
            onSelectLesson={(id) => setCurrentLessonId(id)}
            onClose={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  )
}
