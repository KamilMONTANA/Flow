import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'app', 'api', 'inventory', 'equipment.json')
    
    try {
      const data = await fs.readFile(filePath, 'utf-8')
      const equipment = JSON.parse(data)
      return NextResponse.json(equipment)
    } catch (error) {
      // Jeśli plik nie istnieje, zwróć domyślne dane
      const defaultEquipment = [
        {
          id: '1',
          name: 'Kajak jednoosobowy',
          quantity: 5,
          description: 'Kajak turystyczny dla jednej osoby',
          condition: 'good',
          categoryId: '1',
        },
        {
          id: '2',
          name: 'Kajak dwuosobowy',
          quantity: 3,
          description: 'Kajak turystyczny dla dwóch osób',
          condition: 'good',
          categoryId: '1',
        },
        {
          id: '3',
          name: 'Wiosło',
          quantity: 15,
          description: 'Wiosło kajakowe',
          condition: 'good',
          categoryId: '1',
        },
      ]
      return NextResponse.json(defaultEquipment)
    }
  } catch (error) {
    console.error('Błąd podczas odczytu sprzętu:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas odczytu sprzętu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const equipment = await request.json()
    
    const filePath = path.join(process.cwd(), 'src', 'app', 'api', 'inventory', 'equipment.json')
    
    // Upewnij się, że katalog istnieje
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })
    
    // Zapisz dane do pliku
    await fs.writeFile(filePath, JSON.stringify(equipment, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true, message: 'Sprzęt zapisany pomyślnie' })
  } catch (error) {
    console.error('Błąd podczas zapisywania sprzętu:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas zapisywania sprzętu' },
      { status: 500 }
    )
  }
}