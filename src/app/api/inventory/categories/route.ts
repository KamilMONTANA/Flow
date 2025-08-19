import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

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
    const body = await request.json()

    // Walidacja: oczekujemy tablicy kategorii
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: 'Payload musi być tablicą kategorii' },
        { status: 400 }
      )
    }

    type Category = { id?: string } & Record<string, unknown>
    const rows = (body as Category[]).map((c) => {
      // Upewnij się, że każda kategoria ma poprawne ID
      const id = (typeof c.id === 'string' && c.id.trim().length > 0) ? c.id : randomUUID()
      return { id, payload: { ...c, id } }
    })

<<<<<<< Updated upstream
<<<<<<< Updated upstream
    // Usuń wszystkie istniejące kategorie, aby zapis odzwierciedlał dokładnie
    // to, co przesłano z klienta. Dzięki temu usunięcia w UI są również
    // propagowane do Supabase.
    const { error: delError } = await supabase
      .from('inventory_categories')
      .delete()
      .neq('id', null)
    if (delError) throw delError

    // Wstaw nową listę kategorii
=======
=======
>>>>>>> Stashed changes
    // Najpierw usuń kategorie, których nie ma w nowej liście
    const newIds = rows.map(row => row.id)
    if (newIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('inventory_categories')
        .delete()
        .not('id', 'in', newIds)
      if (deleteError) throw deleteError
    }

    // Upsert zamiast kasowania wszystkiego – bezpieczniejsze i atomowe per wiersz
>>>>>>> Stashed changes
    const { error } = await supabase
      .from('inventory_categories')
      .insert(rows)
    if (error) throw error

    return NextResponse.json({ success: true, message: 'Kategorie zapisane pomyślnie', count: rows.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Nieznany błąd'
    console.error('Błąd podczas zapisywania kategorii:', message)
    return NextResponse.json(
      { success: false, message: `Błąd podczas zapisywania kategorii: ${message}` },
      { status: 500 }
    )
  }
}
