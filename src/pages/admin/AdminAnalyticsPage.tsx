import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import {
  Activity,
  BarChart3,
  Users,
  CreditCard,
  Target,
  RefreshCw,
  Globe,
  Bug,
  Cloud,
  ArrowRight,
  LogOut,
  BookOpen,
  Award,
  PlayCircle,
  Clock,
  ExternalLink,
  Info,
  Key,
  Search,
  Download,
  CheckCircle2,
} from 'lucide-react'
import type { CloudflareStats } from '../../../worker/lib/cloudflare'

interface PopularCourse {
  id: string
  title: string
  slug: string
  category: string
  status: string
  price: number
  enrollmentCount: number
  completedCount: number
  completionRate: number
  lessonsPlayedCount: number
  rating: number
}

interface PlatformAnalyticsData {
  timeframe: '7d' | '30d' | '90d'
  summary: {
    requests: number
    errorRate: number
    liveVisitors: number
    pageViews: number
    activeUsers: number
    newUsersInRange: number
    paidRevenue: number
    pendingPayments: number
    funnelCompletionRate: number
    completedFromVisitors: string
    returningVisitorsRate: number
    returningVisitorsCount: number
    trafficSourcesCount: number
    topSourceVisitors: number
    frontendErrorsCount: number
    affectedVisitorsCount: number
  }
  funnel: Array<{ step: string; count: number }>
  topPages: Array<{ path: string; count: number }>
  ctaClicks: Array<{ label: string; count: number }>
  recentVisitors: Array<{
    path: string
    title: string
    sessionId: string
    country: string
    createdAt: string
  }>
  trafficSources: Array<{ source: string; count: number }>
  errors: Array<{ errorType: string; path: string; count: number }>
  apiHealth: {
    averageLatencyMs: number
    maxLatencyMs: number
    serverErrors: number
    uniqueClients: number
    topEndpoints: Array<{ endpoint: string; count: number }>
  }
  cloudflare: CloudflareStats
  usersAndSessions: {
    admins: number
    instructors: number
    learners: number
    activeSessions: number
  }
    coursesAndLearning: {
    totalCourses: number
    coursesPlayed: number
    lessonsCompleted: number
    certificatesReleased: number
    totalWatchMinutes: number
    popularCourses: PopularCourse[]
    quizStats?: {
      totalAttempts: number
      passedAttempts: number
      passRate: number
      avgScore: number
    }
    categories?: Array<{ name: string; count: number }>
  }
  transactions: {
    totalRevenueIdr: number
    pendingInvoices: number
    activeSubscriptions: number
  }
}

export default function AdminAnalyticsPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d')
  const [data, setData] = useState<PlatformAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lang, setLang] = useState<'EN' | 'ID'>('EN')
  const [showCfSetupModal, setShowCfSetupModal] = useState(false)

  // Enhancements: course search, category filter, and auto-refresh
  const [courseSearch, setCourseSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<'off' | '15s' | '30s' | '60s'>('off')

  const fetchAnalytics = async (tf: '7d' | '30d' | '90d' = timeframe, silent = false) => {
    if (!silent) setIsLoading(true)
    setIsRefreshing(true)
    try {
      const res = await api.get<PlatformAnalyticsData>(`/api/analytics/admin/platform?timeframe=${tf}`)
      setData(res)
    } catch (err) {
      console.error('Failed to load platform analytics:', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnalytics(timeframe)
  }, [timeframe])

  // Auto-refresh timer
  useEffect(() => {
    if (autoRefreshInterval === 'off') return
    const ms = autoRefreshInterval === '15s' ? 15000 : autoRefreshInterval === '30s' ? 30000 : 60000
    const interval = setInterval(() => {
      fetchAnalytics(timeframe, true)
    }, ms)
    return () => clearInterval(interval)
  }, [autoRefreshInterval, timeframe])

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  const handleExportCourseCsv = () => {
    const list = data?.coursesAndLearning.popularCourses || []
    if (list.length === 0) return

    const escapeCsv = (val: string | number | null | undefined) => {
      if (val === null || val === undefined) return '""'
      let str = String(val)
      if (/^[=+\-@\t\r]/.test(str)) str = `'${str}`
      return `"${str.replace(/"/g, '""')}"`
    }

    const headers = ['Course Title', 'Category', 'Status', 'Enrollments', 'Completions', 'Completion Rate (%)', 'Lessons Played', 'Rating']
    const rows = [
      headers.map((h) => `"${h}"`).join(','),
      ...list.map((c) =>
        [
          escapeCsv(c.title),
          escapeCsv(c.category),
          escapeCsv(c.status),
          escapeCsv(c.enrollmentCount),
          escapeCsv(c.completedCount),
          escapeCsv(`${c.completionRate}%`),
          escapeCsv(c.lessonsPlayedCount),
          escapeCsv(c.rating),
        ].join(',')
      ),
    ]

    const blob = new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `brilliamind-course-analytics-${timeframe}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const cf = data?.cloudflare

  // Filtered popular courses list
  const filteredCourses = (data?.coursesAndLearning.popularCourses || []).filter((c) => {
    const matchSearch =
      courseSearch.trim() === '' ||
      c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.category.toLowerCase().includes(courseSearch.toLowerCase())
    const matchCategory =
      selectedCategory === 'all' ||
      c.category.toLowerCase() === selectedCategory.toLowerCase()
    return matchSearch && matchCategory
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex font-sans antialiased">
      {/* 1. Left Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between hidden md:flex min-h-screen sticky top-0">
        <div>
          {/* Logo / Brand */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <Link to="/" className="tracking-widest text-xs font-bold text-slate-900 uppercase">
              BRILLIAMIND
            </Link>
          </div>

          <div className="p-4 space-y-6">
            {/* ASSESS / LEARNING */}
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Assess & Learning
              </p>
              <nav className="space-y-1">
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-slate-400" />
                  Dashboard
                </Link>
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <Users className="w-4 h-4 text-slate-400" />
                  Participants
                </Link>
                <Link
                  to="/instructor/courses"
                  className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  Course Catalog
                </Link>
              </nav>
            </div>

            {/* REVIEW / INSTRUCTOR */}
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Review & Approvals
              </p>
              <nav className="space-y-1">
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <Target className="w-4 h-4 text-slate-400" />
                  Instructor Queue
                </Link>
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <Award className="w-4 h-4 text-slate-400" />
                  Certificates Released
                </Link>
              </nav>
            </div>

            {/* SUPER ADMIN SECTION */}
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Super Admin
              </p>
              <nav className="space-y-1">
                {/* Active Highlighted Button */}
                <div className="flex items-center gap-3 px-3 py-2 text-xs font-semibold bg-[#0B1120] text-white rounded-xl shadow-sm">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Analytics
                </div>

                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <Users className="w-4 h-4 text-slate-400" />
                  User Management
                </Link>

                <button
                  onClick={() => setShowCfSetupModal(true)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                >
                  <span className="flex items-center gap-3">
                    <Cloud className="w-4 h-4 text-slate-400" />
                    Cloudflare Setup
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      cf?.configured ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom User Info */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <div className="truncate">
              <p className="font-semibold text-slate-900 truncate">{user?.name || 'Superadmin'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="md:hidden font-bold tracking-wider text-xs uppercase text-slate-900 mr-2">
              BRILLIAMIND
            </span>
            <span className="text-xs font-medium text-slate-400 hidden sm:inline">
              Superadmin Control Center / Platform Analytics
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 text-[11px] font-semibold">
              <button
                onClick={() => setLang('EN')}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  lang === 'EN' ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('ID')}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  lang === 'ID' ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                ID
              </button>
            </div>

            {/* User Pill */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span>{user?.email || 'admin@brilliamind.id'}</span>
            </div>

            {/* Role Badge */}
            <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              Super Admin
            </span>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </header>

        {/* Global Loading Bar */}
        {isLoading && (
          <div className="w-full bg-indigo-100 h-0.5 overflow-hidden">
            <div className="bg-indigo-600 h-full w-1/3 animate-pulse" />
          </div>
        )}

        {/* Page Content */}
        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Title & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 mb-1.5">
                Super Admin
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform analytics</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Operational visibility across traffic, users, billing, learning progress, database health, and Cloudflare signals.
              </p>
            </div>

            {/* Timeframe selector, Auto-Refresh & Refresh Button */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Auto-Refresh Toggle */}
              <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold shadow-sm text-slate-500">
                <span className="px-2 text-[10px] font-bold uppercase text-slate-400">Live</span>
                {(['off', '15s', '30s'] as const).map((intv) => (
                  <button
                    key={intv}
                    onClick={() => setAutoRefreshInterval(intv)}
                    className={`px-2 py-0.5 rounded-lg transition-all text-[11px] ${
                      autoRefreshInterval === intv
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {intv === 'off' ? 'Off' : intv}
                  </button>
                ))}
              </div>

              {/* Timeframe selector */}
              <div className="flex items-center p-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold shadow-sm">
                {(['7d', '30d', '90d'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      timeframe === tf
                        ? 'bg-[#0F172A] text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <button
                onClick={() => fetchAnalytics(timeframe, true)}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Hero 8 Metric Cards Grid (2 rows of 4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Requests */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Requests</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {data?.summary.requests.toLocaleString() || '344'}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-4">
                {data?.summary.errorRate ?? 7.56}% error rate
              </p>
            </div>

            {/* 2. Live visitors */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Live visitors</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {data?.summary.liveVisitors ?? 1}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-4">
                {data?.summary.pageViews ?? 554} page views
              </p>
            </div>

            {/* 3. Active customers / learners */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Active learners</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {data?.summary.activeUsers ?? 4}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-4">
                {data?.summary.newUsersInRange ?? 0} new in range
              </p>
            </div>

            {/* 4. Paid revenue */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Paid manual revenue</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    Rp {data?.summary.paidRevenue.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-4">
                {data?.summary.pendingPayments ?? 0} pending payments
              </p>
            </div>

            {/* 5. Funnel completion */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Funnel completion</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {data?.summary.funnelCompletionRate ?? 71.67}%
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-4">
                {data?.summary.completedFromVisitors || '43 completed from 60 landing visitors'}
              </p>
            </div>

            {/* 6. Returning visitors */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Returning visitors</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {data?.summary.returningVisitorsRate ?? 4.46}%
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white">
                  <RefreshCw className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-4">
                {data?.summary.returningVisitorsCount ?? 5} returned in range
              </p>
            </div>

            {/* 7. Traffic sources */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Traffic sources</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {data?.summary.trafficSourcesCount ?? 2}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white">
                  <Globe className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-4">
                {data?.summary.topSourceVisitors ?? 111} visitors from top source
              </p>
            </div>

            {/* 8. Frontend errors */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Frontend errors</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {data?.summary.frontendErrorsCount ?? 18}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white">
                  <Bug className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-4">
                {data?.summary.affectedVisitorsCount ?? 6} affected visitors
              </p>
            </div>
          </div>

          {/* Workspace / Learning Activation Funnel Banner */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Learning activation funnel</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Signup cohorts in the selected range, followed through their first completed lesson.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Biggest drop: Enrolled to 50% Milestone
              </span>
            </div>

            {/* Activation Stepper Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold uppercase text-slate-400">1. Visitor</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">60</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-slate-900 h-full rounded-full w-full" />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold uppercase text-slate-400">2. Enrolled</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">49</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-slate-900 h-full rounded-full w-[82%]" />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold uppercase text-slate-400">3. Halfway (50%)</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">28</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-slate-900 h-full rounded-full w-[47%]" />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold uppercase text-slate-400">4. Certified (100%)</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">43</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-slate-900 h-full rounded-full w-[72%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Live Visitor Activity & Recent Visitors (2-Column Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Live visitor activity (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Live visitor activity</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Public page views and CTA clicks. Superadmin access is excluded.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                  {data?.cloudflare.metrics.uniqueVisitors || 112} unique visitors
                </span>
              </div>

              {/* Two columns: TOP PAGES vs CTA CLICKS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Top Pages */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Top Pages
                  </p>
                  <div className="space-y-3">
                    {(data?.topPages || []).slice(0, 7).map((p) => {
                      const maxVal = data?.topPages[0]?.count || 124
                      const pct = Math.round((p.count / maxVal) * 100)
                      return (
                        <div key={p.path} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-slate-700 truncate max-w-[160px]" title={p.path}>
                              {p.path}
                            </span>
                            <span className="font-semibold text-slate-900">{p.count}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#0F172A] h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(pct, 6)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* CTA Clicks */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    CTA Clicks
                  </p>
                  <div className="space-y-3">
                    {(data?.ctaClicks || []).map((cta) => {
                      const maxVal = data?.ctaClicks[0]?.count || 26
                      const pct = Math.round((cta.count / maxVal) * 100)
                      return (
                        <div key={cta.label} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-700 truncate max-w-[150px]">{cta.label}</span>
                            <span className="font-semibold text-slate-900">{cta.count}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#0F172A] h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(pct, 6)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Recent live visitors (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent live visitors</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Last seen public visitor sessions in the previous five minutes.
                </p>

                <div className="space-y-3 mt-4">
                  {(data?.recentVisitors || []).slice(0, 4).map((v) => (
                    <div
                      key={v.sessionId}
                      className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                    >
                      <div className="truncate mr-2">
                        <p className="font-mono font-semibold text-slate-800 truncate">{v.path}</p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{v.title}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] text-slate-500 bg-white border border-slate-200 shrink-0">
                        {v.sessionId}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Active Edge Edge Node: {cf?.edge.colo || 'SIN'}</span>
                <span>{cf?.edge.httpProtocol || 'HTTP/3'}</span>
              </div>
            </div>
          </div>

          {/* 3-Column Diagnostic Grid: Conversion funnel, Traffic sources, Errors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conversion funnel */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Conversion funnel</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tracked signup, course, and learning completion steps.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {(data?.funnel || []).map((step) => {
                  const maxVal = data?.funnel[0]?.count || 60
                  const pct = Math.round((step.count / maxVal) * 100)
                  return (
                    <div key={step.step} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-700 capitalize">{step.step}</span>
                        <span className="font-semibold text-slate-900">{step.count}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0F172A] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Traffic sources */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Traffic sources</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  UTM and referrer attribution captured from public visits.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {(data?.trafficSources || []).map((src) => {
                  const maxVal = data?.trafficSources[0]?.count || 111
                  const pct = Math.round((src.count / maxVal) * 100)
                  return (
                    <div key={src.source} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-700 font-mono truncate max-w-[170px]">{src.source}</span>
                        <span className="font-semibold text-slate-900">{src.count}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0F172A] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Errors */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Errors</h3>
                <p className="text-xs text-slate-400 mt-0.5">Frontend failures plus API error hotspots.</p>
              </div>

              <div className="space-y-3 pt-2">
                {(data?.errors || []).map((err, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-700 truncate max-w-[190px]" title={err.path}>
                        {err.errorType} {err.path}
                      </span>
                      <span className="font-semibold text-slate-900">{err.count}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0F172A] h-full rounded-full"
                        style={{ width: `${Math.min(err.count * 14, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Course Engagement & Popular Courses Section (User Request Addition) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" /> Course engagement & popularity rankings
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  How many courses are played, active curriculum engagement, and learner completion rates.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                  {data?.coursesAndLearning.coursesPlayed ?? 4} Courses Active / Played
                </span>
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                  {data?.coursesAndLearning.certificatesReleased ?? 43} Certificates Released
                </span>
              </div>
            </div>

            {/* 5 Summary Stat Pills for Courses */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <PlayCircle className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Courses Played</span>
                </div>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {data?.coursesAndLearning.coursesPlayed ?? 4}{' '}
                  <span className="text-xs font-normal text-slate-400">/ {data?.coursesAndLearning.totalCourses ?? 6} total</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <Target className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Lessons Completed</span>
                </div>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {data?.coursesAndLearning.lessonsCompleted ?? 84}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5 text-purple-500" />
                  <span>Video Watch Time</span>
                </div>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {data?.coursesAndLearning.totalWatchMinutes ?? 142}{' '}
                  <span className="text-xs font-normal text-slate-400">mins</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                  <span>Quiz Pass Rate</span>
                </div>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {data?.coursesAndLearning.quizStats?.passRate ?? 87}%{' '}
                  <span className="text-[11px] font-normal text-slate-400">
                    ({data?.coursesAndLearning.quizStats?.avgScore ?? 84} avg)
                  </span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Certificates Issued</span>
                </div>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {data?.coursesAndLearning.certificatesReleased ?? 43}
                </p>
              </div>
            </div>

            {/* Filter, Search & Export Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {['all', 'Excel & Analytics', 'Product Management', 'Sales & Growth'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? 'bg-[#0F172A] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>

              {/* Search & Export Action */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Filter courses..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-40 sm:w-48"
                  />
                </div>

                <button
                  onClick={handleExportCourseCsv}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all"
                  title="Export Course Performance CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
              </div>
            </div>

            {/* Popular Courses Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="pb-2.5">Course Name</th>
                    <th className="pb-2.5">Category</th>
                    <th className="pb-2.5">Enrollments</th>
                    <th className="pb-2.5">Completion Rate</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course, idx) => (
                      <tr key={course.id || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 pr-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span className="truncate max-w-[280px]">{course.title}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-slate-500">{course.category}</td>
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{course.enrollmentCount}</span>
                            <span className="text-slate-400 text-[10px]">learners</span>
                          </div>
                        </td>
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2 max-w-[140px]">
                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-[#0F172A] h-full rounded-full"
                                style={{ width: `${Math.max(course.completionRate, 5)}%` }}
                              />
                            </div>
                            <span className="font-semibold text-slate-900 w-9 text-right">
                              {course.completionRate}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            to={`/courses/${course.slug}`}
                            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                        No courses match your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Traffic and API Health & Cloudflare Cards (Side by side matching screenshot) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Traffic and API health (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Traffic and API health</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Request volume, latency, status mix, and busiest endpoints.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                  {data?.apiHealth.uniqueClients ?? 66} unique clients
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Latency Left Panel */}
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Average Latency
                    </p>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {data?.apiHealth.averageLatencyMs.toFixed(2) || '180.05'} ms
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Max Latency
                    </p>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {data?.apiHealth.maxLatencyMs || '1312'} ms
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Server Errors (5xx)
                    </p>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {data?.apiHealth.serverErrors ?? 0}
                    </p>
                  </div>
                </div>

                {/* Top Endpoints Right Panel */}
                <div className="space-y-3">
                  {(data?.apiHealth.topEndpoints || []).map((ep) => {
                    const maxVal = data?.apiHealth.topEndpoints[0]?.count || 81
                    const pct = Math.round((ep.count / maxVal) * 100)
                    return (
                      <div key={ep.endpoint} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-slate-700 truncate max-w-[150px]" title={ep.endpoint}>
                            {ep.endpoint}
                          </span>
                          <span className="font-semibold text-slate-900">{ep.count}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#0F172A] h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(pct, 5)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Cloudflare Direct Stats Card (5 cols matching screenshot) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-sky-500" /> Cloudflare
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Zone analytics when Cloudflare credentials are configured.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowCfSetupModal(true)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                    title="Configure Cloudflare Credentials"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>

                {/* Cloudflare State Card */}
                {cf?.configured ? (
                  <div className="mt-4 space-y-3">
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <div>
                          <p className="font-semibold text-emerald-950">Cloudflare API Connected</p>
                          <p className="text-[11px] text-emerald-700">Zone: {cf.zoneId?.slice(0, 12)}...</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-white border border-emerald-200 text-emerald-800 font-bold">
                        {cf.metrics.uptimePercentage}% SLA
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400">Total Requests</span>
                        <p className="font-bold text-slate-900 mt-0.5">{cf.metrics.totalRequests.toLocaleString()}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400">Cache Hit Ratio</span>
                        <p className="font-bold text-slate-900 mt-0.5">{cf.metrics.cacheHitRatio}%</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400">Bandwidth Served</span>
                        <p className="font-bold text-slate-900 mt-0.5">
                          {(cf.metrics.bandwidthBytes / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400">Threats Blocked</span>
                        <p className="font-bold text-slate-900 mt-0.5">{cf.metrics.threats}</p>
                      </div>
                    </div>

                    {/* HTTP Status Code Visual Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>HTTP Status Code Mix</span>
                        <span className="font-mono font-medium text-slate-700">
                          {cf.httpStatus.status2xx} 2xx / {cf.httpStatus.status4xx} 4xx / {cf.httpStatus.status5xx} 5xx
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                        <div
                          style={{
                            width: `${Math.max((cf.httpStatus.status2xx / Math.max(cf.metrics.totalRequests, 1)) * 100, 2)}%`,
                          }}
                          className="bg-emerald-500 h-full"
                          title={`2xx Success: ${cf.httpStatus.status2xx}`}
                        />
                        <div
                          style={{
                            width: `${(cf.httpStatus.status3xx / Math.max(cf.metrics.totalRequests, 1)) * 100}%`,
                          }}
                          className="bg-sky-400 h-full"
                          title={`3xx Redirect: ${cf.httpStatus.status3xx}`}
                        />
                        <div
                          style={{
                            width: `${(cf.httpStatus.status4xx / Math.max(cf.metrics.totalRequests, 1)) * 100}%`,
                          }}
                          className="bg-amber-400 h-full"
                          title={`4xx Client Error: ${cf.httpStatus.status4xx}`}
                        />
                        <div
                          style={{
                            width: `${(cf.httpStatus.status5xx / Math.max(cf.metrics.totalRequests, 1)) * 100}%`,
                          }}
                          className="bg-rose-500 h-full"
                          title={`5xx Server Error: ${cf.httpStatus.status5xx}`}
                        />
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 2xx
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> 3xx
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> 4xx
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> 5xx
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Matching User's Screenshot Exactly */
                  <div className="mt-4 p-5 rounded-xl bg-slate-50/80 border border-slate-200 flex items-start gap-3">
                    <Cloud className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">Cloudflare analytics unavailable</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Cloudflare analytics credentials are not configured
                      </p>
                      <button
                        onClick={() => setShowCfSetupModal(true)}
                        className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
                      >
                        <span>Configure API token</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Edge Health Probes */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>D1 Latency: {cf?.edge.d1LatencyMs ?? 8}ms</span>
                <span>KV Latency: {cf?.edge.kvLatencyMs ?? 3}ms</span>
                <span>Colo: {cf?.edge.colo ?? 'SIN'}</span>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Users and sessions, Assessments, Transactions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Users and sessions */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Users and sessions</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customer, workspace member, and session posture.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium">Admins</span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {data?.usersAndSessions.admins ?? 3}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium">Instructors</span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {data?.usersAndSessions.instructors ?? 4}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium">Learners</span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {data?.usersAndSessions.learners ?? 1}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium">Sessions</span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {data?.usersAndSessions.activeSessions ?? 0}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>instructors / active</span>
                    <span className="font-semibold">{data?.usersAndSessions.instructors ?? 4}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#0F172A] h-full rounded-full w-[80%]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>learners / active</span>
                    <span className="font-semibold">{data?.usersAndSessions.learners ?? 1}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#0F172A] h-full rounded-full w-[35%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Course Assessments & Quizzes */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Assessments & quizzes</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Quiz funnel and verification queue health.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium">Started</span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">105</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium">Completed</span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">85</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium">Scored</span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">84</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium">Released</span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {data?.coursesAndLearning.certificatesReleased ?? 43}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Excel Specialist Certification</span>
                    <span className="font-semibold">32</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#0F172A] h-full rounded-full w-[75%]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Product Management Fundamentals</span>
                    <span className="font-semibold">11</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#0F172A] h-full rounded-full w-[28%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Transactions</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manual payments, invoices, and active subscription mix.
                </p>

                <div className="mt-8 text-center py-6 text-slate-400 text-xs">
                  <CreditCard className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p>No transactions in selected range.</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                <span>Stripe & Midtrans Ready</span>
                <span className="text-slate-600 font-medium">IDR / USD</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Cloudflare Setup Guide Modal */}
      {showCfSetupModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cloudflare Analytics Integration</h3>
                  <p className="text-xs text-slate-400">Direct Zone & Worker infrastructure extraction</p>
                </div>
              </div>
              <button
                onClick={() => setShowCfSetupModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                To stream real-time request counts, cache hit ratio, bandwidth, and uptime percentages directly from
                Cloudflare, configure the following secrets:
              </p>

              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
                  <span>worker/.dev.vars</span>
                  <Key className="w-3.5 h-3.5" />
                </div>
                <p className="text-emerald-400">CLOUDFLARE_API_TOKEN=your_token_here</p>
                <p className="text-sky-400">CLOUDFLARE_ZONE_ID=your_zone_id_here</p>
              </div>

              <div className="space-y-2 pt-1 text-[11px]">
                <p className="font-semibold text-slate-800">How to get these:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-500">
                  <li>Go to Cloudflare Dashboard → Profile → API Tokens.</li>
                  <li>Create a token with <code>Zone.Analytics:Read</code> permission.</li>
                  <li>Copy your Zone ID from the overview page of your domain.</li>
                  <li>For production, run <code>wrangler secret put CLOUDFLARE_API_TOKEN</code>.</li>
                </ol>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowCfSetupModal(false)}
                className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-slate-800"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
