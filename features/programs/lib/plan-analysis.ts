import type { PlanAnalysis, PlanCourse, PlanIssue } from '../types/plan-types'

export function analyzePlan(courses: PlanCourse[]): PlanAnalysis {
  const semesterOf = new Map(courses.map((c) => [c.courseId, c.semester]))
  const issues: PlanIssue[] = []
  let requiredCredits = 0
  let electiveCredits = 0

  for (const c of courses) {
    if (c.kind === 'required') requiredCredits += c.credits
    else electiveCredits += c.credits

    if (!c.isActive) {
      issues.push({ courseCode: c.code, message: `${c.code} está inactivo y sigue en el plan.` })
    }

    for (const p of c.prerequisites) {
      const prerequisiteSemester = semesterOf.get(p.id)

      if (prerequisiteSemester === undefined) {
        issues.push({
          courseCode: c.code,
          message: `${c.code} requiere ${p.code}, que no está en el plan.`,
        })
      } else if (prerequisiteSemester >= c.semester) {
        issues.push({
          courseCode: c.code,
          message: `${c.code} (semestre ${c.semester}) requiere ${p.code} (semestre ${prerequisiteSemester}): debería estar en un semestre anterior.`,
        })
      }
    }
  }

  return {
    totalCredits: requiredCredits + electiveCredits,
    requiredCredits,
    electiveCredits,
    issues,
  }
}