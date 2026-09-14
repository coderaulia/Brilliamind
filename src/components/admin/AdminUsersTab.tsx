import type { PlatformUser } from './types'
import { Download, RotateCcw } from 'lucide-react'

interface AdminUsersTabProps {
  users: PlatformUser[]
  onExportCsv: () => void
  onResetPassword: (userId: string, email: string) => void
}

export default function AdminUsersTab({
  users,
  onExportCsv,
  onResetPassword,
}: AdminUsersTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300">
          Platform User Directory ({users.length})
        </h2>
        <button
          onClick={onExportCsv}
          disabled={users.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" /> Export Users CSV
        </button>
      </div>

      <div className="rounded-2xl bg-[#1E293B]/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-100">{u.name}</div>
                    <div className="text-slate-400 text-[11px]">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : u.role === 'instructor'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-[11px] font-medium ${
                        u.status === 'active'
                          ? 'text-emerald-400'
                          : u.status === 'pending'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                      }`}
                    >
                      ● {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onResetPassword(u.id, u.email)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs inline-flex items-center gap-1.5"
                      title="Send Password Reset Email"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Password
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
