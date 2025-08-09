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

const defaultCampsites: Spot[] = [
  {
    id: '1',
    name: 'Działka A1',
    description: 'Cicha działka w lesie, idealna dla rodzin',
    location: {
      zone: 'A',
      spotNumber: '1'
    },
    capacity: 4,
    pricePerNight: 80,
    amenities: {
      electricity: true,
      water: false,
      wifi: true,
      firePit: true,
      picnicTable: true,
      shower: false,
      toilet: false
    },
    rating: 4.5,
    isAvailable: true
  },
  {
    id: '2',
    name: 'Działka B3',
    description: 'Działka z pełnym przyłączem, idealna dla kamperów',
    location: {
      zone: 'B',
      spotNumber: '3'
    },
    capacity: 6,
    pricePerNight: 120,
    amenities: {
      electricity: true,
      water: true,
      wifi: true,
      firePit: false,
      picnicTable: true,
      shower: true,
      toilet: true
    },
    rating: 4.8,
    isAvailable: true
  },
  {
    id: '3',
    name: 'Glamping Premium',
    description: 'Luksusowy namiot glampingowy z łazienką',
    location: {
      zone: 'Premium',
      spotNumber: '1'
    },
    capacity: 2,
    pricePerNight: 250,
    amenities: {
      electricity: true,
      water: true,
      wifi: true,
      firePit: false,
      picnicTable: false,
      shower: true,
      toilet: true
    },
    rating: 4.9,
    isAvailable: true
  }
]

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase.from('campsite_spots').select('payload')
    if (error) throw error
    const campsites = (data ?? []).map((r: { payload: Spot }) => r.payload as Spot)
    return NextResponse.json(campsites.length ? campsites : defaultCampsites)
  } catch (error) {
    console.error('Błąd podczas odczytu działek:', error)
    // Fallback: zwróć dane domyślne zamiast 500, aby UI działał offline/bez DB
    return NextResponse.json(defaultCampsites, { status: 200 })
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