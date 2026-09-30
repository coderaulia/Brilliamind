import { CreditCard } from 'lucide-react'
import type { PlatformAnalyticsData } from './types'

interface BusinessSummaryGridProps {
  data: PlatformAnalyticsData | null
}

export default function BusinessSummaryGrid({ data }: BusinessSummaryGridProps) {
  const topCertified = [...(data?.coursesAndLearning.popularCourses ?? [])]
    .filter((c) => c.completedCount > 0)
    .sort((a, b) => b.completedCount - a.completedCount)
    .slice(0, 2)
  const certifiedMax = Math.max(topCertified[0]?.completedCount ?? 0, 1)

  // Bottom Grid: Users and sessions, Assessments, Transactions
  return (
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
              {data?.usersAndSessions.admins ?? '—'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium">Instructors</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">
              {data?.usersAndSessions.instructors ?? '—'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium">Learners</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">
              {data?.usersAndSessions.learners ?? '—'}
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
              <span className="font-semibold">{data?.usersAndSessions.instructors ?? '—'}</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#0F172A] h-full rounded-full w-[80%]" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-600">
              <span>learners / active</span>
              <span className="font-semibold">{data?.usersAndSessions.learners ?? '—'}</span>
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
            <span className="text-[10px] text-slate-400 font-medium">Attempts</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{data?.coursesAndLearning.quizStats?.totalAttempts ?? '—'}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium">Passed</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{data?.coursesAndLearning.quizStats?.passedAttempts ?? '—'}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium">Avg score</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{data?.coursesAndLearning.quizStats?.avgScore ?? '—'}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium">Released</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">
              {data?.coursesAndLearning.certificatesReleased ?? '—'}
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          {topCertified.map((course) => (
            <div key={course.id} className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600">
                <span className="truncate pr-2">{course.title}</span>
                <span className="font-semibold">{course.completedCount}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#0F172A] h-full rounded-full"
                  style={{ width: `${Math.round((course.completedCount / certifiedMax) * 100)}%` }}
                />
              </div>
            </div>
          ))}
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
  )
}
