import { connection } from 'next/server'
import { getTerms } from '../services/queries'
import TermsTable from './terms-table'

export default async function TermsData() {
  await connection()
  const terms = await getTerms()
  return <TermsTable data={terms} />
}