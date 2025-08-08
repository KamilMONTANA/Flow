import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
 
// Minimalny typ danych rezerwacji zgodny z /api/data model
type BookingRecord = {
  id: number | string
  Imie: string
  Nazwisko: string
  Trasa: number
  status: string
  paymentStatus: string
  Data: string
  createdAt?: string
  updatedAt?: string
  history: Array<{
    timestamp: string
    action: string
    status: string
    paymentStatus: string
    notes?: string
  }>
  // pola dodatków (opcjonalne) – nie są używane w tej operacji, ale mogą istnieć
  meals?: boolean
  groupTransport?: boolean
  electricity?: boolean
  gazebo?: boolean
  driversCount?: number
  childKayaks?: number
  deliveries?: number
}
 
export async function POST(request: NextRequest) {
  try {
    const { routeId } = (await request.json()) as { routeId: number }
    const supabase = createSupabaseAdminClient()

    // Pobierz rezerwacje z tabeli reservations, gdzie Trasa = routeId
    const { data, error } = await supabase
      .from('reservations')
      .select('id, payload')
      .filter('payload->>Trasa', 'eq', String(routeId))
    if (error) throw error

    const nowIso = new Date().toISOString()
    let affected = 0
    for (const row of data ?? []) {
      const booking = row.payload as BookingRecord
      const updated: BookingRecord = {
        ...booking,
        Trasa: 0,
        updatedAt: nowIso,
        history: [
          ...(booking.history ?? []),
          {
            timestamp: nowIso,
            action: 'route_deleted',
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            notes: 'Trasa została usunięta. Rezerwacja wymaga aktualizacji.'
          }
        ]
      }
      const { error: upError } = await supabase
        .from('reservations')
        .update({ payload: updated })
        .eq('id', row.id)
      if (upError) throw upError
      affected += 1
    }

    return NextResponse.json({
      success: true,
      message: `Zaktualizowano ${affected} rezerwacji po usunięciu trasy`,
      affectedBookings: affected
    })
  } catch (error) {
    console.error('Błąd podczas aktualizacji rezerwacji:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas aktualizacji rezerwacji' },
      { status: 500 }
    )
  }
}