import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

// GET - zwraca listę samochodów z Supabase
export async function GET() {
  try {
    const supabase = createSupabaseAdminClient() // klient z uprawnieniami serwisowymi
    const { data, error } = await supabase
      .from('inventory_cars') // pobierz dane z tabeli samochodów
      .select('payload') // interesuje nas tylko kolumna JSON
    if (error) throw error
    type Car = Record<string, unknown> // dowolna struktura samochodu
    const cars = (data ?? []).map((r: { payload: Car }) => r.payload as Car) // wyciągnięcie payloadu z rekordów
    return NextResponse.json(cars) // zwrócenie listy samochodów
  } catch (e) {
    console.error('Błąd podczas odczytu samochodów', e)
    // Fallback: pusta lista zamiast 500
    return NextResponse.json([], { status: 200 })
  }
}

// POST - zastępuje wszystkie samochody przekazanym payloadem
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient() // klient z uprawnieniami serwisowymi
    const cars = (await request.json()) as Record<string, unknown>[] // pełna lista samochodów z żądania
    // Kontrakt: zapis pełnej listy
    const { error: delError } = await supabase
      .from('inventory_cars')
      .delete()
      .neq('id', null) // najpierw usuń wszystkie istniejące rekordy
    if (delError) throw delError
    const rows = cars.map((c) => ({ id: (c as { id: string }).id, payload: c })) // przygotowanie rekordów do wstawienia
    const { error } = await supabase
      .from('inventory_cars')
      .insert(rows) // wstaw nową listę samochodów
    if (error) throw error
    return NextResponse.json({ success: true, message: 'Samochody zapisane pomyślnie' }) // informacja o sukcesie
  } catch {
    console.error('Błąd podczas zapisywania samochodów')
    return NextResponse.json(
      { success: false, message: 'Błąd podczas zapisywania samochodów' },
      { status: 500 }
    )
  }
}
