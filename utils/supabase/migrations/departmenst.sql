-- =============================================================================
-- NexusUni · Módulo académico, paso 1: departamentos
-- =============================================================================
-- Migración incremental: se puede ejecutar sobre la base actual.
--
-- Un departamento (o facultad) agrupa las carreras y los cursos que se crearán
-- en los pasos siguientes. Esas tablas apuntarán aquí con
-- "on delete restrict": un departamento con carreras o cursos no se puede
-- borrar, y la aplicación sugiere desactivarlo.
--
-- Seguridad (mismo criterio que el resto del proyecto):
--   * RLS activado.
--   * Cualquier usuario con sesión puede LEER los departamentos: sus nombres
--     no son sensibles y estudiantes y docentes los verán en cursos y carreras.
--   * NO hay políticas de insert/update/delete. Toda escritura la hace el
--     servidor con la service_role key, después de requireAdmin().
-- =============================================================================

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),

  -- El código va siempre en mayúsculas (la app ya lo convierte; esto lo garantiza)
  constraint departments_code_format check (code ~ '^[A-Z0-9-]{2,10}$'),
  constraint departments_name_length check (char_length(btrim(name)) between 3 and 100),
  constraint departments_description_length check (description is null or char_length(description) <= 500)
);

-- Los nombres de estas restricciones los usa la aplicación para decir si el
-- duplicado fue el código o el nombre. No los renombres sin ajustar el código.
create unique index departments_code_key on public.departments (code);
create unique index departments_name_key on public.departments (lower(btrim(name)));

alter table public.departments enable row level security;

create policy "Usuarios autenticados ven los departamentos" on public.departments
  for select to authenticated
  using (true);