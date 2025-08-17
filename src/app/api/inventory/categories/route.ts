import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

// GET - zwraca listę kategorii z Supabase
export async function GET() {
  try {
    const supabase = createSupabaseAdminClient() // klient z uprawnieniami serwisowymi
    const { data, error } = await supabase
      .from('inventory_categories') // pobierz dane z tabeli kategorii
      .select('payload') // interesuje nas tylko kolumna JSON
    if (error) throw error
    type Category = Record<string, unknown> // dowolna struktura kategorii
    const categories = (data ?? []).map((r: { payload: Category }) => r.payload as Category) // wyciągnięcie payloadu z rekordów
    return NextResponse.json(categories) // zwrócenie listy kategorii
  } catch {
    console.error('Błąd podczas odczytu kategorii')
    // Fallback: pusta lista zamiast 500
    return NextResponse.json([], { status: 200 })
  }
}

// POST - zastępuje wszystkie kategorie przekazanym payloadem
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient() // klient z uprawnieniami serwisowymi
    const categories = (await request.json()) as Record<string, unknown>[] // pełna lista kategorii z żądania
    const { error: delError } = await supabase
      .from('inventory_categories')
      .delete()
      .neq('id', null) // najpierw usuń wszystkie istniejące rekordy
    if (delError) throw delError
    const rows = categories.map((c) => ({ id: (c as { id: string }).id, payload: c })) // przygotowanie rekordów do wstawienia
    const { error } = await supabase
      .from('inventory_categories')
      .insert(rows) // wstaw nową listę kategorii
    if (error) throw error
    return NextResponse.json({ success: true, message: 'Kategorie zapisane pomyślnie' }) // informacja o sukcesie
  } catch {
    console.error('Błąd podczas zapisywania kategorii')
    return NextResponse.json(
      { success: false, message: 'Błąd podczas zapisywania kategorii' },
      { status: 500 }
    )
  }
}
