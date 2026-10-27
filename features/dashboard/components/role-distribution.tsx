import { ROLE_LABELS, ROLE_BAR_COLORS } from "@/lib/roles";

import type { DashboardData } from "../types/dashboard-types";

export default function RoleDistribution({
  counts,
  className,
}: {
  counts: DashboardData["roleCounts"];
  className?: string;
}) {
  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <section className={`card p-4 sm:p-6 ${className ?? ""}`}>
      <h2 className="font-semibold">Usuarios por rol</h2>
      <p className="muted text-xs">
        Una persona con varios roles cuenta en cada uno.
      </p>

      <ul className="mt-5 space-y-4">
        {counts.map(({ role, count }) => (
          <li key={role} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span>{ROLE_LABELS[role] ?? role}</span>
              <span className="font-medium">{count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ${ROLE_BAR_COLORS[role] ?? "bg-slate-400"}`}
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
