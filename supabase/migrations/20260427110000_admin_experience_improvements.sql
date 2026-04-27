alter table public.photos
  add column if not exists sort_order integer not null default 0;

create index if not exists photos_sort_order_idx on public.photos (sort_order asc);

alter table public.contact_messages
  add column if not exists status text not null default 'new';

create index if not exists contact_messages_status_idx on public.contact_messages (status);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
