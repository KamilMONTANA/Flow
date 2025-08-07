import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const filePath = path.join(process.cwd(), 'src', 'app', 'api', 'campsites', 'spots.json')

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

async function readCampsites(): Promise<Spot[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data) as Spot[]
  } catch {
    return [
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
    ] satisfies Spot[]
  }
}

async function writeCampsites(campsites: Spot[]) {
  const dir = path.dirname(filePath)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(campsites, null, 2), 'utf-8')
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
    try {
      const data = await fs.readFile(filePath, 'utf-8')
      const campsites = JSON.parse(data) as Spot[]
      return NextResponse.json(campsites)
    } catch {
      return NextResponse.json(defaultCampsites)
    }
  } catch (error) {
    console.error('Błąd podczas odczytu działek:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas odczytu działek' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const newSpot = (await request.json()) as Partial<Spot>
    
    const campsites = await readCampsites()
    
    // Generate new ID bez any
    const newId =
      Math.max(...campsites.map((spot) => parseInt(spot.id) || 0), 0) + 1
    
    const spotToAdd: Spot = {
      // wymagane pola; zachowujemy zgodność z istniejącym frontendem
      id: newId.toString(),
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
    
    campsites.push(spotToAdd)
    
    await writeCampsites(campsites)
    
    return NextResponse.json(spotToAdd)
  } catch (error) {
    console.error('Błąd podczas zapisywania działki:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas zapisywania działki' },
      { status: 500 }
    )
  }
}