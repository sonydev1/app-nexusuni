import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-md bg-slate-200 motion-reduce:animate-none dark:bg-slate-600/60',
        className
      )}
    />
  )
}

/* ---------- Configuración ---------- */

type BaseSection = {
  title?: boolean // dibuja el encabezado de la sección
  divider?: boolean // línea superior; por defecto solo desde la 2.ª sección
}

export type FieldsSection = BaseSection & {
  kind?: 'fields'
  fields: number // cantidad de campos
  columns?: 1 | 2 // columnas para los campos (por defecto 2)
  full?: number // cuántos campos iniciales ocupan todo el ancho
}

export type ListSection = BaseSection & {
  kind: 'list'
  rows: number // filas tipo "etiqueta + botón"
  note?: boolean // línea de texto pequeña al final
}

export type SkeletonSection = FieldsSection | ListSection

// Anchos fijos que se repiten en ciclo: se ve natural y no hay saltos entre renders
const LABEL_WIDTHS = ['w-28', 'w-36', 'w-24', 'w-32', 'w-40', 'w-20']
const TITLE_WIDTHS = ['w-36', 'w-40', 'w-28']

/* ---------- Piezas internas ---------- */

function Field({ index }: { index: number }) {
  return (
    <div className="space-y-1.5">
      <Skeleton className={cn('h-4', LABEL_WIDTHS[index % LABEL_WIDTHS.length])} />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  )
}

function FieldsBlock({ section }: { section: FieldsSection }) {
  const { fields, columns = 2, full = 0 } = section
  const fullCount = Math.min(full, fields)
  const gridCount = fields - fullCount

  return (
    <>
      {fullCount > 0 && (
        <div className="space-y-4">
          {Array.from({ length: fullCount }, (_, i) => (
            <Field key={i} index={i} />
          ))}
        </div>
      )}
      {gridCount > 0 && (
        <div className={cn('grid gap-4', columns === 2 && 'sm:grid-cols-2')}>
          {Array.from({ length: gridCount }, (_, i) => (
            <Field key={i} index={fullCount + i} />
          ))}
        </div>
      )}
    </>
  )
}

function ListBlock({ section }: { section: ListSection }) {
  return (
    <>
      <div className="space-y-2">
        {Array.from({ length: section.rows }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          >
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
      {section.note && <Skeleton className="h-3 w-full max-w-sm" />}
    </>
  )
}

/* ---------- Componente principal ---------- */

export function FormSkeleton({
  sections,
  button = true,
  label = 'Cargando…',
  className,
}: {
  sections: SkeletonSection[]
  button?: boolean // botón de envío al final
  label?: string // texto para lectores de pantalla
  className?: string
}) {
  return (
    <div role="status" aria-busy="true" className={cn('space-y-4', className)}>
      <span className="sr-only">{label}</span>

      {sections.map((section, i) => {
        const divider = section.divider ?? i > 0

        return (
          <div
            key={i}
            className={cn(
              'space-y-4',
              divider && 'border-t border-slate-200 pt-4 dark:border-slate-800'
            )}
          >
            {section.title && (
              <Skeleton className={cn('h-3', TITLE_WIDTHS[i % TITLE_WIDTHS.length])} />
            )}
            {section.kind === 'list' ? (
              <ListBlock section={section} />
            ) : (
              <FieldsBlock section={section} />
            )}
          </div>
        )
      })}

      {button && <Skeleton className="h-10 w-full rounded-lg" />}
    </div>
  )
}