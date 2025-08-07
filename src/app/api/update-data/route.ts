import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Ścieżka do pliku data.json
    const filePath = path.join(process.cwd(), 'src', 'app', 'dashboard', 'data.json')
    
    // Zapisz dane do pliku
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true, message: 'Dane zapisane pomyślnie' })
  } catch (error) {
    console.error('Błąd podczas zapisywania danych:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas zapisywania danych' },
      { status: 500 }
    )
  }
}