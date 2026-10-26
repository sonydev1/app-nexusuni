export default function UsersSkeleton() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    )
  }