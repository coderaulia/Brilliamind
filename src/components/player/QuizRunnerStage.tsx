import type { QuizQuestion } from '@/data/mock-data'
import { IconCheckCircle, IconRotateCcw } from '@/components/ui/icons'

interface QuizRunnerStageProps {
  title: string
  questions?: QuizQuestion[]
  quizAnswers: Record<string, number>
  quizSubmitted: boolean
  onAnswerSelect: (questionId: string, optionIndex: number) => void
  onSubmitQuiz: () => void
  onRetakeQuiz: () => void
}

export default function QuizRunnerStage({
  title,
  questions = [],
  quizAnswers,
  quizSubmitted,
  onAnswerSelect,
  onSubmitQuiz,
  onRetakeQuiz,
}: QuizRunnerStageProps) {
  const correctCount = Object.entries(quizAnswers).filter(
    ([qId, val]) => questions.find((q) => q.id === qId)?.correctIndex === val
  ).length

  return (
    <div
      style={{
        width: '100%',
        minHeight: 460,
        background: 'var(--card-bg)',
        padding: '36px 40px',
        color: 'var(--text-primary)',
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: 20,
                background: 'rgba(245, 158, 11, 0.1)',
                color: '#d97706',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Interactive Assessment
            </span>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>{title}</h2>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
            {questions.length} Questions
          </div>
        </div>

        {/* Questions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {questions.map((q, qIdx) => {
            const selected = quizAnswers[q.id]
            const isCorrect = selected === q.correctIndex
            return (
              <div
                key={q.id}
                style={{
                  padding: '20px 24px',
                  borderRadius: 16,
                  background: 'var(--page-bg)',
                  border: '1px solid var(--card-border)',
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
                        onClick={() => onAnswerSelect(q.id, optIdx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 16px',
                          borderRadius: 10,
                          border,
                          background: bg,
                          color,
                          fontSize: 14,
                          fontWeight: 500,
                          textAlign: 'left',
                          cursor: quizSubmitted ? 'default' : 'pointer',
                          fontFamily: 'inherit',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            border: isThisSelected
                              ? '2px solid var(--accent-1)'
                              : '2px solid var(--card-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span>{opt}</span>
                      </button>
                    )
                  })}
                </div>

                {quizSubmitted && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                      borderLeft: `4px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                      fontSize: 13,
                      lineHeight: 1.5,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        color: isCorrect ? '#047857' : '#b91c1c',
                        marginBottom: 2,
                      }}
                    >
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
              onClick={onSubmitQuiz}
              style={{
                padding: '12px 32px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                color: '#fff',
                border: 'none',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(20,184,166,0.35)',
              }}
            >
              Submit Answers & Check Score
            </button>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                width: '100%',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#10b981' }}>
                  <IconCheckCircle s={22} />
                </span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>
                  Score: {correctCount} / {questions.length}
                </span>
              </div>
              <button
                onClick={onRetakeQuiz}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--card-border)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <IconRotateCcw s={14} /> Retake Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
