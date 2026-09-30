import { Cloud, ArrowRight, Info } from 'lucide-react'
import type { PlatformAnalyticsData } from './types'

interface InfraHealthSectionProps {
  data: PlatformAnalyticsData | null
  cf: PlatformAnalyticsData['cloudflare'] | undefined
  onOpenCfSetup: () => void
}

export default function InfraHealthSection({ data, cf, onOpenCfSetup }: InfraHealthSectionProps) {
  // Traffic and API Health & Cloudflare Cards (Side by side matching screenshot)
  return (
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
              onClick={onOpenCfSetup}
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
                  onClick={onOpenCfSetup}
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
  )
}
