import { DOCUMENT_TYPES, optionalDate } from "@/lib/schemas"
import { z } from 'zod'

export const STUDENT_STATUSES = ['active', 'inactive', 'graduated'] as const

const baseEditSchema = z.object({
  user_id: z.string().uuid(),

  // Datos comunes
  full_name: z.string().trim().min(3, 'Mínimo 3 caracteres'),
  document_type: z.enum(DOCUMENT_TYPES),
  document_number: z.string().trim().min(5, 'Mínimo 5 caracteres'),
  phone: z.string().trim(),
  birth_date: optionalDate,

  // Estudiante
  student_code: z.string().trim(),
  student_admission_date: optionalDate,
  student_status: z.enum(STUDENT_STATUSES),

  // Docente
  teacher_employee_code: z.string().trim(),
  teacher_specialty: z.string().trim(),
  teacher_academic_degree: z.string().trim(),
  teacher_hire_date: optionalDate,

  // Administrativo
  staff_employee_code: z.string().trim(),
  staff_position: z.string().trim(),
  staff_area: z.string().trim(),
  staff_hire_date: optionalDate,
})

export type UpdateUserValues = z.infer<typeof baseEditSchema>

// Solo exige los campos de los roles que la persona realmente tiene
export function makeUpdateUserSchema(roles: readonly string[]) {
  return baseEditSchema.superRefine((v, ctx) => {
    const required = (field: keyof UpdateUserValues) => {
      if (!v[field]) {
        ctx.addIssue({ code: 'custom', path: [field], message: 'Campo obligatorio' })
      }
    }

    if (roles.includes('student')) required('student_code')
    if (roles.includes('teacher')) {
      required('teacher_employee_code')
      required('teacher_specialty')
    }
    if (roles.includes('staff')) {
      required('staff_employee_code')
      required('staff_position')
      required('staff_area')
    }
  })
}