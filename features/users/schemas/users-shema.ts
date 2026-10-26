import { DOCUMENT_TYPES, optionalDate, ROLES } from "@/lib/schemas";
import { z } from "zod";

export const STUDENT_STATUSES = ["active", "inactive", "graduated"] as const;

const baseEditSchema = z.object({
  user_id: z.string().uuid(),

  // Datos comunes
  full_name: z.string().trim().min(3, "Mínimo 3 caracteres"),
  document_type: z.enum(DOCUMENT_TYPES),
  document_number: z.string().trim().min(5, "Mínimo 5 caracteres"),
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
});

export const createUserSchema = z
  .object({
    // Cuenta
    full_name: z.string().trim().min(3, "Mínimo 3 caracteres"),
    email: z.string().trim().email("Correo inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    role: z.enum(ROLES),

    // Datos comunes
    document_type: z.enum(DOCUMENT_TYPES),
    document_number: z.string().trim().min(5, "Mínimo 5 caracteres"),
    phone: z.string().trim(),
    birth_date: optionalDate,

    // Estudiante
    admission_date: optionalDate,

    // Docente y administrativo
    hire_date: optionalDate,
    specialty: z.string().trim(),
    academic_degree: z.string().trim(),
    position: z.string().trim(),
    area: z.string().trim(),
  })
  .superRefine((v, ctx) => {
    const required = (field: keyof typeof v) => {
      if (!v[field]) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: "Campo obligatorio",
        });
      }
    };

    if (v.role === "teacher") required("specialty");
    if (v.role === "staff") {
      required("position");
      required("area");
    }
  });

export function makeUpdateUserSchema(roles: readonly string[]) {
  return baseEditSchema.superRefine((v, ctx) => {
    const required = (field: keyof UpdateUserValues) => {
      if (!v[field]) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: "Campo obligatorio",
        });
      }
    };

    if (roles.includes("teacher")) required("teacher_specialty");
    if (roles.includes("staff")) {
      required("staff_position");
      required("staff_area");
    }
  });
}

const addRoleBase = z.object({
  user_id: z.string().uuid(),
  role: z.enum(ROLES),

  // Estudiante

  student_admission_date: optionalDate,

  // Docente

  teacher_specialty: z.string().trim(),
  teacher_academic_degree: z.string().trim(),
  teacher_hire_date: optionalDate,

  // Administrativo

  staff_position: z.string().trim(),
  staff_area: z.string().trim(),
  staff_hire_date: optionalDate,
});

export const addRoleSchema = addRoleBase.superRefine((v, ctx) => {
  const required = (field: keyof AddRoleValues) => {
    if (!v[field]) {
      ctx.addIssue({
        code: "custom",
        path: [field],
        message: "Campo obligatorio",
      });
    }
  };

  if (v.role === "teacher") required("teacher_specialty");
  if (v.role === "staff") {
    required("staff_position");
    required("staff_area");
  }
});

export type AddRoleValues = z.infer<typeof addRoleBase>;

export type CreateUserValues = z.infer<typeof createUserSchema>;

export type UpdateUserValues = z.infer<typeof baseEditSchema>;
