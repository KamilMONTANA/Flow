import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase.from('routes').select('payload')
    if (error) throw error
    type RouteData = Record<string, unknown>
    const routes = (data ?? []).map((r: { payload: RouteData }) => r.payload as RouteData)
    return NextResponse.json(routes)
  } catch (e) {
    console.error('Błąd podczas odczytu tras', e)
    // Fallback: pusta lista zamiast 500, aby UI działał bez DB
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()
    const body = await request.json()
    const now = new Date().toISOString()
    const id: number = body?.id ?? Date.now()
    const payload = {
      id,
      name: body.name ?? '',
      color: body.color ?? '#3B82F6',
      createdAt: now,
      updatedAt: now,
    }
    const { error } = await supabase.from('routes').upsert({ id, payload })
    if (error) throw error
    return NextResponse.json(payload)
  } catch (e) {
    console.error('Błąd podczas zapisu trasy', e)
    return NextResponse.json({ success: false, message: 'Błąd podczas zapisu trasy' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()
    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get('id')
    const id = idParam ? Number(idParam) : undefined
    if (!id) return NextResponse.json({ success: false, message: 'Brak id' }, { status: 400 })
    const { error } = await supabase.from('routes').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Błąd podczas usuwania trasy', e)
    return NextResponse.json({ success: false, message: 'Błąd podczas usuwania trasy' }, { status: 500 })
  }
}


