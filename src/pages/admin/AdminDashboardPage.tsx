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
  LogOut,
  BarChart3,
} from 'lucide-react'
import type { Instructor, PlatformUser, AnalyticsOverview } from '@/components/admin/types'
import AdminInstructorsTab from '@/components/admin/AdminInstructorsTab'
import AdminUsersTab from '@/components/admin/AdminUsersTab'
import AdminAnalyticsTab from '@/components/admin/AdminAnalyticsTab'
import AdminInviteTab from '@/components/admin/AdminInviteTab'

export default function AdminDashboardPage() {
  const { user, logout } = useAuthStore()

  const [activeTab, setActiveTab] = useState<'instructors' | 'users' | 'invite' | 'analytics'>('instructors')
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [users, setUsers] = useState<PlatformUser[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

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

  const handleSendInvite = async (email: string, role: 'learner' | 'instructor') => {
    setMessage(null)
    try {
      const res = await api.post<{ message: string; invitation: { inviteUrl: string } }>('/api/admin/invite-user', {
        email,
        role,
      })
      setMessage({ text: `Invitation sent to ${email}`, type: 'success' })
      fetchData()
      return res.invitation.inviteUrl
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : 'Failed to send invitation', type: 'error' })
      return undefined
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
      ['User ID', 'Name', 'Email Address', 'Role', 'Status', 'Registered Date'].map((h) => `"${h}"`).join(','),
      ...users.map((u) =>
        [
          escapeCsv(u.id),
          escapeCsv(u.name),
          escapeCsv(u.email),
          escapeCsv(u.role),
          escapeCsv(u.status),
          escapeCsv(u.createdAt ? u.createdAt.slice(0, 10) : ''),
        ].join(',')
      ),
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

  const pendingInstructors = instructors.filter((i) => i.status === 'pending')
  const activeInstructors = instructors.filter((i) => i.status === 'active')

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
          <div
            className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 shrink-0" />
            )}
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
            <span className="text-[11px] text-amber-400 font-medium">Requires review</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#1E293B]/70 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Active Instructors</span>
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <UserCheck className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-100 mt-2">{activeInstructors.length}</p>
            <span className="text-[11px] text-slate-400">Approved creators</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#1E293B]/70 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Platform Users</span>
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-100 mt-2">{users.length}</p>
            <span className="text-[11px] text-slate-400">Total registered</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#1E293B]/70 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Course Graduates</span>
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-100 mt-2">{analyticsData?.metrics.totalGraduates ?? 14}</p>
            <span className="text-[11px] text-emerald-400 font-medium">100% completed</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 pb-2 space-x-2">
          <button
            onClick={() => setActiveTab('instructors')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'instructors'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Instructor Approvals{' '}
            {pendingInstructors.length > 0 && (
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
          <AdminInstructorsTab
            instructors={instructors}
            onApprove={handleApproveInstructor}
            onReject={handleRejectInstructor}
          />
        )}

        {/* Tab 2: User Directory */}
        {activeTab === 'users' && (
          <AdminUsersTab
            users={users}
            onExportCsv={handleExportUsersCsv}
            onResetPassword={handleTriggerResetPassword}
          />
        )}

        {/* Tab 3: Analytics & Funnel */}
        {activeTab === 'analytics' && <AdminAnalyticsTab analyticsData={analyticsData} />}

        {/* Tab 4: Send Invitations */}
        {activeTab === 'invite' && <AdminInviteTab onSendInvite={handleSendInvite} />}
      </main>
    </div>
  )
}
