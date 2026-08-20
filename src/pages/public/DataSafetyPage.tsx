import PublicPageWrapper from '@/components/layout/PublicPageWrapper'
import {
  ShieldCheck,
  Lock,
  Server,
  Database,
  Cpu,
  KeyRound,
  CheckCircle2,
  Zap,
} from 'lucide-react'

export default function DataSafetyPage() {
  return (
    <PublicPageWrapper
      title="Data Safety & Edge Security"
      subtitle="How BrilliaMind leverages Cloudflare Workers, serverless D1, and Web Crypto standards to guarantee data safety and performance."
      badge="Security Architecture"
      lastUpdated="August 20, 2026"
    >
      <div className="space-y-10">
        {/* Section 1: Overview */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" /> 1. Security-First Architecture
          </h2>
          <p>
            BrilliaMind LMS was engineered from the ground up to operate on <strong>Cloudflare's global edge network</strong>. Rather than relying on traditional monolithic servers that present large attack surfaces, all API execution, authentication, and data operations run in lightweight, isolated V8 JavaScript isolates closest to the end user.
          </p>
        </section>

        {/* Section 2: Core Security Pillars */}
        <section className="space-y-4 not-prose my-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Key Data Safety & Encryption Pillars
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">PBKDF2 Password Hashing</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Passwords undergo 100,000 iterations of SHA-256 with cryptographically generated 16-byte random salts using the native Web Crypto API. Plain-text passwords are never logged or stored.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">HMAC-SHA256 JWT Sessions</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                User authentication is maintained via signed JSON Web Tokens (JWT) containing cryptographically verified role claims. Tokens expire automatically after 7 days and must be re-authenticated.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Cloudflare D1 SQLite Isolation</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                User profiles, course structures, and progress logs reside in Cloudflare D1 serverless SQLite instances with parameterized queries managed by Drizzle ORM to eliminate SQL injection vectors.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">KV Rate Limiting & DDoS Defense</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Authentication endpoints are protected by Cloudflare KV-backed rate limiters (maximum 10 attempts per minute per IP address) and Cloudflare edge DDoS mitigation.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Role-Based Access Control */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" /> 2. Role-Based Access Control (RBAC)
          </h2>
          <p>
            Access boundaries are enforced strictly at the worker middleware layer before any database query executes:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li><strong>Learner Isolation:</strong> Learners can only read published course content, submit their own lesson progress, and view their individual dashboards.</li>
            <li><strong>Instructor Approval Gate:</strong> Instructor accounts remain locked in a <code className="text-amber-300">pending</code> status until explicitly vetted and authorized by a Superadmin.</li>
            <li><strong>Superadmin Privilege:</strong> Superadmin endpoints require signed admin JWT tokens to perform user management, instructor approvals, and password resets.</li>
          </ul>
        </section>

        {/* Section 4: Data Retention & Compliance */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" /> 3. Data Retention, Portability & Erasure
          </h2>
          <p>
            In accordance with <strong>UU PDP No. 27/2022</strong> and <strong>GDPR</strong> standards:
          </p>
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> User Right to Erasure
            </div>
            <p>
              Users may request complete deletion of their account records and progression histories by submitting a verified request to <a href="mailto:security@brilliamind.id" className="text-indigo-400 hover:underline">security@brilliamind.id</a>. Upon confirmation, profile rows, watch logs, and enrollments will be purged from active D1 tables within 30 business days.
            </p>
          </div>
        </section>
      </div>
    </PublicPageWrapper>
  )
}
