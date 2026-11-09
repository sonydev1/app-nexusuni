-- =============================================================================
-- NexusUni · Módulo académico, paso 2: carreras (programas)
-- =============================================================================
-- Migración incremental: se puede ejecutar sobre la base actual.
-- Requiere la migración de departamentos (20261030000000_departments.sql).
--
-- Una carrera pertenece a un departamento. En pasos posteriores:
--   * el plan de estudios (carrera <-> cursos) apuntará aquí,
--   * students.program_id apuntará aquí.
-- Esas relaciones usarán "on delete restrict": una carrera con estudiantes o
-- con plan de estudios no se podrá borrar, solo desactivar.
--
-- total_credits es la META de créditos de la carrera. Más adelante se comparará
-- con la suma de los créditos de los cursos de su plan de estudios.
--
-- Seguridad (mismo criterio que el resto del proyecto):
--   * RLS activado; cualquier usuario con sesión puede LEER las carreras.
--   * NO hay políticas de escritura: escribe solo el servidor (service_role),
--     después de requireAdmin().
-- =============================================================================

create type public.program_level as enum (
  'technical',       -- técnico o tecnólogo
  'undergraduate',   -- pregrado
  'specialization',  -- especialización
  'master',          -- maestría
  'doctorate'        -- doctorado
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  department_id uuid not null references public.departments (id) on delete restrict,
  level public.program_level not null default 'undergraduate',
  duration_semesters smallint not null,
  total_credits smallint not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),

  constraint programs_code_format check (code ~ '^[A-Z0-9-]{2,10}$'),
  constraint programs_name_length check (char_length(btrim(name)) between 3 and 120),
  constraint programs_duration_range check (duration_semesters between 1 and 20),
  constraint programs_credits_range check (total_credits between 1 and 400),
  constraint programs_description_length check (description is null or char_length(description) <= 500)
);

-- Los nombres de estos índices los usa la aplicación para decir qué se duplicó.
-- No los renombres sin ajustar el código.
create unique index programs_code_key on public.programs (code);
-- Mismo nombre solo se permite en niveles distintos
-- (p. ej. una especialización y una maestría con el mismo título).
create unique index programs_name_level_key on public.programs (lower(btrim(name)), level);
-- Postgres no indexa las claves foráneas por sí solo
create index programs_department_idx on public.programs (department_id);

alter table public.programs enable row level security;

create policy "Usuarios autenticados ven las carreras" on public.programs
  for select to authenticated
  using (true);