import { NextRequest, NextResponse } from 'next/server'
import type { Booking } from '@/types/booking'
import { bookingSchema } from '@/types/booking'
import type { Equipment } from '@/types/inventory'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

/**
 * Dedykowana baza dla /reservations:
 * Plik: src/app/api/data/reservations.json
 * Endpointy:
 *  - GET  /api/data              -> odczyt listy rezerwacji
 *  - POST /api/data              -> pełny zapis całej listy (overwrite)
 *  - PUT  /api/data              -> częściowa aktualizacja jednego rekordu po id
 *  - DELETE /api/data?id={id}    -> usunięcie jednego rekordu po id
 */

async function checkKayakAvailability(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  booking: Booking
) {
  try {
    const { data: equipmentRows } = await supabase
      .from('equipment')
      .select('payload')
    const equipment = (equipmentRows ?? []).map(
      (r: { payload: Equipment }) => r.payload
    )
    const totalTwo = equipment
      .filter(
        (e) => e.name.toLowerCase().includes('dwu') || e.name.includes('2')
      )
      .reduce((sum, e) => sum + (e.quantity || 0), 0)
    const totalOne = equipment
      .filter(
        (e) => e.name.toLowerCase().includes('jedn') || e.name.includes('1')
      )
      .reduce((sum, e) => sum + (e.quantity || 0), 0)

    const { data: existingRows } = await supabase
      .from('reservations')
      .select('payload')
    const sameDay = (existingRows ?? [])
      .map((r: { payload: Booking }) => r.payload)
      .filter((b) => b.Data === booking.Data && b.id !== booking.id)

    const reservedTwo = sameDay.reduce(
      (sum, b) => sum + (Number(b.dwuosobowe) || 0),
      0
    )
    const reservedOne = sameDay.reduce(
      (sum, b) => sum + (Number(b.jednoosobowe) || 0),
      0
    )

    const availableTwo = totalTwo - reservedTwo
    const availableOne = totalOne - reservedOne

    if ((booking.dwuosobowe || 0) > availableTwo) {
      return {
        ok: false,
        message: `Brak dostępnych kajaków dwuosobowych na ten dzień. Pozostało ${availableTwo}`,
      }
    }
    if ((booking.jednoosobowe || 0) > availableOne) {
      return {
        ok: false,
        message: `Brak dostępnych kajaków jednoosobowych na ten dzień. Pozostało ${availableOne}`,
      }
    }
    return { ok: true }
  } catch {
    // W razie problemów z odczytem danych nie blokuj zapisu
    return { ok: true }
  }
}

export async function GET() {
  try {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('reservations')
        .select('payload')
        .order('created_at', { ascending: true })

      if (error) throw error

      const bookings = (data ?? []).map((row: { payload: Booking }) => row.payload)
      return NextResponse.json(bookings)
  } catch (error) {
    console.error('Błąd podczas odczytu danych:', error)
    // Fallback bez Supabase / w razie błędu: zwróć pustą listę ze statusem 200,
    // aby UI mógł się załadować bez Internal Server Error.
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    // Zgodność z istniejącym kontraktem: POST przyjmuje pełną listę rezerwacji (overwrite)
    if (Array.isArray(body)) {
      // Usuń wszystko i wstaw nowy snapshot
      const { error: delError } = await supabase.from('reservations').delete().neq('id', null)
      if (delError) throw delError

      const rows = body.map((b: Booking) => ({ id: b.id, payload: b }))
      const { error: insError } = await supabase.from('reservations').insert(rows)
      if (insError) throw insError
      return NextResponse.json({ success: true, message: 'Dane zapisane pomyślnie' })
    }

    // Alternatywnie: pojedynczy rekord
    if (!Array.isArray(body)) {
      const result = bookingSchema.partial().safeParse(body)
      if (!result.success) {
        return NextResponse.json(
          { success: false, message: 'Validation failed', details: result.error.issues },
          { status: 400 }
        )
      }
    }

    const incoming = body as Partial<Booking>
    const id = typeof incoming.id === 'number' ? incoming.id : Date.now()
    const nowIso = new Date().toISOString()
    const payload: Booking = {
      ...(incoming as Booking),
      id,
      createdAt: incoming.createdAt ?? nowIso,
      updatedAt: nowIso,
    }

    const availability = await checkKayakAvailability(supabase, payload)
    if (!availability.ok) {
      return NextResponse.json(
        { success: false, message: availability.message },
        { status: 400 }
      )
    }

    const { error } = await supabase.from('reservations').upsert({ id, payload })
    if (error) throw error
    return NextResponse.json({ success: true, message: 'Rezerwacja zapisana pomyślnie', booking: payload })
  } catch (error) {
    console.error('Błąd podczas zapisywania danych:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas zapisywania danych' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const partial = await request.json()
    const { id } = partial
    if (typeof id !== 'number' && typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Brak prawidłowego identyfikatora id' },
        { status: 400 }
      )
    }
    const numericId = typeof id === 'number' ? id : Number(id)
    const supabase = createServerSupabaseClient()
      const { data: row, error: selError } = await supabase
        .from('reservations')
        .select('payload')
        .eq('id', numericId)
        .single<{ payload: Booking }>()
      if (selError || !row) {
        return NextResponse.json(
          { success: false, message: 'Nie znaleziono rekordu' },
          { status: 404 }
        )
      }
      const merged: Booking = {
        ...row.payload,
        ...partial,
        updatedAt: new Date().toISOString(),
      }

    const availability = await checkKayakAvailability(supabase, merged)
    if (!availability.ok) {
      return NextResponse.json(
        { success: false, message: availability.message },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('reservations')
      .update({ payload: merged })
      .eq('id', numericId)
    if (error) throw error
    return NextResponse.json({ success: true, message: 'Zaktualizowano rekord', booking: merged })
  } catch (error) {
    console.error('Błąd podczas częściowej aktualizacji danych:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas aktualizacji danych' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get('id')
    if (!idParam) {
      return NextResponse.json(
        { success: false, message: 'Brak parametru id' },
        { status: 400 }
      )
    }
    const id = Number(idParam)
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from('reservations').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true, message: 'Usunięto rekord' })
  } catch (error) {
    console.error('Błąd podczas usuwania rekordu:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas usuwania rekordu' },
      { status: 500 }
    )
  }
}