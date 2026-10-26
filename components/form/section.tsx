export default function Section({
    title,
    children,
  }: {
    title: string
    children: React.ReactNode
  }) {
    return (
      <fieldset className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-800">
        <legend className="pr-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </legend>
        {children}
      </fieldset>
    )
  }