import { Activity, BarChart3, Users, CreditCard, Target, RefreshCw, Globe, Bug } from 'lucide-react'
import type { PlatformAnalyticsData } from './types'

interface MetricCardsProps {
  data: PlatformAnalyticsData | null
}

export default function MetricCards({ data }: MetricCardsProps) {
  // Hero 8 Metric Cards Grid (2 rows of 4)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Requests */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Requests</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {data?.summary.requests.toLocaleString() || '—'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-4">
          {data?.summary.errorRate ?? '—'}% error rate
        </p>
      </div>

      {/* 2. Live visitors */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Live visitors</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {data?.summary.liveVisitors ?? '—'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white">
            <BarChart3 className="w-4 h-4" />
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-4">
          {data?.summary.pageViews ?? '—'} page views
        </p>
      </div>

      {/* 3. Active customers / learners */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Active learners</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {data?.summary.activeUsers ?? '—'}
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
              Rp {data?.summary.paidRevenue.toLocaleString() || '—'}
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
              {data?.summary.funnelCompletionRate ?? '—'}%
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-4">
          {data?.summary.completedFromVisitors || '—'}
        </p>
      </div>

      {/* 6. Returning visitors */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Returning visitors</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {data?.summary.returningVisitorsRate ?? '—'}%
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white">
            <RefreshCw className="w-4 h-4" />
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-4">
          {data?.summary.returningVisitorsCount ?? '—'} returned in range
        </p>
      </div>

      {/* 7. Traffic sources */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Traffic sources</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {data?.summary.trafficSourcesCount ?? '—'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white">
            <Globe className="w-4 h-4" />
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-4">
          {data?.summary.topSourceVisitors ?? '—'} visitors from top source
        </p>
      </div>

      {/* 8. Frontend errors */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Frontend errors</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {data?.summary.frontendErrorsCount ?? '—'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white">
            <Bug className="w-4 h-4" />
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-4">
          {data?.summary.affectedVisitorsCount ?? '—'} affected visitors
        </p>
      </div>
    </div>
  )
}
