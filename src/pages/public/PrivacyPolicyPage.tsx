import PublicPageWrapper from '@/components/layout/PublicPageWrapper'
import { Shield, Lock, Eye, Server, Database, Globe, HelpCircle } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <PublicPageWrapper
      title="Privacy Policy"
      subtitle="How BrilliaMind collects, protects, and handles personal data across our serverless learning platform."
      badge="Privacy & Compliance"
      lastUpdated="August 20, 2026"
    >
      <div className="space-y-10">
        {/* Section 1: Overview */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" /> 1. Introduction & Scope
          </h2>
          <p>
            BrilliaMind LMS (operated by <strong>Vanaila Digital</strong>, "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy describes how we collect, store, process, and safeguard your personal information when you access or use our e-learning platform, website (<code className="text-indigo-300">brilliamind.id</code>), and associated Cloudflare Worker edge services.
          </p>
          <p>
            By creating an account, accepting an email invitation, or enrolling in courses on BrilliaMind, you consent to the data practices described in this policy in accordance with Indonesia's Personal Data Protection Law (<strong>UU PDP No. 27/2022</strong>) and the EU General Data Protection Regulation (<strong>GDPR</strong>).
          </p>
        </section>

        {/* Section 2: Data We Collect */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" /> 2. Information We Collect
          </h2>
          <p>We collect information you provide directly to us as well as data generated through your usage of the platform:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose my-4">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
              <h4 className="font-semibold text-slate-200 text-sm">Account & Identity</h4>
              <p className="text-xs text-slate-400">
                Full name, email address, password hash (PBKDF2 encrypted), user role (Admin, Instructor, Learner), professional biography, and profile avatars.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
              <h4 className="font-semibold text-slate-200 text-sm">Learning Progression</h4>
              <p className="text-xs text-slate-400">
                Lesson completion statuses, video watch times, quiz attempts and scores, enrolled course records, and earned certificate metadata.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
              <h4 className="font-semibold text-slate-200 text-sm">Invitations & Referrals</h4>
              <p className="text-xs text-slate-400">
                Invitation email records, cryptographic invitation tokens, and target course assignments issued by instructors or administrators.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
              <h4 className="font-semibold text-slate-200 text-sm">Technical Diagnostics</h4>
              <p className="text-xs text-slate-400">
                IP address, browser type, device information, and Cloudflare edge access logs for security enforcement and rate limiting.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: How We Use Data */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-400" /> 3. How We Use Your Information
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li><strong>Service Delivery:</strong> To deliver video lectures, verify quiz results, and calculate course progress percentages.</li>
            <li><strong>Account Administration:</strong> To authenticate credentials, manage role permissions, and process instructor approval applications.</li>
            <li><strong>Transactional Communications:</strong> To send email invitations, password reset links, and course enrollment confirmations via Resend.</li>
            <li><strong>Credential Verification:</strong> To provide public verification links for earned certificates (<code className="text-indigo-300">/verify/:certUuid</code>).</li>
            <li><strong>Security & Abuse Prevention:</strong> To enforce rate limits, detect fraudulent attempts, and safeguard platform integrity.</li>
          </ul>
        </section>

        {/* Section 4: Edge Storage & Security */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" /> 4. Edge Storage & Security Architecture
          </h2>
          <p>
            All user records are stored in <strong>Cloudflare D1</strong> serverless SQLite databases and <strong>Cloudflare R2</strong> object storage. We employ enterprise-grade security protocols:
          </p>
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-2 text-xs text-indigo-200">
            <div className="font-bold flex items-center gap-1.5 text-indigo-300">
              <Lock className="w-4 h-4" /> Cryptographic Standards
            </div>
            <p>
              Passwords are never stored in plaintext. We utilize <strong>Web Crypto PBKDF2</strong> with 100,000 iterations of SHA-256 and unique 16-byte random salts. User authentication sessions utilize HMAC-SHA256 signed JSON Web Tokens (JWT).
            </p>
          </div>
        </section>

        {/* Section 5: Third-Party Services & Embeds */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" /> 5. Third-Party Video Embeds & Providers
          </h2>
          <p>
            Instructors may embed video lessons hosted on external providers (such as YouTube or Vimeo). When you watch embedded videos, your browser communicates directly with the third-party provider's servers. Their data collection is governed by their respective privacy policies:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-400">
            <li><a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Google / YouTube Privacy Policy</a></li>
            <li><a href="https://vimeo.com/privacy" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Vimeo Privacy Policy</a></li>
            <li><a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Resend Privacy Policy</a></li>
          </ul>
        </section>

        {/* Section 6: User Rights */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" /> 6. Your Rights & Data Choices
          </h2>
          <p>
            Under applicable data protection laws (including UU PDP No. 27/2022 and GDPR), you have the right to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>Request access to your stored personal data and learning records.</li>
            <li>Request correction or updates to inaccurate profile information.</li>
            <li>Request the deletion or anonymization of your account and progress data.</li>
            <li>Opt out of non-essential email notifications at any time.</li>
          </ul>
          <p className="pt-2">
            To exercise any of these rights, please contact our Data Protection Officer at <a href="mailto:privacy@brilliamind.id" className="text-indigo-400 hover:underline">privacy@brilliamind.id</a>.
          </p>
        </section>
      </div>
    </PublicPageWrapper>
  )
}
