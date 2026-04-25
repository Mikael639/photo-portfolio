create extension if not exists pgcrypto;

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  alt text not null,
  category text not null,
  image_url text not null,
  storage_path text,
  roles jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists photos_created_at_idx on public.photos (created_at desc);
create index if not exists photos_category_idx on public.photos (category);
create index if not exists photos_published_idx on public.photos (is_published);
create index if not exists photos_pinned_idx on public.photos (is_pinned);

alter table public.photos enable row level security;

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

drop policy if exists "Public can read published photos" on public.photos;
create policy "Public can read published photos"
  on public.photos
  for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Authenticated can manage photos" on public.photos;
create policy "Authenticated can manage photos"
  on public.photos
  for all
  to authenticated
  using (true)
  with check (true);

insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can read portfolio images" on storage.objects;
create policy "Public can read portfolio images"
  on storage.objects
  for select
  to public
  using (bucket_id = 'portfolio-images');

drop policy if exists "Authenticated can upload portfolio images" on storage.objects;
create policy "Authenticated can upload portfolio images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'portfolio-images');

drop policy if exists "Authenticated can update portfolio images" on storage.objects;
create policy "Authenticated can update portfolio images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'portfolio-images')
  with check (bucket_id = 'portfolio-images');

drop policy if exists "Authenticated can delete portfolio images" on storage.objects;
create policy "Authenticated can delete portfolio images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'portfolio-images');
