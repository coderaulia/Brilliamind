import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  Plus,
  Play,
  Video,
  CheckCircle2,
  Trash2,
  Eye,
  ExternalLink,
} from 'lucide-react'

interface Lesson {
  id: string
  sectionId: string
  title: string
  type: string
  videoUrl: string | null
  position: number
  isFreePreview: boolean
}

interface Section {
  id: string
  courseId: string
  title: string
  position: number
  lessons: Lesson[]
}

interface CourseDetails {
  id: string
  title: string
  slug: string
  description: string | null
  coverUrl: string | null
  category: string | null
  price: number
  currency: string
  status: 'draft' | 'published' | 'archived'
}

export default function CourseEditorPage() {
  const { id: courseId } = useParams<{ id: string }>()

  const [course, setCourse] = useState<CourseDetails | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  // Section modal
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false)
  const [newSectionTitle, setNewSectionTitle] = useState('')

  // Lesson modal
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false)
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonType] = useState<'youtube' | 'video'>('youtube')
  const [videoUrl, setVideoUrl] = useState('')
  const [isFreePreview, setIsFreePreview] = useState(false)

  const fetchCourseData = useCallback(async () => {
    if (!courseId) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.get<{ course: CourseDetails; sections: Section[] }>(`/api/courses/${courseId}`)
      setCourse(res.course)
      setSections(res.sections)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load course')
    } finally {
      setIsLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    fetchCourseData()
  }, [fetchCourseData])

  const handleUpdateCourseMetadata = async (updates: Partial<CourseDetails>) => {
    if (!courseId || !course) return
    setSaveStatus('Saving...')
    try {
      await api.put(`/api/courses/${courseId}`, updates)
      setCourse({ ...course, ...updates })
      setSaveStatus('Saved!')
      setTimeout(() => setSaveStatus(null), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update course')
      setSaveStatus(null)
    }
  }

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseId || !newSectionTitle) return
    try {
      await api.post(`/api/courses/${courseId}/sections`, {
        title: newSectionTitle,
        position: sections.length,
      })
      setNewSectionTitle('')
      setIsSectionModalOpen(false)
      fetchCourseData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add section')
    }
  }

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeSectionId || !lessonTitle) return
    try {
      await api.post(`/api/courses/sections/${activeSectionId}/lessons`, {
        title: lessonTitle,
        type: lessonType,
        videoUrl: videoUrl || undefined,
        isFreePreview,
        position: 0,
      })
      setLessonTitle('')
      setVideoUrl('')
      setIsLessonModalOpen(false)
      fetchCourseData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add video lesson')
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return
    try {
      await api.delete(`/api/courses/lessons/${lessonId}`)
      fetchCourseData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete lesson')
    }
  }

  // Convert standard YouTube links to embeddable URLs
  const getEmbedUrl = (url: string) => {
    if (!url) return ''
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}`
      : url
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-100 p-8 text-center">
        <p className="text-rose-400">Course not found.</p>
        <Link to="/instructor/courses" className="mt-4 inline-block text-indigo-400">Back to courses</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-xl sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/instructor/courses"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              {course.title}
            </h1>
            <span className="text-[11px] text-slate-400">Curriculum & Video Lesson Builder</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {saveStatus}
            </span>
          )}

          <button
            onClick={() => handleUpdateCourseMetadata({
              status: course.status === 'published' ? 'draft' : 'published',
            })}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all ${
              course.status === 'published'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20'
            }`}
          >
            {course.status === 'published' ? 'Published (Click to Unpublish)' : 'Publish Course'}
          </button>

          <Link
            to={`/learn/${course.id}`}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" /> Preview Player
          </Link>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {error && (
          <div className="lg:col-span-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Left Column: Course Metadata Settings */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Course Details</h2>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
              <input
                type="text"
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                onBlur={() => handleUpdateCourseMetadata({ title: course.title })}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <input
                type="text"
                value={course.category || ''}
                onChange={(e) => setCourse({ ...course, category: e.target.value })}
                onBlur={() => handleUpdateCourseMetadata({ category: course.category })}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Cover Image URL</label>
              <input
                type="url"
                value={course.coverUrl || ''}
                onChange={(e) => setCourse({ ...course, coverUrl: e.target.value })}
                onBlur={() => handleUpdateCourseMetadata({ coverUrl: course.coverUrl })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
              <textarea
                rows={4}
                value={course.description || ''}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                onBlur={() => handleUpdateCourseMetadata({ description: course.description })}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Curriculum Sections & Video Lessons */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100">Course Curriculum</h2>
              <p className="text-xs text-slate-400">Organize sections and attach third-party YouTube videos</p>
            </div>
            <button
              onClick={() => setIsSectionModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Section
            </button>
          </div>

          {sections.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#1E293B]/40 border border-slate-800 text-slate-400 text-sm">
              No sections created yet. Click "Add Section" to begin building modules.
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((section, secIdx) => (
                <div
                  key={section.id}
                  className="rounded-2xl bg-[#1E293B]/90 border border-slate-800 overflow-hidden shadow-lg"
                >
                  <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold flex items-center justify-center">
                        {secIdx + 1}
                      </span>
                      <h3 className="font-semibold text-sm text-slate-100">{section.title}</h3>
                    </div>

                    <button
                      onClick={() => {
                        setActiveSectionId(section.id)
                        setIsLessonModalOpen(true)
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-medium transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add YouTube Lesson
                    </button>
                  </div>

                  {/* Lessons List in Section */}
                  <div className="p-3 divide-y divide-slate-800/60 space-y-1">
                    {section.lessons.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3 text-center italic">
                        No video lessons in this section yet.
                      </p>
                    ) : (
                      section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="py-3 px-3 rounded-xl hover:bg-slate-800/40 flex items-center justify-between gap-3 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                              <Play className="w-4 h-4 fill-current" />
                            </div>
                            <div className="truncate">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-medium text-slate-200 truncate">{lesson.title}</h4>
                                {lesson.isFreePreview && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                    Free Preview
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">
                                {lesson.videoUrl || 'No video link attached'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {lesson.videoUrl && (
                              <a
                                href={lesson.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                                title="Open Video Link"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete Lesson"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Section Modal */}
        {isSectionModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-slate-100">Add Curriculum Section</h3>
              <form onSubmit={handleAddSection} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Section Title</label>
                  <input
                    type="text"
                    required
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    placeholder="e.g., Module 2: Advanced Cloud Workers"
                    className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSectionModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    Add Section
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add YouTube Lesson Modal */}
        {isLessonModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Video className="w-5 h-5 text-rose-400" /> Add YouTube / Video Lesson
              </h3>

              <form onSubmit={handleAddLesson} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Lesson Title</label>
                  <input
                    type="text"
                    required
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="e.g., Understanding Worker Edge Isolates"
                    className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    YouTube Video URL or Direct MP4 Link
                  </label>
                  <input
                    type="url"
                    required
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                {videoUrl && (
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                    <iframe
                      src={getEmbedUrl(videoUrl)}
                      title="Video Preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="freePreview"
                    checked={isFreePreview}
                    onChange={(e) => setIsFreePreview(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                  />
                  <label htmlFor="freePreview" className="text-xs text-slate-300 cursor-pointer">
                    Mark as Free Preview (accessible to unauthenticated guests)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsLessonModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
                  >
                    Save Lesson
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
