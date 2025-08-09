import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase.from('cars').select('payload')
    if (error) throw error
    type Car = Record<string, unknown>
    const cars = (data ?? []).map((r: { payload: Car }) => r.payload as Car)
    return NextResponse.json(cars)
  } catch (e) {
    console.error('Błąd podczas odczytu samochodów', e)
    // Fallback: pusta lista zamiast 500
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()
    const cars = (await request.json()) as Record<string, unknown>[]
    // Kontrakt: zapis pełnej listy
    const { error: delError } = await supabase.from('cars').delete().neq('id', null)
    if (delError) throw delError
    const rows = cars.map((c) => ({ id: (c as { id: string }).id, payload: c }))
    const { error } = await supabase.from('cars').insert(rows)
    if (error) throw error
    return NextResponse.json({ success: true, message: 'Samochody zapisane pomyślnie' })
  } catch {
    console.error('Błąd podczas zapisywania samochodów')
    return NextResponse.json(
      { success: false, message: 'Błąd podczas zapisywania samochodów' },
      { status: 500 }
    )
  }
}