export type RecentUser = {
  id: string
  name: string
  avatarPath: string | null
  dateLabel: string
  roles: string[]
}

export type DashboardData = {
  totals: {
    users: number
    newThisMonth: number
    activeStudents: number
    teachers: number
  }
  roleCounts: { role: string; count: number }[]
  recent: RecentUser[]
}