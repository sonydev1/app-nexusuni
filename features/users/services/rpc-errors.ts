import 'server-only'

type PgError = { code?: string; message: string }

// Los errores propios de las funciones (código NX...) traen un mensaje pensado
// para mostrarse. Cualquier otro error se reemplaza por uno genérico.
export function rpcErrorMessage(
  error: PgError,
  fallback: string,
  overrides: Record<string, string> = {}
) {
  if (error.code && overrides[error.code]) return overrides[error.code]
  if (error.code?.startsWith('NX')) return error.message
  return fallback
}