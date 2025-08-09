import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

// Wymuś dynamiczne wykonywanie tego route handlera (bez prerenderingu / exportu)
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

// Typ dla rezerwacji
type Booking = {
  id: string
  createdAt: string
  updatedAt: string
} & Record<string, unknown>

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase.from('campsite_bookings').select('payload')
    if (error) throw error
    const bookings = (data ?? []).map((r: { payload: Booking }) => r.payload)
    return NextResponse.json(bookings)
  } catch {
    console.error('Błąd podczas odczytu rezerwacji')
    // Fallback: pusta lista zamiast 500, aby UI mógł się renderować
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()
    const booking = await request.json()
    const newBooking: Booking = {
      ...booking,
      id: booking.id || Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const { error } = await supabase.from('campsite_bookings').insert({ id: newBooking.id, payload: newBooking })
    if (error) throw error
    return NextResponse.json({ success: true, message: 'Rezerwacja zapisana pomyślnie', booking: newBooking })
  } catch {
    console.error('Błąd podczas zapisywania rezerwacji')
    return NextResponse.json(
      { success: false, message: 'Błąd podczas zapisywania rezerwacji' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()
    const { id, ...updateData } = await request.json()
    const { data, error: selError } = await supabase
      .from('campsite_bookings')
      .select('payload')
      .eq('id', id)
      .single<{ payload: Booking }>()
    if (selError || !data) {
      return NextResponse.json(
        { success: false, message: 'Nie znaleziono rezerwacji' },
        { status: 404 }
      )
    }
    const updated: Booking = {
      ...data.payload,
      ...(updateData as Partial<Booking>),
      updatedAt: new Date().toISOString(),
    }
    const { error } = await supabase
      .from('campsite_bookings')
      .update({ payload: updated })
      .eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true, message: 'Rezerwacja zaktualizowana', booking: updated })
  } catch {
    console.error('Błąd podczas aktualizacji rezerwacji')
    return NextResponse.json(
      { success: false, message: 'Błąd podczas aktualizacji rezerwacji' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()
    let bookingId: string | undefined
    try {
      const body = await request.json()
      bookingId = body?.id
    } catch {
      // ignore
    }
    if (!bookingId) {
      const { searchParams } = new URL(request.url)
      bookingId = searchParams.get('id') ?? undefined
    }
    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: 'Brak identyfikatora rezerwacji' },
        { status: 400 }
      )
    }
    const { error } = await supabase.from('campsite_bookings').delete().eq('id', bookingId)
    if (error) throw error
    return NextResponse.json({ success: true, message: 'Rezerwacja usunięta' })
  } catch {
    console.error('Błąd podczas usuwania rezerwacji')
    return NextResponse.json(
      { success: false, message: 'Błąd podczas usuwania rezerwacji' },
      { status: 500 }
    )
  }
}