import { z } from 'zod'

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha obligatoria')
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha inválida')

export const termSchema = z
  .object({
    code: z.string().trim().regex(/^\d{4}-[1-3]$/, 'Formato AAAA-N, por ejemplo 2026-2'),
    start_date: dateString,
    end_date: dateString,
    enrollment_start: dateString,
    enrollment_end: dateString,
  })
  .superRefine((v, ctx) => {
    const issue = (path: keyof typeof v, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })

    if (v.start_date >= v.end_date) issue('end_date', 'Debe ser posterior al inicio')
    if (v.enrollment_start > v.enrollment_end) {
      issue('enrollment_end', 'No puede ser anterior a la apertura')
    }
    if (v.enrollment_end > v.end_date) {
      issue('enrollment_end', 'No puede ser posterior al fin del periodo')
    }
  })

export type TermValues = z.infer<typeof termSchema>