import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Ingresa tu correo').email('Correo inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

export const ROLES = ['student', 'teacher', 'staff', 'admin'] as const
export const DOCUMENT_TYPES = ['CC', 'TI', 'CE', 'PASAPORTE'] as const

// Acepta vacío o una fecha válida (los <input type="date"> dan YYYY-MM-DD)
export const optionalDate = z
  .string()
  .refine((v) => v === '' || !Number.isNaN(Date.parse(v)), 'Fecha inválida')

export const createUserSchema = z.object({
    // Cuenta
    full_name: z.string().trim().min(3, 'Mínimo 3 caracteres'),
    email: z.string().trim().email('Correo inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    role: z.enum(ROLES),

    // Datos comunes
    document_type: z.enum(DOCUMENT_TYPES),
    document_number: z.string().trim().min(5, 'Mínimo 5 caracteres'),
    phone: z.string().trim(),
    birth_date: optionalDate,

    // Estudiante
    student_code: z.string().trim(),
    admission_date: optionalDate,

    // Docente y staff
    employee_code: z.string().trim(),
    hire_date: optionalDate,
    specialty: z.string().trim(),
    academic_degree: z.string().trim(),
    position: z.string().trim(),
    area: z.string().trim(),
  })
  .superRefine((v, ctx) => {
    const required = (field: keyof typeof v) => {
      if (!v[field]) {
        ctx.addIssue({ code: 'custom', path: [field], message: 'Campo obligatorio' })
      }
    }

    if (v.role === 'student') required('student_code')
    if (v.role === 'teacher') {
      required('employee_code')
      required('specialty')
    }
    if (v.role === 'staff') {
      required('employee_code')
      required('position')
      required('area')
    }
  })

export type LoginValues = z.infer<typeof loginSchema>
export type CreateUserValues = z.infer<typeof createUserSchema>