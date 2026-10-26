'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import CreateUserForm from './create-user-form'

export default function NewUserButton() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo usuario</span>
          <span className="sm:hidden">Nuevo</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuevo usuario</DialogTitle>
          <DialogDescription>
            La cuenta se crea con una contraseña temporal.
          </DialogDescription>
        </DialogHeader>

        <CreateUserForm
          onSuccess={(message) => {
            setOpen(false)
            toast.success(message)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}