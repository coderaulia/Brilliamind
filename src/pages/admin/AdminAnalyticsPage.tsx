import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { RefreshCw } from 'lucide-react'
import type { PlatformAnalyticsData } from '@/components/admin/analytics/types'
import AnalyticsSidebar from '@/components/admin/analytics/AnalyticsSidebar'
import AnalyticsTopBar from '@/components/admin/analytics/AnalyticsTopBar'
import MetricCards from '@/components/admin/analytics/MetricCards'
import ActivityPanels from '@/components/admin/analytics/ActivityPanels'
import DiagnosticsGrid from '@/components/admin/analytics/DiagnosticsGrid'
import CourseEngagementSection from '@/components/admin/analytics/CourseEngagementSection'
import InfraHealthSection from '@/components/admin/analytics/InfraHealthSection'
import BusinessSummaryGrid from '@/components/admin/analytics/BusinessSummaryGrid'
import CloudflareSetupModal from '@/components/admin/analytics/CloudflareSetupModal'

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

  const fetchAnalytics = useCallback(async (tf: '7d' | '30d' | '90d', silent = false) => {
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
  }, [])

  useEffect(() => {
    fetchAnalytics(timeframe)
  }, [fetchAnalytics, timeframe])

  // Auto-refresh timer
  useEffect(() => {
    if (autoRefreshInterval === 'off') return
    const ms = autoRefreshInterval === '15s' ? 15000 : autoRefreshInterval === '30s' ? 30000 : 60000
    const interval = setInterval(() => {
      fetchAnalytics(timeframe, true)
    }, ms)
    return () => clearInterval(interval)
  }, [autoRefreshInterval, fetchAnalytics, timeframe])

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
      <AnalyticsSidebar user={user} cf={cf} onSignOut={handleSignOut} onOpenCfSetup={() => setShowCfSetupModal(true)} />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AnalyticsTopBar user={user} lang={lang} setLang={setLang} onSignOut={handleSignOut} />


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

          <MetricCards data={data} />
          <ActivityPanels data={data} cf={cf} />
          <DiagnosticsGrid data={data} />
          <CourseEngagementSection
            data={data}
            filteredCourses={filteredCourses}
            courseSearch={courseSearch}
            setCourseSearch={setCourseSearch}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onExportCsv={handleExportCourseCsv}
          />
          <InfraHealthSection data={data} cf={cf} onOpenCfSetup={() => setShowCfSetupModal(true)} />
          <BusinessSummaryGrid data={data} />
        </main>
      </div>

      {/* Cloudflare Setup Guide Modal */}
      {showCfSetupModal && (
        <CloudflareSetupModal onClose={() => setShowCfSetupModal(false)} />
      )}
    </div>
  )
}