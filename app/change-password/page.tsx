import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ThemeToggle from "@/components/theme-toggle";
import { FormSkeleton } from "@/components/skeleton";
import ChangePasswordForm from "@/features/auth/components/change-password-form";

async function ChangePasswordContent({
  searchParams,
}: {
  searchParams: Promise<{ recovery?: string }>;
}) {
  await connection();

  const { recovery } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("must_change_password, deactivated_at")
    .eq("id", user.id)
    .single();

  if (profile?.deactivated_at) redirect("/auth/deactivated");

  return (
    <ChangePasswordForm
      forced={!!profile?.must_change_password}
      recovery={!!recovery}
    />
  );
}

export default function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ recovery?: string }>;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center p-4">
      <ThemeToggle className="absolute right-4 top-4" />
      <div className="card w-full max-w-md space-y-6 p-6 sm:p-8">
        <Suspense
          fallback={
            <FormSkeleton
              label="Cargando…"
              sections={[{ fields: 2, columns: 1 }]}
            />
          }
        >
          <ChangePasswordContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
