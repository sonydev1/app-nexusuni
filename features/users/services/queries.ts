import "server-only";
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/utils/supabase/admin";
import type { UserDetail, UserRow } from "../types/user-types";
import { requireAdmin } from "@/lib/auth/require-admin";
import z from "zod";
import { formatDate } from '@/lib/format-date'

const idSchema = z.string().uuid()

async function fetchAllAuthUsers(admin: ReturnType<typeof createAdminClient>) {
  const perPage = 200;
  const all: User[] = [];

  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    all.push(...data.users);
    if (data.users.length < perPage) break;
  }
  return all;
}

export async function getUsersData() {
  if (!(await requireAdmin())) throw new Error('No autorizado')
  const admin = createAdminClient();

  const [authUsers, { data: roles }, { data: profiles }, { data: students }] =
    await Promise.all([
      fetchAllAuthUsers(admin),
      admin.from("user_roles").select("user_id, role"),
      admin
        .from("profiles")
        .select(
          "id, full_name, avatar_path, document_type, document_number, created_at, deactivated_at, deactivation_reason",
        ),
      admin.from("students").select("user_id, status"),
    ]);

  const statusByUser = new Map(students?.map((s) => [s.user_id, s.status]));

  const rolesByUser = new Map<string, string[]>();
  roles?.forEach((r) => {
    rolesByUser.set(r.user_id, [...(rolesByUser.get(r.user_id) ?? []), r.role]);
  });
  const profileById = new Map(profiles?.map((p) => [p.id, p]));
  const now = Date.now();

  const rows: UserRow[] = authUsers.map((u) => {
    const userRoles = rolesByUser.get(u.id) ?? [];
    const p = profileById.get(u.id);
    const createdAt = p?.created_at ?? new Date(0).toISOString();
    return {
      id: u.id,
      name: p?.full_name ?? "Sin nombre",
      email: u.email ?? "",
      avatarPath: p?.avatar_path ?? null,
      document: p?.document_number
        ? `${p.document_type} ${p.document_number}`
        : "",
      roles: userRoles,
      createdAt,
      createdLabel: new Date(createdAt).toLocaleDateString("es-CO", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "America/Bogota",
      }),
      studentStatus: userRoles.includes("student")
        ? ((statusByUser.get(u.id) as UserRow["studentStatus"]) ?? null)
        : null,
      disabled:
        !!p?.deactivated_at ||
        (!!u.banned_until && new Date(u.banned_until).getTime() > now),
      deactivationReason: p?.deactivation_reason ?? null,
    };
  });

  const counts: Record<string, number> = {
    student: 0,
    teacher: 0,
    staff: 0,
    admin: 0,
  };
  roles?.forEach((r) => {
    counts[r.role] = (counts[r.role] ?? 0) + 1;
  });

  return { rows, counts };
}


export async function getUserDetail(id: string): Promise<UserDetail | null> {
  if (!(await requireAdmin())) throw new Error('No autorizado')
  if (!idSchema.safeParse(id).success) return null

  const admin = createAdminClient()

  const [authRes, profileRes, rolesRes, studentRes, teacherRes, staffRes] = await Promise.all([
    admin.auth.admin.getUserById(id),
    admin
      .from('profiles')
      .select(
        'full_name, avatar_path, document_type, document_number, phone, birth_date, ' +
          'deactivated_at, deactivated_by, deactivation_reason, must_change_password'
      )
      .eq('id', id)
      .maybeSingle(),
    admin.from('user_roles').select('role').eq('user_id', id),
    admin.from('students').select('student_code, status, admission_date').eq('user_id', id).maybeSingle(),
    admin
      .from('teachers')
      .select('employee_code, specialty, academic_degree, hire_date')
      .eq('user_id', id)
      .maybeSingle(),
    admin.from('staff').select('employee_code, position, area, hire_date').eq('user_id', id).maybeSingle(),
  ])

  const authUser = authRes.data?.user
  const p = profileRes.data
  if (!authUser || !p) return null

  console.log(p)

  // Quién desactivó la cuenta (puede ser null si esa persona fue eliminada después)
  let deactivatedBy = ''
  if (p.deactivated_by) {
    const { data } = await admin.from('profiles').select('full_name').eq('id', p.deactivated_by).maybeSingle()
    deactivatedBy = data?.full_name ?? ''
  }

  const s = studentRes.data
  const t = teacherRes.data
  const st = staffRes.data

  const banned = !!authUser.banned_until && new Date(authUser.banned_until).getTime() > Date.now()
  const disabled = !!p.deactivated_at || banned

  return {
    id,
    name: p.full_name ?? 'Sin nombre',
    email: authUser.email ?? '',
    avatarPath: p.avatar_path,
    roles: (rolesRes.data ?? []).map((r) => r.role as string),
    disabled,
    mustChangePassword: !!p.must_change_password,
    document: p.document_number ? `${p.document_type} ${p.document_number}` : '',
    phone: p.phone ?? '',
    birthDate: formatDate(p.birth_date),
    createdLabel: formatDate(authUser.created_at),
    lastSignIn: formatDate(authUser.last_sign_in_at, { time: true }),
    deactivation: disabled
      ? {
          reason: p.deactivation_reason ?? '',
          at: formatDate(p.deactivated_at, { time: true }),
          by: deactivatedBy,
        }
      : null,
    student: s
      ? { code: s.student_code, status: s.status, admissionDate: formatDate(s.admission_date) }
      : null,
    teacher: t
      ? {
          code: t.employee_code,
          specialty: t.specialty ?? '',
          degree: t.academic_degree ?? '',
          hireDate: formatDate(t.hire_date),
        }
      : null,
    staff: st
      ? {
          code: st.employee_code,
          position: st.position ?? '',
          area: st.area ?? '',
          hireDate: formatDate(st.hire_date),
        }
      : null,
  }
}