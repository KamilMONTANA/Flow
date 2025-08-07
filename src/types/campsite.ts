export interface CampsiteSpot {
  id: string
  name: string
  type: 'tent' | 'caravan' | 'camper' | 'glamping'
  capacity: number
  pricePerNight: number
  amenities: string[]
  description?: string
  isAvailable: boolean
  location: {
    zone: string
    spotNumber: string
  }
  utilities: {
    electricity: boolean
    water: boolean
    sewage: boolean
    wifi: boolean
  }
}

export interface CampsiteBooking {
  id: string
  spotId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  checkIn: string
  checkOut: string
  numberOfPeople: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  specialRequests?: string
  // Dodatki w cenie
  addons?: {
    firePit?: boolean
    electricity?: boolean
    meals?: boolean
    groupTransport?: boolean
    gazebo?: boolean
    driversCount?: number
  }
  createdAt: string
  updatedAt: string
}

export interface CampsiteAvailability {
  spotId: string
  date: Date
  isAvailable: boolean
  price: number
}

export interface CampsiteAmenity {
  id: string
  name: string
  type: 'facility' | 'service' | 'activity'
  description: string
  icon: string
  isAvailable: boolean
}