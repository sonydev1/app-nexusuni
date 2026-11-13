'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Eye, Loader2, MoreHorizontal, Pencil, Power, PowerOff, Trash2 } from 'lucide-react'
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
import type { DepartmentOption } from '@/features/programs/types/program-types'
import { deleteCourse, setCourseActive } from '../services/course-actions'
import type { CourseOption, CourseRow } from '../types/course-types'
import CourseDialog from './course-dialog'

export default function CourseRowActions({
  course,
  departments,
  courseOptions,
  showDetail = true,
  redirectOnDelete = false,
  triggerLabel,
}: {
  course: CourseRow
  departments: DepartmentOption[]
  courseOptions: CourseOption[]
  showDetail?: boolean
  redirectOnDelete?: boolean
  triggerLabel?: string
}) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function toggleActive() {
    startTransition(async () => {
      const res = await setCourseActive(course.id, !course.isActive)
      if (res.error) toast.error(res.error)
      else toast.success(res.success)
    })
  }

  function confirmDelete() {
    startTransition(async () => {
      const res = await deleteCourse(course.id)
      if (res.error) toast.error(res.error)
      else {
        toast.success(res.success)
        if (redirectOnDelete) router.push('/admin/courses')
      }
      setConfirmOpen(false)
    })
  }

  const icon = pending ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <MoreHorizontal className="h-4 w-4" />
  )

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {triggerLabel ? (
            <Button variant="outline" disabled={pending}>
              {icon}
              {triggerLabel}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Acciones para ${course.name}`}
              disabled={pending}
            >
              {icon}
            </Button>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="truncate">{course.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {showDetail && (
            <>
              <DropdownMenuItem asChild>
                <Link href={`/admin/courses/${course.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={toggleActive}>
            {course.isActive ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                Desactivar
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                Reactivar
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => setConfirmOpen(true)}
            className="text-red-600 focus:text-red-600 dark:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CourseDialog
        course={course}
        departments={departments}
        courseOptions={courseOptions}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {course.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Si es prerrequisito de otros cursos o está en un
              plan de estudios no se podrá eliminar; en ese caso desactívalo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}