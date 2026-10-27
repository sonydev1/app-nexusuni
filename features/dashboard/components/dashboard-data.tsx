import { connection } from 'next/server'
import { getDashboardData } from '../services/queries'
import RecentUsers from './recent-users'
import RoleDistribution from './role-distribution'
import StatsGrid from './stats-grid'

export default async function DashboardData() {
  await connection()
  const data = await getDashboardData()

  return (
    <>
      <StatsGrid totals={data.totals} />

      <div className="grid gap-6 lg:grid-cols-5">
        <RoleDistribution counts={data.roleCounts} className="lg:col-span-2" />
        <RecentUsers users={data.recent} className="lg:col-span-3" />
      </div>
    </>
  )
}