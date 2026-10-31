export function formatDate(value: string | null | undefined, opts: { time?: boolean } = {}) {
    if (!value) return ''
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value)
    const date = new Date(dateOnly ? `${value}T00:00:00Z` : value)
    if (Number.isNaN(date.getTime())) return ''
  
    return date.toLocaleString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...(opts.time && !dateOnly ? { hour: 'numeric', minute: '2-digit' } : {}),
      timeZone: dateOnly ? 'UTC' : 'America/Bogota',
    })
  }