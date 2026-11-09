import { connection } from 'next/server'
import { getDepartmentOptions } from '../services/queries'
import NewProgramButton from './new-program-button'

export default async function NewProgramAction() {
  await connection()
  const departments = await getDepartmentOptions()
  return <NewProgramButton departments={departments} />
}