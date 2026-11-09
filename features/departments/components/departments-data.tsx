import { connection } from 'next/server'
import { getDepartments } from '../services/queries'
import DepartmentsTable from './departments-table'

export default async function DepartmentsData() {
  await connection()
  const rows = await getDepartments()
  return <DepartmentsTable data={rows} />
}