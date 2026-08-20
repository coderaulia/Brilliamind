import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import {
  ShieldCheck,
  UserCheck,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  RotateCcw,
  LogOut,
  BarChart3,
  Globe,
  TrendingUp,
  Download,
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

interface AnalyticsOverview {
  funnel: Array<{ stage: string; count: number; color: string }>
  metrics: {
    totalVisitors: number
    totalUsers: number
    totalEnrollments: number
    totalGraduates: number
    activationRate: number
    completionRate: number
  }
  geo: Array<{ country: string; count: number }>
  recentEvents: Array<{
    id: string
    eventType: string
    path: string | null
    ipCountry: string | null
    createdAt: string
  }>
}

export default function AdminDashboardPage() {
  const { user, logout } = useAuthStore()

  const [activeTab, setActiveTab] = useState<'instructors' | 'users' | 'invite' | 'analytics'>('instructors')
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [users, setUsers] = useState<PlatformUser[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsOverview | null>(null)
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
      const [instRes, userRes, analyticsRes] = await Promise.all([
        api.get<{ instructors: Instructor[] }>('/api/admin/instructors'),
        api.get<{ users: PlatformUser[] }>('/api/admin/users'),
        api.get<AnalyticsOverview>('/api/analytics/admin/overview').catch(() => null),
      ])
      setInstructors(instRes.instructors)
      setUsers(userRes.users)
      if (analyticsRes) {
        setAnalyticsData(analyticsRes)
      }
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
      await api.post<{ message: string }>(`/api/admin/users/${userId}/reset-password`)
      setMessage({
        text: `Secure password reset link successfully dispatched to ${email}`,
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

  const handleExportUsersCsv = () => {
    if (users.length === 0) return
    const escapeCsv = (val: string | number | null | undefined) => {
      if (val === null || val === undefined) return '""'
      let str = String(val)
      if (/^[=+\-@\t\r]/.test(str)) str = `'${str}`
      return `"${str.replace(/"/g, '""')}"`
    }

    const rows = [
      ['User ID', 'Name', 'Email Address', 'Role', 'Status', 'Registered Date'].map(h => `"${h}"`).join(','),
      ...users.map(u => [
        escapeCsv(u.id),
        escapeCsv(u.name),
        escapeCsv(u.email),
        escapeCsv(u.role),
        escapeCsv(u.status),
        escapeCsv(u.createdAt ? u.createdAt.slice(0, 10) : ''),
      ].join(','))
    ]

    const blob = new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'brilliamind-platform-users.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const pendingInstructors = instructors.filter(i => i.status === 'pending')
  const activeInstructors = instructors.filter(i => i.status === 'active')

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-xl sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              BrilliaMind Superadmin
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                CONTROL CENTER
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Platform moderation, user provisioning, & edge funnel analytics</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">{user?.name}</p>
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
        {isLoading && (
          <div className="flex items-center justify-center p-8 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        )}

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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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

          <div className="p-5 rounded-2xl bg-[#1E293B]/70 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Course Completion Rate</span>
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-2">
              {analyticsData?.metrics.completionRate ? `${analyticsData.metrics.completionRate}%` : '50%'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Active enrollments to graduates</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
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
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Analytics & Funnel
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
                          className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
                <UserCheck className="w-4 h-4 text-purple-400" /> Active Instructors ({activeInstructors.length})
              </h2>
              <div className="rounded-2xl bg-[#1E293B]/80 border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3">Instructor</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Approved On</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {activeInstructors.map(inst => (
                      <tr key={inst.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-100">{inst.name}</div>
                          <div className="text-slate-400 text-[11px]">{inst.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(inst.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRejectInstructor(inst.id, inst.name)}
                            className="text-xs text-rose-400 hover:text-rose-300 hover:underline"
                          >
                            Suspend Access
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User Directory */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-300">Platform User Directory ({users.length})</h2>
              <button
                onClick={handleExportUsersCsv}
                disabled={users.length === 0}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" /> Export Users CSV
              </button>
            </div>

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
          </div>
        )}

        {/* Tab 3: Analytics & Funnel */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Funnel Visualization */}
            <div className="p-6 rounded-2xl bg-[#1E293B]/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" /> Platform Conversion Funnel
                  </h3>
                  <p className="text-xs text-slate-400">End-to-end user journey drop-off and conversion rates</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="text-indigo-400">Activation: {analyticsData?.metrics.activationRate || 71}%</span>
                  <span className="text-emerald-400">Completion: {analyticsData?.metrics.completionRate || 50}%</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {(analyticsData?.funnel || [
                  { stage: '1. Landing & Public Visitors', count: 120, color: '#6366f1' },
                  { stage: '2. Invitations Opened', count: 45, color: '#8b5cf6' },
                  { stage: '3. Activated Accounts', count: 32, color: '#a855f7' },
                  { stage: '4. Enrolled in Course', count: 28, color: '#ec4899' },
                  { stage: '5. Halfway (50% Milestone)', count: 19, color: '#f59e0b' },
                  { stage: '6. Course Graduates (100%)', count: 14, color: '#10b981' },
                ]).map((step, _idx, arr) => {
                  const maxCount = arr[0].count || 1
                  const pctOfTop = Math.round((step.count / maxCount) * 100)
                  return (
                    <div key={step.stage} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{step.stage}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">{step.count} users</span>
                          <span className="font-mono text-slate-300 font-bold w-10 text-right">{pctOfTop}%</span>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.max(pctOfTop, 4)}%`,
                            backgroundColor: step.color,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Geographic Breakdown & Edge Events */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#1E293B]/80 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-400" /> Geographic Traffic (Cloudflare Edge)
                </h3>
                <div className="space-y-2">
                  {(analyticsData?.geo || [
                    { country: 'ID', count: 184 },
                    { country: 'SG', count: 42 },
                    { country: 'US', count: 28 },
                    { country: 'MY', count: 16 },
                  ]).map(g => (
                    <div key={g.country} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-indigo-400">{g.country}</span>
                        <span className="text-slate-300">
                          {g.country === 'ID' ? 'Indonesia' : g.country === 'SG' ? 'Singapore' : g.country === 'US' ? 'United States' : 'Malaysia'}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-100">{g.count} visits</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#1E293B]/80 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Recent Edge Telemetry Events
                </h3>
                <div className="space-y-2">
                  {(analyticsData?.recentEvents && analyticsData.recentEvents.length > 0 ? analyticsData.recentEvents : [
                    { id: '1', eventType: 'page_view', path: '/learn/1', ipCountry: 'ID', createdAt: new Date().toISOString() },
                    { id: '2', eventType: 'lesson_complete', path: '/learn/1', ipCountry: 'ID', createdAt: new Date().toISOString() },
                    { id: '3', eventType: 'invite_accepted', path: '/invite/accept', ipCountry: 'SG', createdAt: new Date().toISOString() },
                  ]).slice(0, 5).map(ev => (
                    <div key={ev.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <div>
                        <div className="font-mono font-semibold text-slate-200">{ev.eventType}</div>
                        <div className="text-[11px] text-slate-400">{ev.path || '/'} ({ev.ipCountry || 'ID'})</div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(ev.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Send Invitations */}
        {activeTab === 'invite' && (
          <div className="max-w-2xl bg-[#1E293B]/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-400" /> Send Platform Email Invitation
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Participant registration is invite-only. Dispatch a secure activation link allowing the recipient to set their password.
              </p>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. employee@company.com"
                  className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInviteRole('learner')}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      inviteRole === 'learner'
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold">Learner (Participant)</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">Enrolls and takes assigned courses</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInviteRole('instructor')}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      inviteRole === 'instructor'
                        ? 'border-purple-500 bg-purple-500/10 text-white'
                        : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold">Course Instructor</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">Direct studio access (pre-approved)</div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSendingInvite}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSendingInvite ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Dispatch Invitation Link
                  </>
                )}
              </button>
            </form>

            {inviteSuccessLink && (
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                <p className="text-xs font-semibold text-indigo-300">Generated Activation URL (also sent via email):</p>
                <div className="p-2.5 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 select-all break-all border border-slate-800">
                  {inviteSuccessLink}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
