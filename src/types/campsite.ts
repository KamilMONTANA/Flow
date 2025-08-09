export interface CampsiteSpot {
  id: string
  name: string
  description?: string
  location: {
    zone: string
    spotNumber: string
  }
  capacity: number
  pricePerNight: number
  /**
   * Typ działki kempingowej. W starszych wersjach projektu był opcjonalny,
   * dlatego zachowujemy go jako pole nieobowiązkowe aby umożliwić stopniową
   * migrację danych.
   */
  type?: 'tent' | 'caravan' | 'camper' | 'glamping'
  /**
   * Udogodnienia dostępne na danym miejscu. W poprzedniej iteracji były
   * przechowywane jako tablica stringów, ale większość kodu korzysta z mapy
   * wartości logicznych. Zmieniamy strukturę na obiekt dla spójności w całym
   * projekcie.
   */
  amenities: {
    electricity: boolean
    water: boolean
    wifi: boolean
    firePit: boolean
    picnicTable: boolean
    shower: boolean
    toilet: boolean
  }
  /**
   * Informacje o mediach dostępnych na działce. Wykorzystywane głównie przez
   * siatkę działek (CampsiteGrid).
   */
  utilities: {
    electricity: boolean
    water: boolean
    sewage: boolean
    wifi: boolean
  }
  rating?: number
  isAvailable: boolean
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