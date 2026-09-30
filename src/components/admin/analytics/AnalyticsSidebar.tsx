import { Link } from 'react-router-dom'
import { Activity, BarChart3, Users, Target, Cloud, LogOut, BookOpen, Award } from 'lucide-react'
import type { UserProfile } from '@/stores/auth'
import type { PlatformAnalyticsData } from './types'

interface AnalyticsSidebarProps {
  user: UserProfile | null
  cf: PlatformAnalyticsData['cloudflare'] | undefined
  onSignOut: () => void
  onOpenCfSetup: () => void
}

export default function AnalyticsSidebar({ user, cf, onSignOut, onOpenCfSetup }: AnalyticsSidebarProps) {
  // 1. Left Sidebar Navigation
  return (
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
                onClick={onOpenCfSetup}
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
            onClick={onSignOut}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
