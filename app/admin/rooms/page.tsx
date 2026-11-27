import { Suspense } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import NewRoomAction from '@/features/rooms/components/new-room-action'
import RoomsData from '@/features/rooms/components/rooms-data'
import RoomsSkeleton from '@/features/rooms/components/rooms-skeleton'

export default function RoomsPage() {
  return (
    <main className="space-y-6 p-4 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Aulas</h1>
          <p className="muted text-sm">
            Espacios donde se dictan las clases. Los horarios de las secciones se asignan a un aula.
          </p>
        </div>

        <Suspense
          fallback={
            <Button disabled>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva aula</span>
              <span className="sm:hidden">Nueva</span>
            </Button>
          }
        >
          <NewRoomAction />
        </Suspense>
      </div>

      <Suspense fallback={<RoomsSkeleton />}>
        <RoomsData />
      </Suspense>
    </main>
  )
}