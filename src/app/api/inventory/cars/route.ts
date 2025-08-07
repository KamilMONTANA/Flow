import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'app', 'api', 'inventory', 'cars.json')
    
    try {
      const data = await fs.readFile(filePath, 'utf-8')
      const cars = JSON.parse(data)
      return NextResponse.json(cars)
    } catch {
      // Jeśli plik nie istnieje, zwróć domyślne dane
      const defaultCars = [
        {
          id: '1',
          brand: 'Volkswagen',
          model: 'Transporter',
          year: 2020,
          licensePlate: 'KR12345',
          capacity: 9,
          quantity: 2,
          condition: 'good',
          categoryId: '3',
        },
        {
          id: '2',
          brand: 'Mercedes',
          model: 'Sprinter',
          year: 2022,
          licensePlate: 'KR67890',
          capacity: 20,
          quantity: 1,
          condition: 'new',
          categoryId: '3',
        },
      ]
      return NextResponse.json(defaultCars)
    }
  } catch {
    console.error('Błąd podczas odczytu samochodów')
    return NextResponse.json(
      { success: false, message: 'Błąd podczas odczytu samochodów' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cars = await request.json()
    
    const filePath = path.join(process.cwd(), 'src', 'app', 'api', 'inventory', 'cars.json')
    
    // Upewnij się, że katalog istnieje
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })
    
    // Zapisz dane do pliku
    await fs.writeFile(filePath, JSON.stringify(cars, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true, message: 'Samochody zapisane pomyślnie' })
  } catch {
    console.error('Błąd podczas zapisywania samochodów')
    return NextResponse.json(
      { success: false, message: 'Błąd podczas zapisywania samochodów' },
      { status: 500 }
    )
  }
}