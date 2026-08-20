import PublicPageWrapper from '@/components/layout/PublicPageWrapper'
import { FileText, UserCheck, AlertTriangle, Copyright, Scale, ShieldAlert } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <PublicPageWrapper
      title="Terms of Service"
      subtitle="The rules, terms, and agreements governing access to BrilliaMind LMS for learners, instructors, and administrators."
      badge="Legal Agreement"
      lastUpdated="August 20, 2026"
    >
      <div className="space-y-10">
        {/* Section 1: Acceptance */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" /> 1. Acceptance of Terms
          </h2>
          <p>
            Welcome to BrilliaMind LMS (the "Platform"), operated by <strong>Vanaila Digital</strong> ("we", "us", or "our"). By visiting our website, creating an instructor account, accepting an email invitation, or accessing course materials, you agree to be bound by these Terms of Service ("Terms") and our <a href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</a>.
          </p>
          <p>
            If you do not agree to all terms and conditions in this agreement, you must immediately discontinue using the Platform.
          </p>
        </section>

        {/* Section 2: Account Roles & Eligibility */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" /> 2. User Roles & Account Eligibility
          </h2>
          <p>The Platform provides three distinct role tiers, each with specific operating guidelines:</p>
          <div className="space-y-3 not-prose my-4">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <h4 className="font-semibold text-slate-200 text-sm">A. Learners (Participants)</h4>
              <p className="text-xs text-slate-400">
                Learner onboarding is invitation-only. Learners gain access when invited via email by an authorized administrator or course instructor. Learners must set a secure password upon accepting the invitation and may not share account credentials with third parties.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <h4 className="font-semibold text-slate-200 text-sm">B. Instructors (Course Authors)</h4>
              <p className="text-xs text-slate-400">
                Instructors apply via the instructor registration form. All instructor accounts are placed in a <strong>Pending Approval</strong> state until reviewed and authorized by a Superadmin. Instructors agree to publish only accurate, high-quality, and non-infringing curriculum materials.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <h4 className="font-semibold text-slate-200 text-sm">C. Superadmins (Platform Operators)</h4>
              <p className="text-xs text-slate-400">
                Superadmins maintain master access to approve or suspend instructor applications, manage user rosters, dispatch invitations, and enforce platform security policies.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Intellectual Property */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Copyright className="w-5 h-5 text-indigo-400" /> 3. Intellectual Property & Content Rights
          </h2>
          <p>
            <strong>Instructor Content:</strong> Instructors retain full intellectual property ownership of the original course lectures, slides, and supplementary text they upload. By creating a course, instructors grant BrilliaMind a non-exclusive license to host, display, and stream this content to enrolled learners.
          </p>
          <p>
            <strong>Third-Party Media:</strong> When embedding YouTube or external videos, instructors warrant that they possess all necessary rights or permissions under fair use or YouTube Terms of Service. BrilliaMind does not host or claim ownership of third-party embedded video streams.
          </p>
          <p>
            <strong>Platform IP:</strong> The BrilliaMind brand, user interface, software engine, logo, and source code are the proprietary intellectual property of Vanaila Digital.
          </p>
        </section>

        {/* Section 4: Prohibited Conduct */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-indigo-400" /> 4. Prohibited Conduct & Academic Integrity
          </h2>
          <p>Users of the Platform agree NOT to:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>Share login tokens, credentials, or course access links with unauthorized parties.</li>
            <li>Use automated bots, scrapers, or scripts to download course videos or materials.</li>
            <li>Upload malicious code, viruses, or defamatory, harassing, or infringing content.</li>
            <li>Forge or manipulate quiz submissions or certificate verification URLs.</li>
            <li>Attempt to bypass rate limits or compromise Cloudflare edge worker security.</li>
          </ul>
        </section>

        {/* Section 5: Termination */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" /> 5. Account Suspension & Termination
          </h2>
          <p>
            We reserve the right to suspend or terminate any user or instructor account immediately, without prior notice, if you violate these Terms, engage in fraud, or compromise system security. Suspended instructors will have their published courses hidden from the catalog.
          </p>
        </section>

        {/* Section 6: Governing Law */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-400" /> 6. Governing Law & Dispute Resolution
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the <strong>Republic of Indonesia</strong>. Any legal action or dispute arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts in Indonesia.
          </p>
          <p className="pt-2 text-xs text-slate-400">
            Questions regarding our Terms of Service may be directed to <a href="mailto:legal@brilliamind.id" className="text-indigo-400 hover:underline">legal@brilliamind.id</a>.
          </p>
        </section>
      </div>
    </PublicPageWrapper>
  )
}
