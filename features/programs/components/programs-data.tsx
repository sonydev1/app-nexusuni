import { connection } from 'next/server'
import { getDepartmentOptions, getPrograms } from '../services/queries'
import ProgramsTable from './programs-table'

export default async function ProgramsData() {
  await connection()
  const [programs, departments] = await Promise.all([getPrograms(), getDepartmentOptions()])
  return <ProgramsTable data={programs} departments={departments} />
}