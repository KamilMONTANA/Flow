import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

// GET - zwraca listę sprzętu z Supabase
export async function GET() {
  try {
    const supabase = createSupabaseAdminClient() // klient z uprawnieniami serwisowymi
    const { data, error } = await supabase
      .from('inventory_equipment') // pobierz dane z tabeli sprzętu
      .select('payload') // interesuje nas tylko kolumna JSON
    if (error) throw error
    type Equipment = Record<string, unknown> // dowolna struktura sprzętu
    const equipment = (data ?? []).map((r: { payload: Equipment }) => r.payload as Equipment) // wyciągnięcie payloadu z rekordów
    return NextResponse.json(equipment) // zwrócenie listy sprzętu
  } catch {
    console.error('Błąd podczas odczytu sprzętu')
    // Fallback: pusta lista zamiast 500
    return NextResponse.json([], { status: 200 })
  }
}

// POST - zastępuje cały sprzęt przekazanym payloadem
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient() // klient z uprawnieniami serwisowymi
    const equipment = (await request.json()) as Record<string, unknown>[] // pełna lista sprzętu z żądania
    const { error: delError } = await supabase
      .from('inventory_equipment')
      .delete()
      .neq('id', null) // najpierw usuń wszystkie istniejące rekordy
    if (delError) throw delError
    const rows = equipment.map((e) => ({ id: (e as { id: string }).id, payload: e })) // przygotowanie rekordów do wstawienia
    const { error } = await supabase
      .from('inventory_equipment')
      .insert(rows) // wstaw nową listę sprzętu
    if (error) throw error
    return NextResponse.json({ success: true, message: 'Sprzęt zapisany pomyślnie' }) // informacja o sukcesie
  } catch {
    console.error('Błąd podczas zapisywania sprzętu')
    return NextResponse.json(
      { success: false, message: 'Błąd podczas zapisywania sprzętu' },
      { status: 500 }
    )
  }
}
