import Link from 'next/link'
import { UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function UserNotFound() {
  return (
    <div className="card mx-auto my-12 flex max-w-md flex-col items-center gap-3 p-8 text-center">
      <div className="rounded-full bg-slate-100 p-3 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        <UserX className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-bold">Usuario no encontrado</h1>
      <p className="muted text-sm">No existe o fue eliminado.</p>
      <Button asChild>
        <Link href="/admin/users">Volver a usuarios</Link>
      </Button>
    </div>
  )
}