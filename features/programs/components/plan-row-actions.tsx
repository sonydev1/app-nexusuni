'use client'

import { useState, useTransition } from 'react'
import { Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { removeCourseFromPlan } from '../services/plan-actions'
import type { PlanCourse } from '../types/plan-types'
import PlanCourseDialog from './plan-course-dialog'

export default function PlanRowActions({
  programId,
  durationSemesters,
  course,
}: {
  programId: string
  durationSemesters: number
  course: PlanCourse
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function confirmRemove() {
    startTransition(async () => {
      const res = await removeCourseFromPlan(programId, course.courseId)
      if (res.error) toast.error(res.error)
      else toast.success(res.success)
      setConfirmOpen(false)
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Acciones para ${course.code}`}
            disabled={pending}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="truncate">{course.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Cambiar semestre o tipo
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => setConfirmOpen(true)}
            className="text-red-600 focus:text-red-600 dark:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Quitar del plan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PlanCourseDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        programId={programId}
        durationSemesters={durationSemesters}
        mode={{ type: 'edit', course }}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitar {course.code} del plan?</AlertDialogTitle>
            <AlertDialogDescription>
              El curso no se elimina: solo deja de formar parte de esta carrera. Podrás volver a
              agregarlo cuando quieras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(e) => {
                e.preventDefault()
                confirmRemove()
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Quitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}