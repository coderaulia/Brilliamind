import { useState } from 'react'
import { Send } from 'lucide-react'

interface AdminInviteTabProps {
  onSendInvite: (email: string, role: 'learner' | 'instructor') => Promise<string | undefined>
}

export default function AdminInviteTab({ onSendInvite }: AdminInviteTabProps) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'learner' | 'instructor'>('learner')
  const [inviteSuccessLink, setInviteSuccessLink] = useState<string | null>(null)
  const [isSendingInvite, setIsSendingInvite] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSendingInvite(true)
    setInviteSuccessLink(null)

    try {
      const link = await onSendInvite(inviteEmail, inviteRole)
      if (link) {
        setInviteSuccessLink(link)
      }
      setInviteEmail('')
    } finally {
      setIsSendingInvite(false)
    }
  }

  return (
    <div className="max-w-2xl bg-[#1E293B]/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
      <div>
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Send className="w-4 h-4 text-indigo-400" /> Send Platform Email Invitation
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Participant registration is invite-only. Dispatch a secure activation link allowing the recipient to set their password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Recipient Email Address
          </label>
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="e.g. employee@company.com"
            className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Account Role
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setInviteRole('learner')}
              className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                inviteRole === 'learner'
                  ? 'border-indigo-500 bg-indigo-500/10 text-white'
                  : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold">Learner (Participant)</div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                Enrolls and takes assigned courses
              </div>
            </button>

            <button
              type="button"
              onClick={() => setInviteRole('instructor')}
              className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                inviteRole === 'instructor'
                  ? 'border-purple-500 bg-purple-500/10 text-white'
                  : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold">Course Instructor</div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                Direct studio access (pre-approved)
              </div>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSendingInvite}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSendingInvite ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5" /> Dispatch Invitation Link
            </>
          )}
        </button>
      </form>

      {inviteSuccessLink && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
          <p className="text-xs font-semibold text-indigo-300">
            Generated Activation URL (also sent via email):
          </p>
          <div className="p-2.5 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 select-all break-all border border-slate-800">
            {inviteSuccessLink}
          </div>
        </div>
      )}
    </div>
  )
}
