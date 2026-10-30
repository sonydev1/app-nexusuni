import { z } from "zod";

export const passwordRule = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(72, "Máximo 72 caracteres")
  .regex(/[A-Za-z]/, "Debe incluir al menos una letra")
  .regex(/\d/, "Debe incluir al menos un número");

export const changePasswordSchema = z
  .object({
    password: passwordRule,
    confirm: z.string().min(1, "Confirma la contraseña"),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Las contraseñas no coinciden",
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Escribe tu correo").email("Correo inválido"),
});

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
