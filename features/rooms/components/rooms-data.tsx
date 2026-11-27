import { connection } from 'next/server'
import { buildingsOf, getRooms } from '../services/queries'
import RoomsTable from './rooms-table'

export default async function RoomsData() {
  await connection()
  const rooms = await getRooms()
  return <RoomsTable data={rooms} buildings={buildingsOf(rooms)} />
}