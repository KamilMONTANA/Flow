-- Supabase schema for reservation-system

-- Reservations for /api/data
create table if not exists public.reservations (
  id bigint primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists reservations_payload_gin on public.reservations using gin (payload);
-- Szybki filtr po polu JSON "Trasa" wykorzystywany w API
create index if not exists reservations_trasa_idx on public.reservations ((payload->>'Trasa'));

-- Inventory: cars, categories, equipment
create table if not exists public.cars (
  id text primary key,
  payload jsonb not null
);
create index if not exists cars_payload_gin on public.cars using gin (payload);

create table if not exists public.categories (
  id text primary key,
  payload jsonb not null
);
create index if not exists categories_payload_gin on public.categories using gin (payload);

create table if not exists public.equipment (
  id text primary key,
  payload jsonb not null
);
create index if not exists equipment_payload_gin on public.equipment using gin (payload);

-- Campsites
create table if not exists public.campsite_spots (
  id text primary key,
  payload jsonb not null
);
create index if not exists campsite_spots_payload_gin on public.campsite_spots using gin (payload);

create table if not exists public.campsite_bookings (
  id text primary key,
  payload jsonb not null
);
create index if not exists campsite_bookings_payload_gin on public.campsite_bookings using gin (payload);

-- Dashboard data (singleton)
create table if not exists public.dashboard_data (
  id text primary key,
  payload jsonb not null
);

-- Kayak routes (used by DataTable filters and booking.Trasa)
create table if not exists public.routes (
  id bigint primary key,
  payload jsonb not null
);
create index if not exists routes_payload_gin on public.routes using gin (payload);


-- Document acceptances (umowy/regulaminy)
create table if not exists public.document_acceptances (
  acceptance_id text primary key,
  user_id text,
  type text not null check (type in ('campsite','kayak')),
  version text not null,
  accepted_at timestamptz not null,
  user_agent text,
  ip text,
  document_hash text,
  first_name text,
  last_name text,
  email text,
  phone text
);
create index if not exists document_acceptances_user on public.document_acceptances (user_id);
create index if not exists document_acceptances_type on public.document_acceptances (type);
create index if not exists document_acceptances_version on public.document_acceptances (version);
create index if not exists document_acceptances_email on public.document_acceptances (email);
create index if not exists document_acceptances_phone on public.document_acceptances (phone);

-- =====================================
-- RLS, triggery i funkcje pomocnicze
-- =====================================

-- Funkcja do automatycznej aktualizacji kolumny updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Włącz Row Level Security na wszystkich tabelach
alter table if exists public.reservations enable row level security;
alter table if exists public.cars enable row level security;
alter table if exists public.categories enable row level security;
alter table if exists public.equipment enable row level security;
alter table if exists public.campsite_spots enable row level security;
alter table if exists public.campsite_bookings enable row level security;
alter table if exists public.dashboard_data enable row level security;
alter table if exists public.routes enable row level security;
alter table if exists public.document_acceptances enable row level security;

-- Domyślnie: brak polityk (wszystko zabronione). Serwis używa service_role, który omija RLS.
-- Opcjonalnie: odkomentuj poniższe polityki, jeśli chcesz publiczny odczyt wybranych tabel.

-- Przykład: publiczny odczyt listy tras i miejsc kempingowych
-- create policy if not exists "public select routes" on public.routes
--   for select to anon using (true);
-- create policy if not exists "public select campsite_spots" on public.campsite_spots
--   for select to anon using (true);

-- Akceptacje dokumentów: zezwól na insert z klienta (anon lub authenticated), select tylko dla roli authenticated
drop policy if exists "insert acceptances" on public.document_acceptances;
create policy "insert acceptances" on public.document_acceptances
  for insert to anon, authenticated
  with check (true);

drop policy if exists "select acceptances for authenticated" on public.document_acceptances;
create policy "select acceptances for authenticated" on public.document_acceptances
  for select to authenticated
  using (true);

-- Triggery updated_at
drop trigger if exists trg_reservations_updated_at on public.reservations;
create trigger trg_reservations_updated_at
  before update on public.reservations
  for each row execute function public.set_updated_at();

