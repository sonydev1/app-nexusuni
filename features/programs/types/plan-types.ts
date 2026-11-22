import type { PlanKind } from '../constants';

export type PlanCourse = {
  courseId: string
  code: string
  name: string
  credits: number
  weeklyHours: number
  isActive: boolean
  semester: number
  kind: PlanKind
  prerequisites: { id: string; code: string }[]
}

// Cursos que todavía se pueden agregar al plan
export type PlanCandidate = {
  id: string
  code: string
  name: string
  credits: number
  departmentName: string
}

export type PlanIssue = { courseCode: string; message: string }

export type PlanAnalysis = {
  totalCredits: number
  requiredCredits: number
  electiveCredits: number
  issues: PlanIssue[]
}