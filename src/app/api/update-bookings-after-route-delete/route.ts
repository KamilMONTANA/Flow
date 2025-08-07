import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { routeId } = await request.json()
    
    // Ścieżka do pliku data.json
    const filePath = path.join(process.cwd(), 'src', 'app', 'dashboard', 'data.json')
    
    // Odczytaj dane rezerwacji
    const data = await fs.readFile(filePath, 'utf-8')
    const bookings = JSON.parse(data)
    
    // Znajdź rezerwacje, które wykorzystują usuwaną trasę
    const affectedBookings = bookings.filter((booking: any) => booking.Trasa === routeId)
    
    if (affectedBookings.length > 0) {
      // Zaktualizuj rezerwacje - ustaw trasę na 0 (brak trasy) lub usuń rezerwacje
      const updatedBookings = bookings.map((booking: any) => {
        if (booking.Trasa === routeId) {
          return {
            ...booking,
            Trasa: 0, // Ustaw na brak trasy
            updatedAt: new Date().toISOString(),
            history: [
              ...booking.history,
              {
                timestamp: new Date().toISOString(),
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