import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import {
  BookOpen,
  Plus,
  Edit,
  Users,
  LogOut,
  FolderPlus,
} from 'lucide-react'

interface CourseItem {
  id: string
  title: string
  slug: string
  description: string | null
  coverUrl: string | null
  category: string | null
  status: 'draft' | 'published' | 'archived'
  price: number
  currency: string
  createdAt: string
}

export default function CourseManagerPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [courses, setCourses] = useState<CourseItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // New course modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Cloud Engineering')
  const [newDescription, setNewDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const fetchCourses = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.get<{ courses: CourseItem[] }>('/api/courses/instructor/my-courses')
      setCourses(res.courses)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setError(null)

    try {
      const res = await api.post<{ id: string }>('/api/courses', {
        title: newTitle,
        category: newCategory,
        description: newDescription,
        status: 'draft',
      })
      setIsModalOpen(false)
      navigate(`/instructor/courses/${res.id}/edit`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create course')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-xl sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Instructor Studio
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Course Creator
              </span>
            </h1>
            <p className="text-xs text-slate-400">Design curriculum, embed YouTube videos, and track learner progress</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Course
          </button>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-slate-200">{user?.name || 'Instructor'}</p>
            <p className="text-[11px] text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={() => {
              logout()
              window.location.href = '/login'
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">My Authoring Courses</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage your courses, edit video lessons, and view enrolled learners</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-slate-800/40 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#1E293B]/40 border border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <FolderPlus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-100">No courses created yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Get started by creating your first course and adding YouTube video lessons for your students.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Create Course Draft
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map(course => (
              <div
                key={course.id}
                className="rounded-2xl bg-[#1E293B]/80 border border-slate-800/90 overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col group"
              >
                <div className="h-40 bg-slate-900 relative overflow-hidden">
                  <img
                    src={course.coverUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg ${
                      course.status === 'published'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-amber-500 text-slate-950'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-950/80 backdrop-blur-md text-slate-200 border border-slate-700">
                      {course.category || 'General'}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-100 text-sm line-clamp-2 leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {course.description || 'No course description provided.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                    <Link
                      to={`/instructor/courses/${course.id}/learners`}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5 text-indigo-400" /> Learners
                    </Link>

                    <Link
                      to={`/instructor/courses/${course.id}/edit`}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" /> Curriculum
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Course Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100">Create New Course Draft</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-200 text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Course Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Modern Web Architecture with Cloudflare"
                    className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Cloud Engineering"
                    className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Short Description</label>
                  <textarea
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Brief overview of course outcomes..."
                    className="w-full px-3.5 py-2 bg-slate-900/60 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    {isCreating ? 'Creating Draft...' : 'Create & Open Editor'}
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
