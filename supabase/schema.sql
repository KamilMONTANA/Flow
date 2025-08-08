-- Supabase schema for reservation-system

-- Reservations for /api/data
create table if not exists public.reservations (
  id bigint primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists reservations_payload_gin on public.reservations using gin (payload);

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


