import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase.from('equipment').select('payload')
    if (error) throw error
    const equipment = (data ?? []).map((r: any) => r.payload)
    return NextResponse.json(equipment)
  } catch {
    console.error('Błąd podczas odczytu sprzętu')
    // Fallback: pusta lista zamiast 500
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()
    const equipment = await request.json()
    const { error: delError } = await supabase.from('equipment').delete().neq('id', null)
    if (delError) throw delError
    const rows = (equipment as any[]).map((e) => ({ id: e.id, payload: e }))
    const { error } = await supabase.from('equipment').insert(rows)
    if (error) throw error
    return NextResponse.json({ success: true, message: 'Sprzęt zapisany pomyślnie' })
  } catch {
    console.error('Błąd podczas zapisywania sprzętu')
    return NextResponse.json(
      { success: false, message: 'Błąd podczas zapisywania sprzętu' },
      { status: 500 }
    )
  }
}