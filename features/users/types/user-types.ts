import { ProgramOption } from "@/features/programs/types/program-types";
import { UpdateUserValues } from "../schemas/users-schema"

export type UserRow = {
    id: string
    name: string
    email: string
    avatarPath: string | null
    document: string
    roles: string[]
    createdAt: string
    createdLabel: string
    disabled: boolean
    studentStatus: 'active' | 'inactive' | 'graduated' | null
    program: { id: string; code: string; name: string } | null
    deactivationReason: string | null
  }

  export type UserDetail = {
    id: string
    name: string
    email: string
    avatarPath: string | null
    roles: string[]
    disabled: boolean
    mustChangePassword: boolean
    document: string
    phone: string
    birthDate: string
    createdLabel: string
    lastSignIn: string
    deactivation: { reason: string; at: string; by: string } | null
    student: { code: string; status: string; admissionDate: string } | null
    teacher: { code: string; specialty: string; degree: string; hireDate: string } | null
    staff: { code: string; position: string; area: string; hireDate: string } | null
    program: { id: string; code: string; name: string } | null
  }

  export type EditUserData = {
  roles: string[]
  values: UpdateUserValues
  programOptions: ProgramOption[]
}
