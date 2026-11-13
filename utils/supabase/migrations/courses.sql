-- =============================================================================
-- NexusUni · Módulo académico, paso 3: cursos y prerrequisitos
-- =============================================================================
-- Migración incremental: se puede ejecutar sobre la base actual.
-- Requiere 20261030000000_departments.sql.
--
-- courses
--   Un curso pertenece a un departamento (el que lo dicta). Los créditos y las
--   horas semanales son del curso, no de la carrera: valen lo mismo en todos
--   los planes de estudio donde aparezca.
--
-- course_prerequisites
--   "course_id requiere haber aprobado prerequisite_id".
--   * Si se borra un curso, se borran SUS prerrequisitos (cascade).
--   * Un curso que es prerrequisito de otro NO se puede borrar (restrict).
--   * Un curso no puede ser prerrequisito de sí mismo.
--   * No se permiten ciclos (A requiere B y B requiere A, o cadenas más
--     largas): lo impide un trigger.
--
-- admin_save_course
--   Crea o actualiza un curso Y reemplaza su lista de prerrequisitos en una
--   sola transacción. Si algo falla, no se guarda nada.
--
-- Seguridad (mismo criterio que el resto del proyecto):
--   * RLS activado; cualquier usuario con sesión puede LEER.
--   * NO hay políticas de escritura: escribe solo el servidor (service_role),
--     después de requireAdmin().
--   * admin_save_course solo la puede ejecutar service_role.
--
-- Errores propios (SQLSTATE, mensaje en español pensado para mostrarse):
--   NX404  el curso ya no existe
--   NX422  regla de negocio incumplida (departamento inactivo, ciclo, etc.)
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Tablas
-- -----------------------------------------------------------------------------

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  department_id uuid not null references public.departments (id) on delete restrict,
  credits smallint not null,
  weekly_hours smallint not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),

  constraint courses_code_format check (code ~ '^[A-Z0-9-]{3,12}$'),
  constraint courses_name_length check (char_length(btrim(name)) between 3 and 120),
  constraint courses_credits_range check (credits between 1 and 12),
  constraint courses_hours_range check (weekly_hours between 1 and 40),
  constraint courses_description_length check (description is null or char_length(description) <= 500)
);

-- Los nombres de estos índices los usa la aplicación para decir qué se duplicó.
-- No los renombres sin ajustar el código.
create unique index courses_code_key on public.courses (code);
create unique index courses_name_department_key
  on public.courses (lower(btrim(name)), department_id);
create index courses_department_idx on public.courses (department_id);

create table public.course_prerequisites (
  course_id uuid not null references public.courses (id) on delete cascade,
  prerequisite_id uuid not null references public.courses (id) on delete restrict,
  primary key (course_id, prerequisite_id),
  constraint course_prerequisites_not_self check (course_id <> prerequisite_id)
);

-- Para buscar rápido "¿de qué cursos es prerrequisito este?"
create index course_prerequisites_prerequisite_idx
  on public.course_prerequisites (prerequisite_id);


-- -----------------------------------------------------------------------------
-- Anti-ciclos
-- -----------------------------------------------------------------------------
-- Al agregar "C requiere P", hay ciclo si P (directa o indirectamente) ya
-- requiere C. El bloqueo de asesoría serializa las inserciones para que dos
-- personas no puedan crear A->B y B->A a la vez.

create or replace function public.prevent_prerequisite_cycle()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext('course_prerequisites'));

  if exists (
    with recursive chain (id) as (
      select cp.prerequisite_id
        from public.course_prerequisites cp
       where cp.course_id = new.prerequisite_id
      union
      select cp.prerequisite_id
        from public.course_prerequisites cp
        join chain on cp.course_id = chain.id
    )
    select 1 from chain where id = new.course_id
  ) then
    raise exception 'Ese prerrequisito crearía un ciclo: ya depende de este curso'
      using errcode = 'NX422';
  end if;

  return new;
end;
$$;

create trigger course_prerequisites_no_cycle
  before insert or update on public.course_prerequisites
  for each row execute function public.prevent_prerequisite_cycle();


-- -----------------------------------------------------------------------------
-- admin_save_course: crear o actualizar curso + reemplazar prerrequisitos
-- -----------------------------------------------------------------------------
-- p_id null  -> crea. p_id con valor -> actualiza ese curso.
-- p_data: code, name, department_id, credits, weekly_hours, description,
--         prerequisite_ids (arreglo de uuid).
-- Devuelve el id del curso.

create or replace function public.admin_save_course(p_id uuid, p_data jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid := p_id;
  v_department uuid := (p_data ->> 'department_id')::uuid;
  v_current_department uuid;
  v_prereqs uuid[];
begin
  select coalesce(array_agg(distinct x::uuid), '{}'::uuid[])
    into v_prereqs
    from jsonb_array_elements_text(
           coalesce(p_data -> 'prerequisite_ids', '[]'::jsonb)
         ) as t (x);

  -- El curso (si se está editando) y su departamento actual
  if v_id is not null then
    select department_id
      into v_current_department
      from public.courses
     where id = v_id
       for update;
    if not found then
      raise exception 'El curso ya no existe' using errcode = 'NX404';
    end if;
  end if;

  -- El departamento debe estar activo al crear o al cambiarlo
  if v_id is null or v_current_department is distinct from v_department then
    if not exists (
      select 1 from public.departments where id = v_department and is_active
    ) then
      raise exception 'El departamento no existe o está inactivo' using errcode = 'NX422';
    end if;
  end if;

  -- Reglas de los prerrequisitos
  if cardinality(v_prereqs) > 10 then
    raise exception 'Máximo 10 prerrequisitos' using errcode = 'NX422';
  end if;

  if v_id is not null and v_id = any (v_prereqs) then
    raise exception 'Un curso no puede ser su propio prerrequisito' using errcode = 'NX422';
  end if;

  if (select count(*) from public.courses where id = any (v_prereqs))
       <> cardinality(v_prereqs) then
    raise exception 'Alguno de los prerrequisitos ya no existe' using errcode = 'NX422';
  end if;

  -- Los prerrequisitos nuevos deben estar activos (los que ya estaban se conservan)
  if exists (
    select 1
      from public.courses c
     where c.id = any (v_prereqs)
       and not c.is_active
       and (
         v_id is null
         or c.id not in (
           select prerequisite_id from public.course_prerequisites where course_id = v_id
         )
       )
  ) then
    raise exception 'Solo se pueden agregar prerrequisitos activos' using errcode = 'NX422';
  end if;

  -- El curso
  if v_id is null then
    insert into public.courses (code, name, department_id, credits, weekly_hours, description)
    values (
      p_data ->> 'code',
      btrim(p_data ->> 'name'),
      v_department,
      (p_data ->> 'credits')::smallint,
      (p_data ->> 'weekly_hours')::smallint,
      nullif(btrim(p_data ->> 'description'), '')
    )
    returning id into v_id;
  else
    update public.courses
       set code         = p_data ->> 'code',
           name         = btrim(p_data ->> 'name'),
           department_id = v_department,
           credits      = (p_data ->> 'credits')::smallint,
           weekly_hours = (p_data ->> 'weekly_hours')::smallint,
           description  = nullif(btrim(p_data ->> 'description'), '')
     where id = v_id;
  end if;

  -- Sus prerrequisitos: se reemplaza la lista completa. El trigger de ciclos
  -- se ejecuta en cada inserción.
  delete from public.course_prerequisites where course_id = v_id;

  insert into public.course_prerequisites (course_id, prerequisite_id)
  select v_id, p from unnest(v_prereqs) as p;

  return v_id;
end;
$$;

revoke execute on function public.admin_save_course(uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.admin_save_course(uuid, jsonb) to service_role;


-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

alter table public.courses enable row level security;
alter table public.course_prerequisites enable row level security;

create policy "Usuarios autenticados ven los cursos" on public.courses
  for select to authenticated
  using (true);

create policy "Usuarios autenticados ven los prerrequisitos" on public.course_prerequisites
  for select to authenticated
  using (true);