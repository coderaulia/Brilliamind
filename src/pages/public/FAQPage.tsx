import { useState, useMemo } from 'react'
import PublicPageWrapper from '@/components/layout/PublicPageWrapper'
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  ArrowRight,
} from 'lucide-react'

interface FAQItem {
  id: string
  category: 'onboarding' | 'courses' | 'instructors' | 'security'
  question: string
  answer: string
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'onboarding',
    question: 'How do learners join courses on BrilliaMind LMS?',
    answer: 'Learner onboarding is invitation-only. You will receive a secure email invitation from your instructor or organization administrator containing an activation link. Clicking the link allows you to create your secure password and immediately access your assigned courses.',
  },
  {
    id: 'faq-2',
    category: 'onboarding',
    question: 'What should I do if my invitation link expires?',
    answer: 'Invitation tokens are valid for 7 days from dispatch. If your link has expired, contact your course instructor or organization administrator to re-issue a fresh invitation link from their dashboard.',
  },
  {
    id: 'faq-3',
    category: 'onboarding',
    question: 'How do I reset my account password?',
    answer: 'You can request a password recovery link at any time by visiting /forgot-password. Enter your registered email address, and a secure reset token valid for 24 hours will be sent to your inbox. Platform administrators can also trigger a password reset directly from the Superadmin Control Center.',
  },
  {
    id: 'faq-4',
    category: 'instructors',
    question: 'How do I become an instructor on BrilliaMind?',
    answer: 'Visit the Instructor Application page at /register/instructor and submit your full name, email, credentials, and teaching background. Your application will enter the Superadmin Review Queue. Once reviewed and authorized by our team, you will receive an approval confirmation email and full access to the Instructor Studio.',
  },
  {
    id: 'faq-5',
    category: 'instructors',
    question: 'Why does my instructor account show "Pending Superadmin Approval"?',
    answer: 'To ensure the highest standard of curriculum quality and compliance, all new instructor accounts undergo manual verification by platform administrators. During this review period, login access is temporarily restricted until approval is granted.',
  },
  {
    id: 'faq-6',
    category: 'courses',
    question: 'Can instructors add YouTube video lessons to courses?',
    answer: 'Yes! The Course Curriculum Editor supports embedding any public or unlisted YouTube video URL as well as direct MP4 links. You can preview the video player in real-time, arrange modules, and toggle individual lessons as "Free Previews" for prospective students.',
  },
  {
    id: 'faq-7',
    category: 'courses',
    question: 'How is my learning progress tracked and saved?',
    answer: 'As you watch video lessons and check off curriculum items, your progress is automatically synchronized with our Cloudflare Worker backend and recorded in your D1 database profile. Reaching 100% completion marks the course as completed and updates your progress analytics in real-time.',
  },
  {
    id: 'faq-8',
    category: 'courses',
    question: 'Can instructors see student progress in real-time?',
    answer: 'Yes. Instructors can navigate to the Learner Progress Roster for each of their courses to view student names, enrollment dates, completed lesson tallies, and percentage completion bars.',
  },
  {
    id: 'faq-9',
    category: 'security',
    question: 'How is user data and password security maintained?',
    answer: 'BrilliaMind uses enterprise-grade Web Crypto PBKDF2 password hashing (100,000 iterations of SHA-256 with 16-byte random salts) and signed HMAC-SHA256 JWT tokens. We never store plain-text passwords, and all communications are encrypted over HTTPS via Cloudflare edge SSL.',
  },
  {
    id: 'faq-10',
    category: 'security',
    question: 'How can third parties verify certificates issued by BrilliaMind?',
    answer: 'Every certificate generated upon course completion carries a unique cryptographic certificate UUID (e.g. /verify/bm-cert-2026-8942-ux). Anyone can visit this verification URL to confirm the certificate authenticity, recipient name, course title, and issue date.',
  },
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({ 'faq-1': true, 'faq-4': true })

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesCat = activeCategory === 'all' || item.category === activeCategory
      const matchesSearch =
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCat && matchesSearch
    })
  }, [searchQuery, activeCategory])

  return (
    <PublicPageWrapper
      title="Frequently Asked Questions"
      subtitle="Find answers to common questions about onboarding, course publishing, instructor approvals, and platform security."
      badge="Knowledge Base & FAQ"
      lastUpdated="August 20, 2026"
    >
      <div className="space-y-8 not-prose">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by keyword (e.g., invitation, instructor, youtube, password)..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'onboarding', label: 'Learners & Invitations' },
            { id: 'instructors', label: 'Instructors & Approval' },
            { id: 'courses', label: 'Courses & Video Player' },
            { id: 'security', label: 'Security & Certificates' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3 pt-2">
          {filteredFaqs.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm">
              <HelpCircle className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-60" />
              No matching questions found for "{searchQuery}". Try a different search term or select "All Questions".
            </div>
          ) : (
            filteredFaqs.map(item => {
              const isExpanded = !!expandedIds[item.id]
              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#1E293B]/70 border border-slate-800/80 overflow-hidden transition-colors hover:border-slate-700"
                >
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-100 text-sm sm:text-base focus:outline-none"
                  >
                    <span>{item.question}</span>
                    <span className="p-1.5 rounded-lg bg-slate-800 text-slate-400 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 text-slate-300 text-sm leading-relaxed border-t border-slate-800/60 mt-1">
                      {item.answer}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Contact Support Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-purple-900/20 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 mt-12">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-4 h-4 text-indigo-400" /> Have more questions?
            </h3>
            <p className="text-xs text-slate-300">
              Our engineering and support team is here to assist you with onboarding or technical inquiries.
            </p>
          </div>
          <a
            href="mailto:support@brilliamind.id"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all shrink-0 flex items-center gap-1.5"
          >
            Contact Support <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </PublicPageWrapper>
  )
}
