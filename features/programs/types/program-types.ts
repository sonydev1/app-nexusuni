import type { ProgramLevel } from '../constants'

export type ProgramRow = {
  id: string
  code: string
  name: string
  departmentId: string
  departmentName: string
  level: ProgramLevel
  durationSemesters: number
  totalCredits: number
  description: string
  isActive: boolean
  createdLabel: string
}

export type DepartmentOption = {
  id: string
  code: string
  name: string
  isActive: boolean
}

export type ProgramDetail = ProgramRow & {
  departmentCode: string
  departmentActive: boolean
}