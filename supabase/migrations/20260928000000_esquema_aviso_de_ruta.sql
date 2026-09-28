-- Esquema de Aviso de Ruta (w07). A propósito, ninguna tabla tiene una
-- columna que identifique a un chofer específico ni un historial por
-- persona-conductor: es una decisión de diseño, no una política, y cumple
-- la Condición 5 del Blueprint del equipo (frontera de datos del
-- trabajador) y el shadow (extracción de conocimiento / vigilancia).

create table if not exists excepciones (
  id uuid primary key default gen_random_uuid(),
  ruta_id text not null,
  parada_id text,
  descripcion text not null,
  lat double precision not null,
  lng double precision not null,
  alias_reportante text not null,
  retirado boolean not null default false,
  verificado_manual boolean not null default false,
  creado_en timestamptz not null default now(),
  expira_en timestamptz not null
);

create table if not exists confirmaciones (
  id uuid primary key default gen_random_uuid(),
  excepcion_id uuid not null references excepciones(id) on delete cascade,
  alias text not null,
  creado_en timestamptz not null default now(),
  unique (excepcion_id, alias)
);

create index if not exists idx_excepciones_ruta on excepciones(ruta_id);
create index if not exists idx_confirmaciones_excepcion on confirmaciones(excepcion_id);

-- RLS activado, sin policies para anon/authenticated: toda lectura y
-- escritura pasa por el servidor con la Service Role Key (crearClienteSupabaseServidor).
alter table excepciones enable row level security;
alter table confirmaciones enable row level security;
