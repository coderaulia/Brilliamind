import type { PlatformAnalyticsData } from './types'

interface DiagnosticsGridProps {
  data: PlatformAnalyticsData | null
}

export default function DiagnosticsGrid({ data }: DiagnosticsGridProps) {
  // 3-Column Diagnostic Grid: Conversion funnel, Traffic sources, Errors
  return (
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
  )
}
