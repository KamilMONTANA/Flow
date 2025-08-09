import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase.from('categories').select('payload')
    if (error) throw error
    type Category = Record<string, unknown>
    const categories = (data ?? []).map((r: { payload: Category }) => r.payload as Category)
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
    const categories = (await request.json()) as Record<string, unknown>[]
    const { error: delError } = await supabase.from('categories').delete().neq('id', null)
    if (delError) throw delError
    const rows = categories.map((c) => ({ id: (c as { id: string }).id, payload: c }))
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