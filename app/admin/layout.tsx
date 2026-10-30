import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { GraduationCap, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getSessionAndRoles } from "@/utils/supabase/roles";
import NavLinks from "@/components/admin/nav-links";
import MobileMenu from "@/components/admin/mobile-menu";
import ThemeToggle from "@/components/theme-toggle";
import { logout } from "../actions";
import Link from "next/link";
import Avatar from "@/components/avatar";
import { PageSkeleton } from "@/components/page-skeletons";

async function AdminGuard({ children }: { children: React.ReactNode }) {
  await connection();
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("has_role", { _role: "admin" });
  if (!isAdmin) redirect("/");
  return <>{children}</>;
}

async function SidebarUser() {
  const { user, profile } = await getSessionAndRoles()
  const name = profile?.full_name ?? user?.email ?? ''
  return (
    <Link
      href="/profile"
      className="flex items-center gap-3 rounded-lg p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      <Avatar name={name} path={profile?.avatar_path} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="muted truncate text-xs">{user?.email}</p>
      </div>
    </Link>
  );
}

// Contenido compartido entre la sidebar de escritorio y el cajón móvil
function SidebarContent() {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-3 py-2 font-semibold text-indigo-600 dark:text-indigo-400">
          <GraduationCap className="h-6 w-6" />
          NexusUni
        </div>
        <NavLinks />
      </div>

      <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
        <Suspense
          fallback={
            <div className="h-9 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          }
        >
          <SidebarUser />
        </Suspense>
        <form action={logout}>
          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400">
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar fija (escritorio) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:block">
        <SidebarContent />
      </aside>

      <div className="min-w-0 flex-1">
        {/* Barra superior */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex items-center gap-2 md:hidden">
            <MobileMenu>
              <SidebarContent />
            </MobileMenu>
            <span className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="h-5 w-5" />
              NexusUni
            </span>
          </div>
          <div className="hidden md:block" />
          <ThemeToggle />
        </header>

        <Suspense fallback={<PageSkeleton />}>
          <AdminGuard>{children}</AdminGuard>
        </Suspense>
      </div>
    </div>
  );
}
