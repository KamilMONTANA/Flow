import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'app', 'api', 'inventory', 'categories.json')
    
    try {
      const data = await fs.readFile(filePath, 'utf-8')
      const categories = JSON.parse(data)
      return NextResponse.json(categories)
    } catch (error) {
      // Jeśli plik nie istnieje, zwróć pustą tablicę
      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Błąd podczas odczytu kategorii:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas odczytu kategorii' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const categories = await request.json()
    
    const filePath = path.join(process.cwd(), 'src', 'app', 'api', 'inventory', 'categories.json')
    
    // Upewnij się, że katalog istnieje
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })
    
    // Zapisz dane do pliku
    await fs.writeFile(filePath, JSON.stringify(categories, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true, message: 'Kategorie zapisane pomyślnie' })
  } catch (error) {
    console.error('Błąd podczas zapisywania kategorii:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas zapisywania kategorii' },
      { status: 500 }
    )
  }
}