import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import {
  ShieldCheck,
  UserCheck,
  Users,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  RotateCcw,
  Sparkles,
  Search,
  BookOpen,
  ChevronRight,
  LogOut,
} from 'lucide-react'

interface Instructor {
  id: string
  email: string
  name: string
  role: string
  status: 'pending' | 'active' | 'suspended'
  bio: string | null
  createdAt: string
}

interface PlatformUser {
  id: string
  email: string
  name: string
  role: string
  status: string
  createdAt: string
}

export default function AdminDashboardPage() {
  const { user, logout } = useAuthStore()

  const [activeTab, setActiveTab] = useState<'instructors' | 'users' | 'invite'>('instructors')
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [users, setUsers] = useState<PlatformUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Invite Form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'learner' | 'instructor'>('learner')
  const [inviteSuccessLink, setInviteSuccessLink] = useState<string | null>(null)
  const [isSendingInvite, setIsSendingInvite] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    setMessage(null)
    try {
      const [instRes, userRes] = await Promise.all([
        api.get<{ instructors: Instructor[] }>('/api/admin/instructors'),
        api.get<{ users: PlatformUser[] }>('/api/admin/users'),
      ])
      setInstructors(instRes.instructors)
      setUsers(userRes.users)
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : 'Failed to fetch admin data', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleApproveInstructor = async (id: string, name: string) => {
    try {
      await api.post(`/api/admin/instructors/${id}/approve`)
      setMessage({ text: `Instructor ${name} has been approved!`, type: 'success' })
      fetchData()
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : 'Approval failed', type: 'error' })
    }
  }

  const handleRejectInstructor = async (id: string, name: string) => {
    try {
      await api.post(`/api/admin/instructors/${id}/reject`)
      setMessage({ text: `Instructor ${name} has been suspended`, type: 'success' })
      fetchData()
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : 'Action failed', type: 'error' })
    }
  }

  const handleTriggerResetPassword = async (userId: string, email: string) => {
    try {
      const res = await api.post<{ message: string; resetUrl?: string }>(`/api/admin/users/${userId}/reset-password`)
      setMessage({
        text: `Password reset dispatched to ${email}! ${res.resetUrl ? `(Link: ${res.resetUrl})` : ''}`,
        type: 'success',
      })
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : 'Failed to initiate password reset', type: 'error' })
    }
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSendingInvite(true)
    setInviteSuccessLink(null)
    setMessage(null)

    try {
      const res = await api.post<{ message: string; invitation: { inviteUrl: string } }>('/api/admin/invite-user', {
        email: inviteEmail,
        role: inviteRole,
      })
      setInviteSuccessLink(res.invitation.inviteUrl)
      setMessage({ text: `Invitation sent to ${inviteEmail}`, type: 'success' })
      setInviteEmail('')
      fetchData()
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : 'Failed to send invitation', type: 'error' })
    } finally {
      setIsSendingInvite(false)
    }
  }

  const pendingInstructors = instructors.filter(i => i.status === 'pending')
  const activeInstructors = instructors.filter(i => i.status !== 'pending')

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-xl sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Superadmin Control Center
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Master Admin
              </span>
            </h1>
            <p className="text-xs text-slate-400">Manage instructor approvals, user onboarding, and access control</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-slate-200">{user?.name || 'Administrator'}</p>
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        {message && (
          <div className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#1E293B]/70 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Pending Approvals</span>
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-100 mt-2">{pendingInstructors.length}</p>
            <p className="text-xs text-amber-400/80 mt-1">Instructor applications awaiting review</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#1E293B]/70 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Active Instructors</span>
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <UserCheck className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-100 mt-2">{activeInstructors.length}</p>
            <p className="text-xs text-slate-400 mt-1">Authorized course creators</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#1E293B]/70 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Users</span>
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-100 mt-2">{users.length}</p>
            <p className="text-xs text-slate-400 mt-1">Platform members</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('instructors')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'instructors'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Instructor Approvals {pendingInstructors.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-900 text-xs font-bold">
                {pendingInstructors.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            User Directory
          </button>

          <button
            onClick={() => setActiveTab('invite')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'invite'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Send Invitations
          </button>
        </div>

        {/* Tab 1: Instructor Approvals */}
        {activeTab === 'instructors' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4" /> Pending Applications ({pendingInstructors.length})
              </h2>

              {pendingInstructors.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#1E293B]/40 border border-slate-800 text-slate-400 text-sm">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  All instructor applications have been reviewed. No pending applicants!
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {pendingInstructors.map(inst => (
                    <div key={inst.id} className="p-5 rounded-2xl bg-[#1E293B]/80 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-100">{inst.name}</h3>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            Pending Review
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{inst.email}</p>
                        {inst.bio && (
                          <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 mt-2 italic">
                            "{inst.bio}"
                          </p>
                        )}
                        <p className="text-[10px] text-slate-500">Applied on {new Date(inst.createdAt).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                          onClick={() => handleApproveInstructor(inst.id, inst.name)}
                          className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectInstructor(inst.id, inst.name)}
                          className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Active Instructors ({activeInstructors.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeInstructors.map(inst => (
                  <div key={inst.id} className="p-4 rounded-xl bg-[#1E293B]/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">{inst.name}</h4>
                      <p className="text-xs text-slate-400">{inst.email}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded mt-1 inline-block ${
                        inst.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {inst.status}
                      </span>
                    </div>
                    {inst.status === 'active' ? (
                      <button
                        onClick={() => handleRejectInstructor(inst.id, inst.name)}
                        className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApproveInstructor(inst.id, inst.name)}
                        className="px-3 py-1.5 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User Directory */}
        {activeTab === 'users' && (
          <div className="rounded-2xl bg-[#1E293B]/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-100">{u.name}</div>
                        <div className="text-slate-400 text-[11px]">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          u.role === 'instructor' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-medium ${
                          u.status === 'active' ? 'text-emerald-400' :
                          u.status === 'pending' ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          ● {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleTriggerResetPassword(u.id, u.email)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs inline-flex items-center gap-1.5"
                          title="Send Password Reset Email"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reset Password
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Send Invitations */}
        {activeTab === 'invite' && (
          <div className="max-w-xl mx-auto p-6 md:p-8 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-6">
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-400" /> Dispatch Email Invitation
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Invite participants or instructors. They will receive a link to set up their password.
              </p>
            </div>

            {inviteSuccessLink && (
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-2">
                <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Invitation Generated!
                </div>
                <p className="text-[11px] text-slate-300 break-all bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 font-mono">
                  {inviteSuccessLink}
                </p>
              </div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="learner@company.com"
                  className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Account Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'learner' | 'instructor')}
                  className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                >
                  <option value="learner">Learner (Participant)</option>
                  <option value="instructor">Instructor (Directly Approved)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSendingInvite}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                {isSendingInvite ? 'Sending Invitation...' : 'Send Invitation Link'}
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
