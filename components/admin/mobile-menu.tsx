'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const DURATION = 300 // ms, debe coincidir con duration-300 de abajo

export default function MobileMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false) // existe en el DOM
  const [visible, setVisible] = useState(false) // aplica la animación
  const pathname = usePathname()

  // Cierra el cajón al navegar a otra página
  const [prevPath, setPrevPath] = useState(pathname)
  if (pathname !== prevPath) {
    setPrevPath(pathname)
    setOpen(false)
  }

  // Orquesta entrada y salida
  useEffect(() => {
    if (open) {
      setMounted(true)
      // Espera un frame para que el navegador pinte el estado inicial
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true))
      )
      return () => cancelAnimationFrame(id)
    } else {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), DURATION)
      return () => clearTimeout(t)
    }
  }, [open])

  // Escape y bloqueo de scroll del fondo
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mounted &&
        createPortal(
          <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
            {/* Fondo: aparece con fade */}
            <div
              onClick={() => setOpen(false)}
              className={`absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-300 ease-out motion-reduce:transition-none ${
                visible ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Panel: se desliza desde la izquierda */}
            <div
              className={`absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col overflow-y-auto bg-white p-4 shadow-xl transition-transform duration-300 ease-out motion-reduce:transition-none dark:bg-slate-900 ${
                visible ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="mb-2 self-end rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="min-h-0 flex-1">{children}</div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}