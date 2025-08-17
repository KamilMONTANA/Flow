import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

// Minimalny typ dopasowany do struktury używanej w API
type Spot = {
  id: string
  name: string
  description: string
  location: { zone: string; spotNumber: string }
  capacity: number
  pricePerNight: number
  amenities: {
    electricity: boolean
    water: boolean
    wifi: boolean
    firePit: boolean
    picnicTable: boolean
    shower: boolean
    toilet: boolean
  }
  rating: number
  isAvailable: boolean
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const spotId = (await params).id
    const updatedSpotData = (await request.json()) as Partial<Spot>
    const supabase = createSupabaseAdminClient()
    const { data, error: selError } = await supabase
      .from('campsite_spots')
      .select('payload')
      .eq('id', spotId)
      .single<{ payload: Spot }>()
    if (selError || !data) {
      return NextResponse.json(
        { success: false, message: 'Działka nie znaleziona' },
        { status: 404 }
      )
    }
    const updatedSpot: Spot = { ...data.payload, ...updatedSpotData, id: spotId }
    const { error } = await supabase
      .from('campsite_spots')
      .update({ payload: updatedSpot })
      .eq('id', spotId)
    if (error) throw error
    return NextResponse.json(updatedSpot)
  } catch (error) {
    console.error('Błąd podczas aktualizacji działki:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas aktualizacji działki' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const spotId = (await params).id
    const supabase = createSupabaseAdminClient()
    const { error } = await supabase.from('campsite_spots').delete().eq('id', spotId)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Błąd podczas usuwania działki:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas usuwania działki' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const spotId = (await params).id
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('campsite_spots')
      .select('payload')
      .eq('id', spotId)
      .single()
    if (error || !data) {
      return NextResponse.json(
        { success: false, message: 'Działka nie znaleziona' },
        { status: 404 }
      )
    }
    return NextResponse.json(data.payload as Spot)
  } catch (error) {
    console.error('Błąd podczas odczytu działki:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas odczytu działki' },
      { status: 500 }
    )
  }
}