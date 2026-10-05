-- Ejecutar en Supabase > SQL Editor
create table profiles (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('mentor','mentee')),
  name text not null,
  courses text[] not null,
  slots text[] not null,
  modality text not null default 'ambas' check (modality in ('presencial','virtual','ambas')),
  created_at timestamptz default now()
);
create table requests (
  id uuid primary key default gen_random_uuid(),
  mentee_id uuid references profiles(id),
  mentor_id uuid references profiles(id),
  course text not null,
  slot text not null,
  status text not null default 'pendiente' check (status in ('pendiente','confirmada','rechazada')),
  created_at timestamptz default now()
);
-- RLS activado sin políticas: solo el servidor (service key) accede.
alter table profiles enable row level security;
alter table requests enable row level security;
