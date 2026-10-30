"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { AlertCircle, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/form/fields";
import { logout } from "@/app/actions";
import { changePasswordSchema } from "../schemas/password-schema";
import { changePassword } from "../services/change-password";

export default function ChangePasswordForm({
  forced,
  recovery = false,
}: {
  forced: boolean;
  recovery: boolean;
}) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { password: "", confirm: "" },
    validators: { onSubmit: changePasswordSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      const res = await changePassword(value);
      if (res?.error) setError(res.error);
    },
  });

  return (
    <>
      <div className="space-y-2">
        <div className="inline-flex rounded-lg bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
          <KeyRound className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          {recovery
            ? "Crea una nueva contraseña"
            : forced
              ? "Crea tu contraseña"
              : "Cambiar contraseña"}
        </h1>
        <p className="muted text-sm">
          {recovery
            ? "Elige la contraseña con la que vas a ingresar de ahora en adelante."
            : forced
              ? "Por seguridad, debes reemplazar la contraseña temporal antes de continuar."
              : "Elige una contraseña nueva para tu cuenta."}
        </p>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        {error && (
          <div className="alert-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form.Field name="password">
          {(f) => (
            <TextField field={f} label="Nueva contraseña" type="password" />
          )}
        </form.Field>
        <p className="muted -mt-2 text-xs">
          Mínimo 8 caracteres, con al menos una letra y un número.
        </p>

        <form.Field name="confirm">
          {(f) => (
            <TextField field={f} label="Confirmar contraseña" type="password" />
          )}
        </form.Field>

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Guardando..." : "Guardar contraseña"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      {forced ? (
        <form action={logout}>
          <button className="muted w-full text-center text-sm hover:underline">
            Cerrar sesión
          </button>
        </form>
      ) : (
        <Link
          href="/"
          className="muted block text-center text-sm hover:underline"
        >
          Volver
        </Link>
      )}
    </>
  );
}
