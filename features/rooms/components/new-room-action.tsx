import { connection } from 'next/server'
import { buildingsOf, getRooms } from '../services/queries'
import NewRoomButton from './new-room-button'

export default async function NewRoomAction() {
  await connection()
  const rooms = await getRooms()
  return <NewRoomButton buildings={buildingsOf(rooms)} />
}