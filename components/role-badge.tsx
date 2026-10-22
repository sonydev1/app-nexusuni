import { ROLE_LABELS, ROLE_STYLES } from '@/lib/roles'

export default function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        ROLE_STYLES[role] ?? 'bg-slate-50 text-slate-700 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-300'
      }`}
    >
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}