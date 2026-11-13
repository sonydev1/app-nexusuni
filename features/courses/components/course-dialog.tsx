'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { DepartmentOption } from '@/features/programs/types/program-types'
import type { CourseOption, CourseRow } from '../types/course-types'
import CourseForm from './course-form'

export default function CourseDialog({
  open,
  onOpenChange,
  course,
  departments,
  courseOptions,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  course?: CourseRow
  departments: DepartmentOption[]
  courseOptions: CourseOption[]
}) {
  const hasActiveDepartment = departments.some((d) => d.isActive)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{course ? 'Editar curso' : 'Nuevo curso'}</DialogTitle>
          <DialogDescription>
            {course ? course.name : 'Cada curso pertenece al departamento que lo dicta.'}
          </DialogDescription>
        </DialogHeader>

        {!course && !hasActiveDepartment ? (
          <div className="space-y-3 text-sm">
            <p>Primero necesitas al menos un departamento activo.</p>
            <Button asChild>
              <Link href="/admin/departments">Ir a departamentos</Link>
            </Button>
          </div>
        ) : (
          <CourseForm
            course={course}
            departments={departments}
            courseOptions={courseOptions}
            onSuccess={(message) => {
              onOpenChange(false)
              toast.success(message)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}