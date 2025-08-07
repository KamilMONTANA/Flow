import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
 
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
    
    // Ścieżka do pliku data.json
    const filePath = path.join(process.cwd(), 'src', 'app', 'dashboard', 'data.json')
    
    // Odczytaj dane rezerwacji
    const data = await fs.readFile(filePath, 'utf-8')
    const bookings = JSON.parse(data) as BookingRecord[]
    
    // Znajdź rezerwacje, które wykorzystują usuwaną trasę
    const affectedBookings = bookings.filter((booking) => booking.Trasa === routeId)
    
    if (affectedBookings.length > 0) {
      // Zaktualizuj rezerwacje - ustaw trasę na 0 (brak trasy)
      const nowIso = new Date().toISOString()
      const updatedBookings: BookingRecord[] = bookings.map((booking) => {
        if (booking.Trasa === routeId) {
          return {
            ...booking,
            Trasa: 0,
            updatedAt: nowIso,
            history: [
              ...(booking.history ?? []),
              {
                timestamp: nowIso,
                action: "route_deleted",
                status: booking.status,
                paymentStatus: booking.paymentStatus,
                notes: `Trasa została usunięta. Rezerwacja wymaga aktualizacji.`
              }
            ]
          }
        }
        return booking
      })
      
      // Zapisz zaktualizowane dane
      await fs.writeFile(filePath, JSON.stringify(updatedBookings, null, 2), 'utf-8')
      
      return NextResponse.json({
        success: true,
        message: `Zaktualizowano ${affectedBookings.length} rezerwacji po usunięciu trasy`,
        affectedBookings: affectedBookings.length
      })
    } else {
      return NextResponse.json({
        success: true,
        message: "Nie znaleziono rezerwacji wykorzystujących usuwaną trasę",
        affectedBookings: 0
      })
    }
  } catch (error) {
    console.error('Błąd podczas aktualizacji rezerwacji:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas aktualizacji rezerwacji' },
      { status: 500 }
    )
  }
}