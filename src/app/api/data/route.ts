import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import type { Booking } from '@/types/booking'

/**
 * Dedykowana baza dla /reservations:
 * Plik: src/app/api/data/reservations.json
 * Endpointy:
 *  - GET  /api/data              -> odczyt listy rezerwacji
 *  - POST /api/data              -> pełny zapis całej listy (overwrite)
 *  - PUT  /api/data              -> częściowa aktualizacja jednego rekordu po id
 *  - DELETE /api/data?id={id}    -> usunięcie jednego rekordu po id
 */

const filePath = path.join(process.cwd(), 'src', 'app', 'api', 'data', 'reservations.json')

async function ensureDirAndFile() {
  const dir = path.dirname(filePath)
  await fs.mkdir(dir, { recursive: true })
  try {
    await fs.access(filePath)
  } catch {
    // Jeśli plik nie istnieje – utwórz pustą tablicę
    await fs.writeFile(filePath, '[]', 'utf-8')
  }
}

export async function GET() {
  try {
    await ensureDirAndFile()
    const data = await fs.readFile(filePath, 'utf-8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    console.error('Błąd podczas odczytu danych:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas odczytu danych' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDirAndFile()
    const body = await request.json()
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: 'Oczekiwano pełnej listy rezerwacji (Array)' },
        { status: 400 }
      )
    }
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf-8')
    return NextResponse.json({ success: true, message: 'Dane zapisane pomyślnie' })
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
    await ensureDirAndFile()
    const partial = await request.json()
    const { id } = partial
    if (typeof id !== 'number' && typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Brak prawidłowego identyfikatora id' },
        { status: 400 }
      )
    }

    const raw = await fs.readFile(filePath, 'utf-8')
    const list: Booking[] = JSON.parse(raw)
    const idx = list.findIndex((x) => x.id === id)
    if (idx === -1) {
      return NextResponse.json(
        { success: false, message: 'Nie znaleziono rekordu' },
        { status: 404 }
      )
    }

    const updated = {
      ...list[idx],
      ...partial,
      updatedAt: new Date().toISOString(),
    }
    list[idx] = updated
    await fs.writeFile(filePath, JSON.stringify(list, null, 2), 'utf-8')
    return NextResponse.json({ success: true, message: 'Zaktualizowano rekord', booking: updated })
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
    await ensureDirAndFile()
    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get('id')
    if (!idParam) {
      return NextResponse.json(
        { success: false, message: 'Brak parametru id' },
        { status: 400 }
      )
    }
    const id = isNaN(Number(idParam)) ? idParam : Number(idParam)

    const raw = await fs.readFile(filePath, 'utf-8')
    const list: Booking[] = JSON.parse(raw)
    const idx = list.findIndex((x) => x.id === id)
    if (idx === -1) {
      return NextResponse.json(
        { success: false, message: 'Nie znaleziono rekordu' },
        { status: 404 }
      )
    }
    const newList = list.filter((_, i) => i !== idx)
    await fs.writeFile(filePath, JSON.stringify(newList, null, 2), 'utf-8')
    return NextResponse.json({ success: true, message: 'Usunięto rekord' })
  } catch (error) {
    console.error('Błąd podczas usuwania rekordu:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas usuwania rekordu' },
      { status: 500 }
    )
  }
}