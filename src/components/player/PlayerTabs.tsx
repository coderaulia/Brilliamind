import { useState } from 'react'
import type { DiscussionComment, LearnerNote } from '@/data/mock-data'
import { IconThumbsUp, IconFileText } from '@/components/ui/icons'

interface PlayerTabsProps {
  courseDescription?: string
  currentLessonTitle: string
  notes: LearnerNote[]
  onAddNote: (content: string) => void
  discussions: DiscussionComment[]
  onAddQuestion: (content: string) => void
  onToggleUpvote: (commentId: string) => void
}

export default function PlayerTabs({
  courseDescription,
  currentLessonTitle,
  notes,
  onAddNote,
  discussions,
  onAddQuestion,
  onToggleUpvote,
}: PlayerTabsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'discussion' | 'resources'>('overview')
  const [newNoteText, setNewNoteText] = useState('')
  const [newQuestionText, setNewQuestionText] = useState('')

  const handleNoteSubmit = () => {
    if (!newNoteText.trim()) return
    onAddNote(newNoteText.trim())
    setNewNoteText('')
  }

  const handleQuestionSubmit = () => {
    if (!newQuestionText.trim()) return
    onAddQuestion(newQuestionText.trim())
    setNewQuestionText('')
  }

  return (
    <div style={{ flex: 1, padding: '24px 32px', background: 'var(--page-bg)' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            borderBottom: '1px solid var(--card-border)',
            paddingBottom: 12,
            marginBottom: 20,
          }}
        >
          {[
            { id: 'overview' as const, label: 'Overview & Notes' },
            { id: 'discussion' as const, label: `Q&A Discussions (${discussions.length})` },
            { id: 'resources' as const, label: 'Downloads' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '8px 18px',
                borderRadius: 10,
                border: activeTab === t.id ? 'none' : '1px solid transparent',
                background: activeTab === t.id ? 'var(--card-bg)' : 'transparent',
                color: activeTab === t.id ? 'var(--accent-1)' : 'var(--text-secondary)',
                boxShadow: activeTab === t.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                fontSize: 14,
                fontWeight: activeTab === t.id ? 700 : 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
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
              {courseDescription}
            </p>

            {/* Personal Notes Box */}
            <div
              style={{
                background: 'var(--card-bg)',
                borderRadius: 16,
                border: '1px solid var(--card-border)',
                padding: 20,
              }}
            >
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
                Personal Study Notes
              </h4>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNoteSubmit()}
                  placeholder={`Take a note for "${currentLessonTitle}"...`}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--card-border)',
                    background: 'var(--page-bg)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleNoteSubmit}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 10,
                    background: 'var(--accent-1)',
                    color: '#fff',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Save Note
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {notes.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: 'var(--page-bg)',
                      border: '1px solid var(--card-border)',
                      fontSize: 13,
                      color: 'var(--text-secondary)',
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
            <div
              style={{
                background: 'var(--card-bg)',
                borderRadius: 16,
                border: '1px solid var(--card-border)',
                padding: 20,
                marginBottom: 20,
              }}
            >
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>
                Ask a Question or Share Feedback
              </h4>
              <textarea
                rows={3}
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Have a question about this lesson's concept? Ask here..."
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--card-border)',
                  background: 'var(--page-bg)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                  marginBottom: 10,
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleQuestionSubmit}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 8,
                    background: 'var(--accent-1)',
                    color: '#fff',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Post Question
                </button>
              </div>
            </div>

            {/* Thread list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {discussions.map((comm) => (
                <div
                  key={comm.id}
                  style={{
                    background: 'var(--card-bg)',
                    borderRadius: 14,
                    border: '1px solid var(--card-border)',
                    padding: 18,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: 'linear-gradient(135deg, #3b82f6, #0d9488)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
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
                      onClick={() => onToggleUpvote(comm.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 10px',
                        borderRadius: 20,
                        background: comm.hasUpvoted ? 'rgba(20,184,166,0.15)' : 'var(--page-bg)',
                        color: comm.hasUpvoted ? 'var(--accent-1)' : 'var(--text-muted)',
                        border: '1px solid var(--card-border)',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <IconThumbsUp s={13} /> {comm.upvotes}
                    </button>
                  </div>

                  <p
                    style={{
                      fontSize: 14,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: comm.replies ? 14 : 0,
                    }}
                  >
                    {comm.content}
                  </p>

                  {/* Replies */}
                  {comm.replies?.map((rep) => (
                    <div
                      key={rep.id}
                      style={{
                        marginLeft: 24,
                        padding: '12px 14px',
                        borderRadius: 10,
                        background: 'var(--page-bg)',
                        borderLeft: '3px solid var(--accent-1)',
                        marginTop: 10,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {rep.authorName}
                        </span>
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: 'rgba(20,184,166,0.12)',
                            color: 'var(--accent-1)',
                            fontSize: 10,
                            fontWeight: 800,
                          }}
                        >
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
              { name: 'Wireframing_UI_Kit_Components.fig', size: '8.8 MB' },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 12,
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
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
                    padding: '6px 14px',
                    borderRadius: 8,
                    background: 'var(--page-bg)',
                    border: '1px solid var(--card-border)',
                    color: 'var(--text-primary)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
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
  )
}
