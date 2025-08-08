import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase.from('categories').select('payload')
    if (error) throw error
    const categories = (data ?? []).map((r: any) => r.payload)
    return NextResponse.json(categories)
  } catch {
    console.error('Błąd podczas odczytu kategorii')
    // Fallback: pusta lista zamiast 500
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()
    const categories = await request.json()
    const { error: delError } = await supabase.from('categories').delete().neq('id', null)
    if (delError) throw delError
    const rows = (categories as any[]).map((c) => ({ id: c.id, payload: c }))
    const { error } = await supabase.from('categories').insert(rows)
    if (error) throw error
    return NextResponse.json({ success: true, message: 'Kategorie zapisane pomyślnie' })
  } catch {
    console.error('Błąd podczas zapisywania kategorii')
    return NextResponse.json(
      { success: false, message: 'Błąd podczas zapisywania kategorii' },
      { status: 500 }
    )
  }
}