-- Tworzenie tabel z kluczem tekstowym i ładunkiem JSONB
CREATE TABLE public.inventory_categories (
    id TEXT PRIMARY KEY,
    payload JSONB NOT NULL
);

CREATE TABLE public.inventory_equipment (
    id TEXT PRIMARY KEY,
    payload JSONB NOT NULL
);

CREATE TABLE public.inventory_cars (
    id TEXT PRIMARY KEY,
    payload JSONB NOT NULL
);

-- Indeksy GIN dla wydajnego wyszukiwania w JSONB
CREATE INDEX idx_categories_payload ON public.inventory_categories USING GIN (payload);
CREATE INDEX idx_equipment_payload ON public.inventory_equipment USING GIN (payload);
CREATE INDEX idx_cars_payload ON public.inventory_cars USING GIN (payload);

-- Włączenie RLS
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_cars ENABLE ROW LEVEL SECURITY;

-- Polityki RLS dla klucza serwisowego
CREATE POLICY "Full access for service role"
ON public.inventory_categories
FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Full access for service role"
ON public.inventory_equipment
FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Full access for service role"
ON public.inventory_cars
FOR ALL TO service_role
USING (true) WITH CHECK (true);
