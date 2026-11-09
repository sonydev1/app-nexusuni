import Link from 'next/link'
import { GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ProgramNotFound() {
  return (
    <div className="card mx-auto my-12 flex max-w-md flex-col items-center gap-3 p-8 text-center">
      <div className="rounded-full bg-slate-100 p-3 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        <GraduationCap className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-bold">Carrera no encontrada</h1>
      <p className="muted text-sm">No existe o fue eliminada.</p>
      <Button asChild>
        <Link href="/admin/programs">Volver a carreras</Link>
      </Button>
    </div>
  )
}