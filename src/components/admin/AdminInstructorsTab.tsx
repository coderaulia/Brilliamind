import type { Instructor } from './types'
import { Clock, CheckCircle2, UserCheck, XCircle } from 'lucide-react'

interface AdminInstructorsTabProps {
  instructors: Instructor[]
  onApprove: (id: string, name: string) => void
  onReject: (id: string, name: string) => void
}

export default function AdminInstructorsTab({
  instructors,
  onApprove,
  onReject,
}: AdminInstructorsTabProps) {
  const pendingInstructors = instructors.filter((i) => i.status === 'pending')
  const activeInstructors = instructors.filter((i) => i.status === 'active')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4" /> Pending Applications ({pendingInstructors.length})
        </h2>

        {pendingInstructors.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#1E293B]/40 border border-slate-800 text-slate-400 text-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            All instructor applications have been reviewed. No pending applicants!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingInstructors.map((inst) => (
              <div
                key={inst.id}
                className="p-5 rounded-2xl bg-[#1E293B]/80 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-100">{inst.name}</h3>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Pending Review
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{inst.email}</p>
                  {inst.bio && (
                    <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 mt-2 italic">
                      "{inst.bio}"
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500">
                    Applied on {new Date(inst.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => onApprove(inst.id, inst.name)}
                    className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => onReject(inst.id, inst.name)}
                    className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
          <UserCheck className="w-4 h-4 text-purple-400" /> Active Instructors ({activeInstructors.length})
        </h2>
        <div className="rounded-2xl bg-[#1E293B]/80 border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Instructor</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Approved On</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {activeInstructors.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-100">{inst.name}</div>
                    <div className="text-slate-400 text-[11px]">{inst.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(inst.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onReject(inst.id, inst.name)}
                      className="text-xs text-rose-400 hover:text-rose-300 hover:underline"
                    >
                      Suspend Access
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
