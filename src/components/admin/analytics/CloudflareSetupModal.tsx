import { Cloud, Key } from 'lucide-react'

interface CloudflareSetupModalProps {
  onClose: () => void
}

export default function CloudflareSetupModal({ onClose }: CloudflareSetupModalProps) {
  return (
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
            onClick={onClose}
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
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-slate-800"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  )
}
