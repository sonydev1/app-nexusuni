"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { AlertCircle, CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { SelectField, TextField } from "@/components/form/fields";
import { createUserSchema, type CreateUserValues } from "@/lib/schemas";
import { createUser, type CreateUserResult } from "../services/create-user";
import { Button } from "@/components/ui/button";
import { DOCUMENT_OPTIONS } from "@/lib/options";
import Section from "@/components/form/section";


const defaultValues: CreateUserValues = {
  full_name: "",
  email: "",
  password: "",
  role: "student",
  document_type: "CC",
  document_number: "",
  phone: "",
  birth_date: "",
  student_code: "",
  admission_date: "",
  employee_code: "",
  hire_date: "",
  specialty: "",
  academic_degree: "",
  position: "",
  area: "",
};

const ROLE_OPTIONS = [
  { value: "student", label: "Estudiante" },
  { value: "teacher", label: "Docente" },
  { value: "staff", label: "Administrativo" },
  { value: "admin", label: "Administrador" },
];
/*
const DOCUMENT_OPTIONS = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "TI", label: "Tarjeta de identidad" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "PASAPORTE", label: "Pasaporte" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-800">
      <legend className="pr-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}
*/
export default function CreateUserForm({
  onSuccess,
}: {
  onSuccess: (message: string) => void;
}) {
  const [result, setResult] = useState<CreateUserResult | null>(null);

  const form = useForm({
    defaultValues,
    validators: { onSubmit: createUserSchema },
    onSubmit: async ({ value }) => {
      setResult(null);
      const res = await createUser(value);
      if (res.success) onSuccess(res.success);
      else setResult(res);
    },
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      {result?.error && (
        <div className="alert-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {result.error}
        </div>
      )}
      {result?.success && (
        <div className="alert-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {result.success}
        </div>
      )}

      <Section title="Cuenta">
        <form.Field name="role">
          {(f) => <SelectField field={f} label="Rol" options={ROLE_OPTIONS} />}
        </form.Field>
        <form.Field name="full_name">
          {(f) => <TextField field={f} label="Nombre completo" />}
        </form.Field>
        <form.Field name="email">
          {(f) => (
            <TextField field={f} label="Correo institucional" type="email" />
          )}
        </form.Field>
        <form.Field name="password">
          {(f) => (
            <TextField
              field={f}
              label="Contraseña temporal"
              type="password"
              placeholder="Mínimo 8 caracteres"
            />
          )}
        </form.Field>
      </Section>

      <Section title="Datos personales">
        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="document_type">
            {(f) => (
              <SelectField
                field={f}
                label="Tipo de documento"
                options={DOCUMENT_OPTIONS}
              />
            )}
          </form.Field>
          <form.Field name="document_number">
            {(f) => <TextField field={f} label="Número de documento" />}
          </form.Field>
          <form.Field name="phone">
            {(f) => (
              <TextField field={f} label="Teléfono (opcional)" type="tel" />
            )}
          </form.Field>
          <form.Field name="birth_date">
            {(f) => (
              <TextField
                field={f}
                label="Fecha de nacimiento (opcional)"
                type="date"
              />
            )}
          </form.Field>
        </div>
      </Section>

      {/* Sección que cambia según el rol elegido */}
      <form.Subscribe selector={(s) => s.values.role}>
        {(role) => (
          <>
            {role === "student" && (
              <Section title="Datos del estudiante">
                <div className="grid gap-4 sm:grid-cols-2">
                  <form.Field name="student_code">
                    {(f) => <TextField field={f} label="Código estudiantil" />}
                  </form.Field>
                  <form.Field name="admission_date">
                    {(f) => (
                      <TextField
                        field={f}
                        label="Fecha de ingreso (opcional)"
                        type="date"
                      />
                    )}
                  </form.Field>
                </div>
              </Section>
            )}

            {role === "teacher" && (
              <Section title="Datos del docente">
                <div className="grid gap-4 sm:grid-cols-2">
                  <form.Field name="employee_code">
                    {(f) => <TextField field={f} label="Código de empleado" />}
                  </form.Field>
                  <form.Field name="hire_date">
                    {(f) => (
                      <TextField
                        field={f}
                        label="Fecha de contratación (opcional)"
                        type="date"
                      />
                    )}
                  </form.Field>
                  <form.Field name="specialty">
                    {(f) => (
                      <TextField
                        field={f}
                        label="Especialidad"
                        placeholder="Ej: Matemáticas"
                      />
                    )}
                  </form.Field>
                  <form.Field name="academic_degree">
                    {(f) => (
                      <TextField
                        field={f}
                        label="Título académico (opcional)"
                        placeholder="Ej: Magíster"
                      />
                    )}
                  </form.Field>
                </div>
              </Section>
            )}

            {role === "staff" && (
              <Section title="Datos del administrativo">
                <div className="grid gap-4 sm:grid-cols-2">
                  <form.Field name="employee_code">
                    {(f) => <TextField field={f} label="Código de empleado" />}
                  </form.Field>
                  <form.Field name="hire_date">
                    {(f) => (
                      <TextField
                        field={f}
                        label="Fecha de contratación (opcional)"
                        type="date"
                      />
                    )}
                  </form.Field>
                  <form.Field name="position">
                    {(f) => (
                      <TextField
                        field={f}
                        label="Cargo"
                        placeholder="Ej: Secretaria académica"
                      />
                    )}
                  </form.Field>
                  <form.Field name="area">
                    {(f) => (
                      <TextField
                        field={f}
                        label="Área"
                        placeholder="Ej: Admisiones"
                      />
                    )}
                  </form.Field>
                </div>
              </Section>
            )}
          </>
        )}
      </form.Subscribe>

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <div className="sticky -bottom-4 -mx-4 -mb-4 border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6">
            <Button disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creando..." : "Crear usuario"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
