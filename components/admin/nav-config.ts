import {
    BookOpen,
    Building2,
    GraduationCap,
    LayoutDashboard,
    Users,
    type LucideIcon,
  } from 'lucide-react'
  
  export type NavLink = { href: string; label: string; icon: LucideIcon; exact?: boolean }
  export type NavGroup = { label: string | null; links: NavLink[] }
  
  export const NAV_GROUPS: NavGroup[] = [
    {
      label: null,
      links: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true }],
    },
    {
      label: 'Personas',
      links: [{ href: '/admin/users', label: 'Usuarios', icon: Users }],
    },
    {
      label: 'Académico',
      links: [
        { href: '/admin/departments', label: 'Departamentos', icon: Building2 },
        { href: '/admin/programs', label: 'Carreras', icon: GraduationCap },
        { href: '/admin/courses', label: 'Cursos', icon: BookOpen },
      ],
    },
  ]