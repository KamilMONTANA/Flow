import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

// Minimalny typ dla działki używany w tym module
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

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase.from('campsite_spots').select('payload')
    if (error) throw error
    const campsites = (data ?? []).map((r: { payload: Spot }) => r.payload as Spot)
    return NextResponse.json(campsites)
  } catch (error) {
    console.error('Błąd podczas odczytu działek:', error)
    // Fallback: zwróć pustą listę, aby UI mógł się renderować bez danych
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const newSpot = (await request.json()) as Partial<Spot>
    const supabase = createSupabaseAdminClient()
    const newId = (Date.now()).toString()
    const spotToAdd: Spot = {
      id: newSpot.id ?? newId,
      name: newSpot.name ?? '',
      description: newSpot.description ?? '',
      location: newSpot.location ?? { zone: '', spotNumber: '' },
      capacity: newSpot.capacity ?? 0,
      pricePerNight: newSpot.pricePerNight ?? 0,
      amenities: newSpot.amenities ?? {
        electricity: false,
        water: false,
        wifi: false,
        firePit: false,
        picnicTable: false,
        shower: false,
        toilet: false,
      },
      rating: newSpot.rating ?? 0,
      isAvailable: newSpot.isAvailable ?? true,
    }
    const { error } = await supabase.from('campsite_spots').upsert({ id: spotToAdd.id, payload: spotToAdd })
    if (error) throw error
    return NextResponse.json(spotToAdd)
  } catch (error) {
    console.error('Błąd podczas zapisywania działki:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas zapisywania działki' },
      { status: 500 }
    )
  }
}