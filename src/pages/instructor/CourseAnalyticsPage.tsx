import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  Mail,
  UserPlus,
} from 'lucide-react'

interface LearnerRosterItem {
  userId: string
  name: string
  email: string
  avatarUrl: string | null
  enrolledAt: string
  completedAt: string | null
  completedLessons: number
  totalLessons: number
  progressPct: number
}

interface CourseRosterResponse {
  course: {
    id: string
    title: string
    totalLessons: number
  }
  learners: LearnerRosterItem[]
}

export default function CourseAnalyticsPage() {
  const { id: courseId } = useParams<{ id: string }>()

  const [data, setData] = useState<CourseRosterResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)

  // Invite Learner Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!courseId) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.get<CourseRosterResponse>(`/api/courses/${courseId}/learners`)
      setData(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load learner progress roster')
    } finally {
      setIsLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleInviteLearner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseId || !inviteEmail) return
    setIsSending(true)
    setInviteLink(null)
    setSuccessNotice(null)

    try {
      const res = await api.post<{ message: string; invitation: { inviteUrl: string } }>(
        `/api/courses/${courseId}/invite-learner`,
        { email: inviteEmail }
      )
      setInviteLink(res.invitation.inviteUrl)
      setSuccessNotice(`Invitation dispatched to ${inviteEmail}!`)
      setInviteEmail('')
      fetchData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
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
              {data?.course.title}
            </h1>
            <span className="text-[11px] text-slate-400">Learner Progress Tracking & Rosters</span>
          </div>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all"
        >
          <UserPlus className="w-4 h-4" /> Invite Learner
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6">
        {successNotice && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#1E293B]/70 border border-slate-800/80">
            <span className="text-xs font-medium text-slate-400">Enrolled Learners</span>
            <p className="text-2xl font-bold text-slate-100 mt-2">{data?.learners.length || 0}</p>
            <p className="text-xs text-slate-400 mt-1">Total active participants</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#1E293B]/70 border border-slate-800/80">
            <span className="text-xs font-medium text-slate-400">Total Curriculum Lessons</span>
            <p className="text-2xl font-bold text-slate-100 mt-2">{data?.course.totalLessons || 0}</p>
            <p className="text-xs text-slate-400 mt-1">Required for completion</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#1E293B]/70 border border-slate-800/80">
            <span className="text-xs font-medium text-slate-400">Completed Course</span>
            <p className="text-2xl font-bold text-emerald-400 mt-2">
              {data?.learners.filter(l => l.progressPct === 100).length || 0}
            </p>
            <p className="text-xs text-slate-400 mt-1">Learners at 100% completion</p>
          </div>
        </div>

        {/* Learners Table */}
        <div className="rounded-2xl bg-[#1E293B]/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" /> Learner Progress Roster
            </h3>
            <span className="text-xs text-slate-400">
              {data?.learners.length || 0} Students Enrolled
            </span>
          </div>

          {!data?.learners || data.learners.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <p>No learners enrolled in this course yet.</p>
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="mt-3 text-xs text-indigo-400 hover:underline"
              >
                Send an invitation to a student
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Learner</th>
                    <th className="px-6 py-4">Enrolled Date</th>
                    <th className="px-6 py-4">Completed Lessons</th>
                    <th className="px-6 py-4">Progression</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {data.learners.map(learner => (
                    <tr key={learner.userId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-100">{learner.name}</div>
                        <div className="text-slate-400 text-[11px]">{learner.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(learner.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-200">
                        {learner.completedLessons} / {learner.totalLessons} lessons
                      </td>
                      <td className="px-6 py-4 w-48">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div
                              className={`h-full rounded-full transition-all ${
                                learner.progressPct === 100
                                  ? 'bg-emerald-500'
                                  : 'bg-indigo-500'
                              }`}
                              style={{ width: `${learner.progressPct}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-200 w-9 text-right">
                            {learner.progressPct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {learner.progressPct === 100 ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1 w-max">
                            <Clock className="w-3 h-3" /> In Progress
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Invite Learner Modal */}
        {isInviteModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400" /> Invite Learner to Course
                </h3>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="text-slate-400 hover:text-slate-200 text-sm"
                >
                  ✕
                </button>
              </div>

              {inviteLink && (
                <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-1.5">
                  <span className="text-xs font-semibold text-indigo-300">Invite Link Generated:</span>
                  <p className="text-[11px] font-mono text-slate-300 break-all bg-slate-900/60 p-2 rounded border border-slate-800">
                    {inviteLink}
                  </p>
                </div>
              )}

              <form onSubmit={handleInviteLearner} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Learner Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {isSending ? 'Sending...' : 'Send Invitation'}
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
