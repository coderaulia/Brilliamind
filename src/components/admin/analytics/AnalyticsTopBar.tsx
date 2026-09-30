import { LogOut } from 'lucide-react'
import type { UserProfile } from '@/stores/auth'

interface AnalyticsTopBarProps {
  user: UserProfile | null
  lang: 'EN' | 'ID'
  setLang: (lang: 'EN' | 'ID') => void
  onSignOut: () => void
}

export default function AnalyticsTopBar({ user, lang, setLang, onSignOut }: AnalyticsTopBarProps) {
  // Top Header Bar
  return (
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
          onClick={onSignOut}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  )
}
