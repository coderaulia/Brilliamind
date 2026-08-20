import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { api, ApiError } from '@/lib/api'
import { Sparkles, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, UserCheck, BookOpen } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingNotice, setPendingNotice] = useState<string | null>(null)
  const [seedNotice, setSeedNotice] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setPendingNotice(null)
    setIsLoading(true)

    try {
      const res = await login(email, password)
      if (res.user.role === 'admin') {
        navigate('/admin')
      } else if (res.user.role === 'instructor') {
        navigate('/instructor/courses')
      } else {
        navigate('/dashboard')
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && (err.data as { status?: string } | null)?.status === 'pending') {
        setPendingNotice(err.message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Login failed. Please check your credentials.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSeedDemo = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await api.post('/api/seed')
      setSeedNotice('Demo database seeded successfully! You can now log in with the quick accounts below.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to seed database')
    } finally {
      setIsLoading(false)
    }
  }

  const quickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail)
    setPassword(demoPass)
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
            BrilliaMind
          </span>
        </Link>
        <h2 className="text-xl font-semibold text-slate-200">Sign in to your account</h2>
        <p className="mt-1 text-sm text-slate-400">
          Enter your credentials or use an authorized invite
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#1E293B]/80 backdrop-blur-xl border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {pendingNotice && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-amber-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Account Pending Approval</p>
                <p className="text-xs text-amber-300/80 mt-1">{pendingNotice}</p>
              </div>
            </div>
          )}

          {seedNotice && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{seedNotice}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Want to teach on BrilliaMind?{' '}
              <Link
                to="/register/instructor"
                className="font-medium text-indigo-400 hover:text-indigo-300"
              >
                Apply as Instructor
              </Link>
            </p>
            <p className="text-[11px] text-slate-500 mt-2">
              Learners join via direct email invitation only.
            </p>
          </div>

          {/* Quick Demo Testing Tools */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Demo Quick Logins
              </span>
              <button
                type="button"
                onClick={handleSeedDemo}
                className="text-[11px] text-indigo-400 hover:underline"
              >
                Seed Demo DB
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickLogin('admin@brilliamind.id', 'Admin123!')}
                className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left text-xs transition-colors"
              >
                <div className="flex items-center gap-1.5 text-indigo-300 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">admin@brillia...</div>
              </button>

              <button
                type="button"
                onClick={() => quickLogin('sarah.mitchell@brilliamind.id', 'Instructor123!')}
                className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left text-xs transition-colors"
              >
                <div className="flex items-center gap-1.5 text-purple-300 font-medium">
                  <UserCheck className="w-3.5 h-3.5" /> Instructor
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">sarah.mitchell@...</div>
              </button>

              <button
                type="button"
                onClick={() => quickLogin('budi.santoso@brilliamind.id', 'Learner123!')}
                className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left text-xs transition-colors"
              >
                <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                  <BookOpen className="w-3.5 h-3.5" /> Learner
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">budi.santoso@...</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
