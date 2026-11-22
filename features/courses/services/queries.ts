import "server-only";
import { cache } from "react";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatDate } from "@/lib/format-date";
import type {
  CourseDetail,
  CourseOption,
  CoursePlanEntry,
  CourseRef,
  CourseRow,
} from "../types/course-types";
import { PlanKind } from "@/features/programs/constants";

const idSchema = z.string().uuid();

const COURSE_SELECT =
  "id, code, name, department_id, credits, weekly_hours, description, is_active, created_at, department:departments(code, name, is_active)";

type RawDepartment = { code: string; name: string; is_active: boolean };
type RawCourse = {
  id: string;
  code: string;
  name: string;
  department_id: string;
  credits: number;
  weekly_hours: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  department: RawDepartment | RawDepartment[] | null;
};

const byCode = (a: CourseRef, b: CourseRef) => a.code.localeCompare(b.code);

function toCourse(c: RawCourse, prerequisites: CourseRef[]): CourseRow {
  const dep = Array.isArray(c.department) ? c.department[0] : c.department;
  return {
    id: c.id,
    code: c.code,
    name: c.name,
    departmentId: c.department_id,
    departmentName: dep?.name ?? "—",
    departmentCode: dep?.code ?? "",
    departmentActive: dep?.is_active ?? false,
    credits: c.credits,
    weeklyHours: c.weekly_hours,
    description: c.description ?? "",
    isActive: c.is_active,
    createdLabel: formatDate(c.created_at),
    prerequisites,
  };
}

export const getCourseOptions = cache(async (): Promise<CourseOption[]> => {
  if (!(await requireAdmin())) throw new Error("No autorizado");

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("courses")
    .select("id, code, name, is_active")
    .order("code");
  if (error) throw new Error("No se pudieron cargar los cursos");

  return (data ?? []).map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    isActive: c.is_active,
  }));
});

export async function getCourses(): Promise<CourseRow[]> {
  if (!(await requireAdmin())) throw new Error("No autorizado");

  const admin = createAdminClient();
  const [coursesRes, linksRes] = await Promise.all([
    admin.from("courses").select(COURSE_SELECT).order("code"),
    admin.from("course_prerequisites").select("course_id, prerequisite_id"),
  ]);
  if (coursesRes.error || linksRes.error)
    throw new Error("No se pudieron cargar los cursos");

  const raw = (coursesRes.data ?? []) as unknown as RawCourse[];
  const refById = new Map<string, CourseRef>(
    raw.map((c) => [c.id, { id: c.id, code: c.code, name: c.name }]),
  );

  const prerequisitesByCourse = new Map<string, CourseRef[]>();
  for (const link of linksRes.data ?? []) {
    const ref = refById.get(link.prerequisite_id);
    if (!ref) continue;
    prerequisitesByCourse.set(link.course_id, [
      ...(prerequisitesByCourse.get(link.course_id) ?? []),
      ref,
    ]);
  }

  return raw.map((c) =>
    toCourse(c, (prerequisitesByCourse.get(c.id) ?? []).sort(byCode)),
  );
}

export async function getCourseDetail(
  id: string,
): Promise<CourseDetail | null> {
  if (!(await requireAdmin())) throw new Error("No autorizado");
  if (!idSchema.safeParse(id).success) return null;

  const admin = createAdminClient();
  const [courseRes, prereqRes,requiredRes,plansRes] = await Promise.all([
    admin.from("courses").select(COURSE_SELECT).eq("id", id).maybeSingle(),
    admin
      .from("course_prerequisites")
      .select("prerequisite_id")
      .eq("course_id", id),
    admin
      .from("course_prerequisites")
      .select("course_id")
      .eq("prerequisite_id", id),
    admin
      .from("program_courses")
      .select("semester, kind, program:programs(id, code, name)")
      .eq("course_id", id),
  ]);
  if (courseRes.error) throw new Error("No se pudo cargar el curso");
  if (!courseRes.data) return null;

  const prerequisiteIds = (prereqRes.data ?? []).map(
    (r) => r.prerequisite_id as string,
  );
  const requiredByIds = (requiredRes.data ?? []).map(
    (r) => r.course_id as string,
  );

  const ids = [...new Set([...prerequisiteIds, ...requiredByIds])];
  const refs = ids.length
    ? ((await admin.from("courses").select("id, code, name").in("id", ids))
        .data ?? [])
    : [];
  const refById = new Map<string, CourseRef>(
    refs.map((r) => [r.id, r as CourseRef]),
  );

  const pick = (list: string[]) =>
    list
      .map((i) => refById.get(i))
      .filter((r): r is CourseRef => !!r)
      .sort(byCode);

const programs: CoursePlanEntry[] = (plansRes.data ?? [])
  .map((row) => {
    const p = Array.isArray(row.program) ? row.program[0] : row.program
    if (!p) return null
    return {
      programId: p.id as string,
      programCode: p.code as string,
      programName: p.name as string,
      semester: row.semester as number,
      kind: row.kind as PlanKind,
    }
  })
  .filter((e): e is CoursePlanEntry => e !== null)
  .sort((a, b) => a.programName.localeCompare(b.programName))

  return {
   ...toCourse(courseRes.data as unknown as RawCourse, pick(prerequisiteIds)),
  requiredBy: pick(requiredByIds),
  programs,
  };
}
