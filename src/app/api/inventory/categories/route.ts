import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

// Ogólny typ kategorii – tylko ID jest wymagane
type Category = { id?: string } & Record<string, unknown>

// GET - zwraca listę kategorii z Supabase
export async function GET() {
  try {
    const supabase = createSupabaseAdminClient() // klient z uprawnieniami serwisowymi
    const { data, error } = await supabase
      .from('inventory_categories')
      .select('payload')
    if (error) throw error
    const categories =
      data?.map((row: { payload: Category }) => row.payload as Category) ?? []
    return NextResponse.json(categories)
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

    // Przygotuj wiersze i zapewnij prawidłowe ID
    const rows = (body as Category[]).map((c) => {
      const id =
        typeof c.id === 'string' && c.id.trim()
          ? c.id
          : randomUUID()
      return { id, payload: { ...c, id } }
    })

    // Pobierz istniejące identyfikatory
    const { data: existingRows, error: selectError } = await supabase
      .from('inventory_categories')
      .select('id')
    if (selectError) throw selectError
    const existingIds = existingRows?.map((r) => r.id as string) ?? []

    // Wyznacz identyfikatory do usunięcia
    const incomingIds = new Set(rows.map((r) => r.id))
    const idsToDelete = existingIds.filter((id) => !incomingIds.has(id))

    if (idsToDelete.length) {
      const { error: deleteError } = await supabase
        .from('inventory_categories')
        .delete()
        .in('id', idsToDelete)
      if (deleteError) throw deleteError
    }

    // Upsert – dodaje nowe i aktualizuje istniejące wiersze
    if (rows.length) {
      const { error: upsertError } = await supabase
        .from('inventory_categories')
        .upsert(rows)
      if (upsertError) throw upsertError
    }

    return NextResponse.json({
      success: true,
      message: 'Kategorie zapisane pomyślnie',
      count: rows.length
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Nieznany błąd'
    console.error('Błąd podczas zapisywania kategorii:', message)
    return NextResponse.json(
      { success: false, message: `Błąd podczas zapisywania kategorii: ${message}` },
      { status: 500 }
    )
  }
}
