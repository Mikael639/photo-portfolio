create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  phone text,
  service_type text not null,
  preferred_contact text not null default 'Email',
  budget text not null default 'A definir',
  event_date date,
  location text,
  reference_link text,
  project text not null,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;
