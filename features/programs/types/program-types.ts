import type { ProgramLevel, ProgramModality } from '../constants'

export type ProgramRow = {
  id: string
  code: string
  sniesCode: string 
  name: string
  departmentId: string
  departmentName: string
  level: ProgramLevel
  modality: ProgramModality
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

export type ProgramOption = {
  id: string
  code: string
  name: string
  isActive: boolean
}