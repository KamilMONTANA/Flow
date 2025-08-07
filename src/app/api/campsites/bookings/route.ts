import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const filePath = path.join(process.cwd(), 'src', 'app', 'api', 'campsites', 'bookings.json')

export async function GET() {
  try {
    try {
      const data = await fs.readFile(filePath, 'utf-8')
      const bookings = JSON.parse(data)
      return NextResponse.json(bookings)
    } catch (error) {
      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Błąd podczas odczytu rezerwacji:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas odczytu rezerwacji' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const booking = await request.json()
    
    let bookings = []
    try {
      const data = await fs.readFile(filePath, 'utf-8')
      bookings = JSON.parse(data)
    } catch (error) {
      bookings = []
    }
    
    const newBooking = {
      ...booking,
      id: booking.id || Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    bookings.push(newBooking)
    
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })
    
    await fs.writeFile(filePath, JSON.stringify(bookings, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true, message: 'Rezerwacja zapisana pomyślnie', booking: newBooking })
  } catch (error) {
    console.error('Błąd podczas zapisywania rezerwacji:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas zapisywania rezerwacji' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json()
    
    let bookings = []
    try {
      const data = await fs.readFile(filePath, 'utf-8')
      bookings = JSON.parse(data)
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Nie znaleziono rezerwacji' },
        { status: 404 }
      )
    }
    
    const bookingIndex = bookings.findIndex(b => b.id === id)
    if (bookingIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Nie znaleziono rezerwacji' },
        { status: 404 }
      )
    }
    
    bookings[bookingIndex] = {
      ...bookings[bookingIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    
    await fs.writeFile(filePath, JSON.stringify(bookings, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true, message: 'Rezerwacja zaktualizowana', booking: bookings[bookingIndex] })
  } catch (error) {
    console.error('Błąd podczas aktualizacji rezerwacji:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas aktualizacji rezerwacji' },
      { status: 500 }
    )
  }
}