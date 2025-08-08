import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const supabase = createSupabaseAdminClient()
    const { error } = await supabase
      .from('dashboard_data')
      .upsert({ id: 'singleton', payload: data })
    if (error) throw error
    return NextResponse.json({ success: true, message: 'Dane zapisane pomyślnie' })
  } catch (error) {
    console.error('Błąd podczas zapisywania danych:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas zapisywania danych' },
      { status: 500 }
    )
  }
}