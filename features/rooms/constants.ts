export const ROOM_KINDS = ['classroom', 'laboratory', 'computer_lab', 'auditorium'] as const

export type RoomKind = (typeof ROOM_KINDS)[number]

export const ROOM_KIND_LABELS: Record<RoomKind, string> = {
  classroom: 'Aula',
  laboratory: 'Laboratorio',
  computer_lab: 'Sala de cómputo',
  auditorium: 'Auditorio',
}

export const ROOM_KIND_OPTIONS = ROOM_KINDS.map((value) => ({
  value,
  label: ROOM_KIND_LABELS[value],
}))