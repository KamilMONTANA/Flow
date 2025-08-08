-- Supabase schema for kayak and campsite reservation system

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- Reservations table
CREATE TABLE public.reservations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reservations_modtime
BEFORE UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Routes table
CREATE TABLE public.routes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    payload JSONB NOT NULL
);

-- Campsite spots table
CREATE TABLE public.campsite_spots (
    id TEXT PRIMARY KEY,
    payload JSONB NOT NULL
);

-- Campsite bookings table
CREATE TABLE public.campsite_bookings (
    id TEXT PRIMARY KEY,
    payload JSONB NOT NULL
);

-- Inventory tables (cars, categories, equipment)
CREATE TABLE public.inventory_cars (
    id TEXT PRIMARY KEY,
    payload JSONB NOT NULL
);

CREATE TABLE public.inventory_categories (
    id TEXT PRIMARY KEY,
    payload JSONB NOT NULL
);

CREATE TABLE public.inventory_equipment (
    id TEXT PRIMARY KEY,
    payload JSONB NOT NULL
);

-- Dashboard data (singleton)
CREATE TABLE public.dashboard_data (
    id TEXT PRIMARY KEY,
    payload JSONB NOT NULL
);

-- Document acceptances table
CREATE TABLE public.document_acceptances (
    acceptance_id TEXT GENERATED ALWAYS AS (payload->>'acceptance_id') STORED PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT GENERATED ALWAYS AS (payload->>'type') STORED,
    version TEXT GENERATED ALWAYS AS (payload->>'version') STORED,
    accepted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    payload JSONB NOT NULL
);

-- Create GIN indexes for JSONB columns
CREATE INDEX idx_reservations_payload_gin ON public.reservations USING GIN(payload);
CREATE INDEX idx_routes_payload_gin ON public.routes USING GIN(payload);
CREATE INDEX idx_routes_route_index ON public.routes ((payload->>'Trasa'));

CREATE INDEX idx_campsite_spots_payload_gin ON public.campsite_spots USING GIN(payload);
CREATE INDEX idx_campsite_bookings_payload_gin ON public.campsite_bookings USING GIN(payload);
CREATE INDEX idx_inventory_cars_payload_gin ON public.inventory_cars USING GIN(payload);
CREATE INDEX idx_inventory_categories_payload_gin ON public.inventory_categories USING GIN(payload);
CREATE INDEX idx_inventory_equipment_payload_gin ON public.inventory_equipment USING GIN(payload);
CREATE INDEX idx_dashboard_data_payload_gin ON public.dashboard_data USING GIN(payload);
CREATE INDEX idx_document_acceptances_payload_gin ON public.document_acceptances USING GIN(payload);

-- Enable Row Level Security
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campsite_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campsite_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_acceptances ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Routes: Public SELECT, Service Role full access
CREATE POLICY "Routes can be read publicly" ON public.routes
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Full access for service role" ON public.routes
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Reservations: Strict service role access
CREATE POLICY "Full access for service role" ON public.reservations
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Campsite Spots: Public SELECT, Service Role full access
CREATE POLICY "Campsite spots can be read publicly" ON public.campsite_spots
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Full access for service role" ON public.campsite_spots
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Campsite Bookings: Strict service role access
CREATE POLICY "Full access for service role" ON public.campsite_bookings
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Inventory tables: Strict service role access
CREATE POLICY "Full access for service role" ON public.inventory_cars
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Full access for service role" ON public.inventory_categories
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Full access for service role" ON public.inventory_equipment
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Dashboard Data: Strict service role access
CREATE POLICY "Full access for service role" ON public.dashboard_data
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Document Acceptances:
-- Insert for anon/authenticated, SELECT only for authenticated
CREATE POLICY "Users can insert document acceptances" ON public.document_acceptances
FOR INSERT TO anon, authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own document acceptances" ON public.document_acceptances
FOR SELECT TO authenticated
USING (user_id = auth.uid());

