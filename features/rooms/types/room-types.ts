import type { RoomKind } from '../constants'

export type RoomRow = {
  id: string
  code: string
  name: string
  building: string // vacío si no tiene
  kind: RoomKind
  capacity: number
  isActive: boolean
  createdLabel: string
}