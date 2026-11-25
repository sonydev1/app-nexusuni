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

export const optionalUuid = z
  .string()
  .refine((v) => v === '' || z.string().uuid().safeParse(v).success, 'Carrera inválida')

/* // dentro del z.object de createUserSchema, en la sección "Estudiante":
program_id: optionalUuid,

// dentro del superRefine:
if (v.role === 'student') required('program_id') */

export type LoginValues = z.infer<typeof loginSchema>
