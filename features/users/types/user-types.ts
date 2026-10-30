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
    deactivationReason: string | null
  }

  export type EditUserData = {
    roles: string[]
    values: UpdateUserValues
  }