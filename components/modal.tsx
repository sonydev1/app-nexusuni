'use client'

import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  const titleId = useId()
  const [mounted, setMounted] = useState(false)

  // El portal solo existe en el cliente
  useEffect(() => setMounted(true), [])

  // Escape para cerrar y bloqueo del scroll del fondo
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    // reducedMotion="user": respeta la opción "reducir movimiento" del sistema
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            {/* Fondo */}
            <motion.div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
            />

            {/* Panel: hoja inferior en móvil, ventana centrada en escritorio */}
            <motion.div
              className="relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-xl dark:bg-slate-900 sm:max-w-2xl sm:rounded-2xl"
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.97 }}
              transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-6">
                <h2 id={titleId} className="text-lg font-semibold">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* El contenido hace scroll; el encabezado queda fijo */}
              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                {children}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MotionConfig>,
    document.body
  )
}