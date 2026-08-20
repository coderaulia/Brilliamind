import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ShieldCheck, ChevronRight } from 'lucide-react'

interface PublicPageWrapperProps {
  title: string
  subtitle?: string
  badge?: string
  lastUpdated?: string
  children: React.ReactNode
}

export default function PublicPageWrapper({
  title,
  subtitle,
  badge = 'Compliance & Transparency',
  lastUpdated = 'August 20, 2026',
  children,
}: PublicPageWrapperProps) {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0A0F1E]/80 backdrop-blur-xl px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              BrilliaMind
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <Link to="/faq" className="hover:text-white transition-colors">
              FAQ & Help
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/data-safety" className="hover:text-white transition-colors">
              Data Safety & Security
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/onboarding"
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-3.5 py-1.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all"
            >
              Get Started <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="border-b border-slate-800/80 bg-gradient-to-b from-[#111827] to-[#0A0F1E] py-14 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            {badge}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
          <p className="text-[11px] text-slate-400 font-mono pt-1">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 lg:px-8 py-12">
        <div className="prose prose-invert prose-indigo max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#070D1A] py-12 px-6 lg:px-12 text-slate-400 text-xs mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                B
              </div>
              <span className="font-bold text-white text-sm">BrilliaMind LMS</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Enterprise-grade serverless learning operating system designed for modern digital teams and institutions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/onboarding" className="hover:text-indigo-400 transition-colors">Onboarding Wizard</Link></li>
              <li><Link to="/register/instructor" className="hover:text-indigo-400 transition-colors">Become an Instructor</Link></li>
              <li><Link to="/login" className="hover:text-indigo-400 transition-colors">Member Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">Support & Help</h4>
            <ul className="space-y-2">
              <li><Link to="/faq" className="hover:text-indigo-400 transition-colors">FAQ & Support</Link></li>
              <li><Link to="/data-safety" className="hover:text-indigo-400 transition-colors">Data Safety & Security</Link></li>
              <li><a href="mailto:support@brilliamind.id" className="hover:text-indigo-400 transition-colors">Contact Engineering</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/data-safety" className="hover:text-indigo-400 transition-colors">PDP & GDPR Compliance</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 Vanaila Digital (BrilliaMind.id). All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-400">Cloudflare Edge Operational</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
