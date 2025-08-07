import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const filePath = path.join(process.cwd(), 'src', 'app', 'api', 'campsites', 'spots.json')

async function readCampsites() {
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
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
    ]
  }
}

async function writeCampsites(campsites: any[]) {
  const dir = path.dirname(filePath)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(campsites, null, 2), 'utf-8')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const spotId = params.id
    const updatedSpotData = await request.json()
    
    const campsites = await readCampsites()
    
    const spotIndex = campsites.findIndex((spot: any) => spot.id === spotId)
    
    if (spotIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Działka nie znaleziona' },
        { status: 404 }
      )
    }
    
    const updatedSpot = {
      ...campsites[spotIndex],
      ...updatedSpotData,
      id: spotId
    }
    
    campsites[spotIndex] = updatedSpot
    
    await writeCampsites(campsites)
    
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
  { params }: { params: { id: string } }
) {
  try {
    const spotId = params.id
    const campsites = await readCampsites()
    
    const spotIndex = campsites.findIndex((spot: any) => spot.id === spotId)
    
    if (spotIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Działka nie znaleziona' },
        { status: 404 }
      )
    }
    
    campsites.splice(spotIndex, 1)
    
    await writeCampsites(campsites)
    
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
  { params }: { params: { id: string } }
) {
  try {
    const spotId = params.id
    const campsites = await readCampsites()
    
    const spot = campsites.find((spot: any) => spot.id === spotId)
    
    if (!spot) {
      return NextResponse.json(
        { success: false, message: 'Działka nie znaleziona' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(spot)
  } catch (error) {
    console.error('Błąd podczas odczytu działki:', error)
    return NextResponse.json(
      { success: false, message: 'Błąd podczas odczytu działki' },
      { status: 500 }
    )
  }
}