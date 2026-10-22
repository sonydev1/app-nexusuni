'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, UserPlus } from 'lucide-react'
import Modal from '@/components/modal'
import CreateUserForm from './create-user-form'

export default function NewUserButton() {
  const [open, setOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const close = useCallback(() => setOpen(false), [])

  // El aviso se oculta solo a los 4 s
  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(t)
  }, [notice])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        <UserPlus className="h-4 w-4" />
        <span className="hidden sm:inline">Nuevo usuario</span>
        <span className="sm:hidden">Nuevo</span>
      </button>

      <Modal open={open} onClose={close} title="Nuevo usuario">
        <CreateUserForm
          onSuccess={(message) => {
            setOpen(false)
            setNotice(message)
          }}
        />
      </Modal>

      <AnimatePresence>
        {notice && (
          <motion.div
            role="status"
            className="alert-success fixed bottom-4 right-4 z-[60] max-w-sm shadow-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {notice}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}