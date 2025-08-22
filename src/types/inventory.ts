export interface Equipment {
  id: string
  name: string
  quantity: number
  categoryId: string
  description?: string
  condition: 'new' | 'good' | 'used' | 'damaged'
  lastMaintenance?: Date
  price?: number
}

export interface Car {
  id: string
  brand: string
  model: string
  year: number
  licensePlate: string
  capacity: number
  quantity: number // liczba dostępnych samochodów tego typu
  condition: 'new' | 'good' | 'used' | 'damaged'
  categoryId: string
  lastMaintenance?: Date
}

export interface Category {
  id: string
  name: string
  color: string
  description?: string
}

export interface InventoryItem {
  id: string
  name: string
  quantity: number
  type: 'equipment' | 'car'
  categoryId: string
}