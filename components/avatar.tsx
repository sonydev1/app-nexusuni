import { avatarUrl } from '@/lib/avatar'

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-24 w-24 text-3xl',
}

export default function Avatar({
  name,
  path,
  src,
  size = 'md',
}: {
  name: string
  path?: string | null
  src?: string | null // para vistas previas locales
  size?: keyof typeof SIZES
}) {
  const url = src ?? avatarUrl(path)

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-semibold uppercase text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 ${SIZES[size]}`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="h-full w-full object-cover" />
      ) : (
        name.charAt(0) || '?'
      )}
    </div>
  )
}