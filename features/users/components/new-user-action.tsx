import { connection } from 'next/server'
import { getProgramOptions } from '@/features/programs/services/queries'
import NewUserButton from './new-user-button'

export default async function NewUserAction() {
  await connection()
  const programs = await getProgramOptions()
  return <NewUserButton  programs={programs} />
}