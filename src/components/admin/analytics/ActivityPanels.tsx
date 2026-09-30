import type { PlatformAnalyticsData } from './types'

interface ActivityPanelsProps {
  data: PlatformAnalyticsData | null
  cf: PlatformAnalyticsData['cloudflare'] | undefined
}

export default function ActivityPanels({ data, cf }: ActivityPanelsProps) {
  return (
    <>
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
    </>
  )
}
