'use client'

import { useState, useEffect } from 'react'
import { format, isWithinInterval } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Search, Eye, Calendar, Users, MapPin, Star, Zap, Droplet, Wifi } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CampsiteSpot, CampsiteBooking } from '@/types/campsite'

export default function CampsitesPage() {
  const [spots, setSpots] = useState<CampsiteSpot[]>([])
  const [bookings, setBookings] = useState<CampsiteBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [selectedSpot, setSelectedSpot] = useState<CampsiteSpot | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingSpot, setEditingSpot] = useState<CampsiteSpot | null>(null)
  const [deletingSpot, setDeletingSpot] = useState<CampsiteSpot | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState<Partial<CampsiteSpot>>({
    name: '',
    description: '',
    location: { zone: '', spotNumber: '' },
    capacity: 1,
    pricePerNight: 0,
    amenities: {
      electricity: false,
      water: false,
      wifi: false,
      firePit: false,
      picnicTable: false,
      shower: false,
      toilet: false
    },
    rating: 0,
    isAvailable: true
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [spotsResponse, bookingsResponse] = await Promise.all([
        fetch('/api/campsites/spots', { cache: 'no-store' }),
        fetch('/api/campsites/bookings', { cache: 'no-store' })
      ])

      if (!spotsResponse.ok || !bookingsResponse.ok) {
        throw new Error('Failed to fetch campsite data')
      }

      const spotsData = await spotsResponse.json()
      const bookingsData = await bookingsResponse.json()
      
      // Ensure data is in expected format (array)
      setSpots(Array.isArray(spotsData) ? spotsData : [])
      setBookings(Array.isArray(bookingsData) ? bookingsData : [])
    } catch (error) {
      console.error('Error loading data:', error)
      setSpots([])
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const filteredSpots = spots.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spot.location.zone.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesZone = selectedZone === 'all' || spot.location.zone === selectedZone
    return matchesSearch && matchesZone
  })

  const zones = Array.from(new Set(spots.map(spot => spot.location.zone)))

  const handleCreateSpot = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/campsites/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        await loadData()
        setIsCreateDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error creating spot:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditSpot = async () => {
    if (!editingSpot) return
    
    setIsSaving(true)
    try {
      const response = await fetch(`/api/campsites/spots/${editingSpot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        await loadData()
        setIsEditDialogOpen(false)
        setEditingSpot(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error editing spot:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSpot = async () => {
    if (!deletingSpot) return
    
    setIsSaving(true)
    try {
      const response = await fetch(`/api/campsites/spots/${deletingSpot.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await loadData()
        setIsDeleteDialogOpen(false)
        setDeletingSpot(null)
      }
    } catch (error) {
      console.error('Error deleting spot:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location: { zone: '', spotNumber: '' },
      capacity: 1,
      pricePerNight: 0,
      amenities: {
        electricity: false,
        water: false,
        wifi: false,
        firePit: false,
        picnicTable: false,
        shower: false,
        toilet: false
      },
      rating: 0,
      isAvailable: true
    })
  }

  const openEditDialog = (spot: CampsiteSpot) => {
    setEditingSpot(spot)
    setFormData(spot)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (spot: CampsiteSpot) => {
    setDeletingSpot(spot)
    setIsDeleteDialogOpen(true)
  }

  const getSpotAvailability = (spotId: string) => {
    const spotBookings = bookings.filter(b => b.spotId === spotId && b.status !== 'cancelled')
    const today = new Date()
    
    return !spotBookings.some(booking => {
      const checkIn = new Date(booking.checkIn)
      const checkOut = new Date(booking.checkOut)
      return isWithinInterval(today, { start: checkIn, end: checkOut })
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (selectedSpot) {
    return (
      <SpotDetailView
        spot={selectedSpot}
        bookings={bookings.filter(b => b.spotId === selectedSpot.id)}
        onBack={() => setSelectedSpot(null)}
        onRefresh={loadData}
      />
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
          <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pola namiotowe</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj pole
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Szukaj pól..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedZone} onValueChange={setSelectedZone}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Wybierz strefę" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie strefy</SelectItem>
            {zones.map(zone => (
              <SelectItem key={zone} value={zone}>{zone}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSpots.map(spot => {
          const isAvailable = getSpotAvailability(spot.id)
          const spotBookings = bookings.filter(b => b.spotId === spot.id && b.status !== 'cancelled')
          
          return (
            <Card key={spot.id} className="overflow-hidden">
              <div className="bg-gray-200 relative">
                <div className="absolute top-2 right-2">
                  <Badge variant={isAvailable ? "default" : "secondary"}>
                    {isAvailable ? "Dostępne" : "Zajęte"}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg">{spot.name}</CardTitle>
                <p className="text-sm text-gray-600">{spot.description}</p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{spot.location.zone} - {spot.location.spotNumber}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Pojemność: {spot.capacity} osób</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 mr-2" />
                    <span>{spot.pricePerNight} zł/noc</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Rezerwacje: {spotBookings.length}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setSelectedSpot(spot)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Szczegóły
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditDialog(spot)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openDeleteDialog(spot)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredSpots.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Brak pól namiotowych</h3>
          <p className="text-gray-600 mb-4">Nie znaleziono pól namiotowych spełniających kryteria</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Dodaj pierwsze pole
          </Button>
        </div>
      )}

      {/* Create Dialog */}
      {isCreateDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Dodaj nowe pole namiotowe</h3>
            
            <div className="space-y-4">
              <div>
                <Label>Nazwa</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="np. Pola A1"
                />
              </div>

              <div>
                <Label>Opis</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Opis pola namiotowego..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Strefa</Label>
                  <Input
                    value={formData.location?.zone || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location!, zone: e.target.value } 
                    }))}
                    placeholder="np. Strefa A"
                  />
                </div>
                <div>
                  <Label>Numer miejsca</Label>
                  <Input
                    value={formData.location?.spotNumber || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location!, spotNumber: e.target.value } 
                    }))}
                    placeholder="np. 1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pojemność</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.capacity || 1}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label>Cena za noc (PLN)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.pricePerNight || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricePerNight: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2">Udogodnienia</Label>
                <div className="space-y-2">
                  {Object.entries(formData.amenities || {}).map(([key, value]) => {
                    const amenityLabels: Record<string, string> = {
                      electricity: 'Prąd elektryczny',
                      water: 'Dostęp do wody',
                      wifi: 'WiFi',
                      firePit: 'Miejsce na ognisko',
                      picnicTable: 'Stół piknikowy',
                      shower: 'Prysznic',
                      toilet: 'Toaleta'
                    }
                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          checked={value as boolean}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            amenities: { ...prev.amenities!, [key]: checked }
                          }))}
                        />
                        <Label className="font-normal">{amenityLabels[key]}</Label>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={handleCreateSpot} disabled={isSaving}>
                {isSaving ? 'Zapisywanie...' : 'Dodaj'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  resetForm()
                }}
              >
                Anuluj
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edytuj pole namiotowe</h3>
            
            <div className="space-y-4">
              <div>
                <Label>Nazwa</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label>Opis</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Strefa</Label>
                  <Input
                    value={formData.location?.zone || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location!, zone: e.target.value } 
                    }))}
                  />
                </div>
                <div>
                  <Label>Numer miejsca</Label>
                  <Input
                    value={formData.location?.spotNumber || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location!, spotNumber: e.target.value } 
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pojemność</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.capacity || 1}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label>Cena za noc (PLN)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.pricePerNight || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricePerNight: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2">Udogodnienia</Label>
                <div className="space-y-2">
                  {Object.entries(formData.amenities || {}).map(([key, value]) => {
                    const amenityLabels: Record<string, string> = {
                      electricity: 'Prąd elektryczny',
                      water: 'Dostęp do wody',
                      wifi: 'WiFi',
                      firePit: 'Miejsce na ognisko',
                      picnicTable: 'Stół piknikowy',
                      shower: 'Prysznic',
                      toilet: 'Toaleta'
                    }
                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          checked={value as boolean}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            amenities: { ...prev.amenities!, [key]: checked }
                          }))}
                        />
                        <Label className="font-normal">{amenityLabels[key]}</Label>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={handleEditSpot} disabled={isSaving}>
                {isSaving ? 'Zapisywanie...' : 'Zapisz'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingSpot(null)
                  resetForm()
                }}
              >
                Anuluj
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Potwierdź usunięcie</h3>

            <div className="space-y-4">
              <p className="text-gray-700">
                Czy na pewno chcesz usunąć pole <strong>{deletingSpot?.name}</strong>?
              </p>
              <p className="text-sm text-gray-500">
                Ta operacja jest nieodwracalna. Wszystkie rezerwacje powiązane z tym polem również zostaną usunięte.
              </p>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setDeletingSpot(null)
                }}
              >
                Anuluj
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSpot}
                disabled={isSaving}
              >
                {isSaving ? 'Usuwanie...' : 'Usuń'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SpotDetailView({ spot, bookings, onBack, onRefresh }: {
  spot: CampsiteSpot
  bookings: CampsiteBooking[]
  onBack: () => void
  onRefresh: () => void
}) {
  const router = useRouter()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditReservationOpen, setIsEditReservationOpen] = useState(false)
  const [isDeleteReservationOpen, setIsDeleteReservationOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState<CampsiteBooking | null>(null)
  const [deletingReservation, setDeletingReservation] = useState<CampsiteBooking | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<CampsiteSpot>>(spot)
  const [reservationFormData, setReservationFormData] = useState<Partial<CampsiteBooking>>({})
  
  // Stan dla filtrów każdej zakładki
  const [activeFilters, setActiveFilters] = useState({ name: '', email: '', phone: '', dateFrom: '', dateTo: '' })
  const [upcomingFilters, setUpcomingFilters] = useState({ name: '', email: '', phone: '', dateFrom: '', dateTo: '' })
  const [archiveFilters, setArchiveFilters] = useState({ name: '', email: '', phone: '', dateFrom: '', dateTo: '' })
  
  // Typ dla filtrów
  interface BookingFilters {
    name: string
    email: string
    phone: string
    dateFrom: string
    dateTo: string
  }
  
  // Funkcja pomocnicza do tłumaczenia statusów rezerwacji
  const translateBookingStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'confirmed': 'potwierdzony',
      'pending': 'oczekujący',
      'cancelled': 'anulowany',
      'completed': 'zakończony'
    }
    return statusMap[status] || status
  }

  const currentBookings = bookings.filter(b => {
    const today = new Date()
    const checkIn = new Date(b.checkIn)
    const checkOut = new Date(b.checkOut)
    return b.status !== 'cancelled' && isWithinInterval(today, { start: checkIn, end: checkOut })
  })

  const handleEditSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/campsites/spots/${spot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      })
      
      if (response.ok) {
        setIsEditDialogOpen(false)
        onRefresh()
      }
    } catch (error) {
      console.error('Error updating spot:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSpot = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/campsites/spots/${spot.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setIsDeleteDialogOpen(false)
        onBack()
      }
    } catch (error) {
      console.error('Error deleting spot:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveReservation = async () => {
    if (!editingReservation) return
    
    setIsSaving(true)
    try {
      const response = await fetch(`/api/campsites/bookings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingReservation.id, ...reservationFormData })
      })
      
      if (response.ok) {
        setIsEditReservationOpen(false)
        setEditingReservation(null)
        onRefresh()
      }
    } catch (error) {
      console.error('Error updating reservation:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmDeleteReservation = async () => {
    if (!deletingReservation) return
    
    setIsSaving(true)
    try {
      const response = await fetch(`/api/campsites/bookings`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deletingReservation.id })
      })
      
      if (response.ok) {
        setIsDeleteReservationOpen(false)
        setDeletingReservation(null)
        onRefresh()
      }
    } catch (error) {
      console.error('Error deleting reservation:', error)
    } finally {
      setIsSaving(false)
    }
  }


  const openEditReservation = (booking: CampsiteBooking) => {
    setEditingReservation(booking)
    setReservationFormData(booking)
    setIsEditReservationOpen(true)
  }

  const openDeleteReservation = (booking: CampsiteBooking) => {
    setDeletingReservation(booking)
    setIsDeleteReservationOpen(true)
  }
  
  // Funkcje pomocnicze do filtrowania
  const filterBookings = (bookings: CampsiteBooking[], filters: BookingFilters, isUpcoming: boolean = false, isArchive: boolean = false) => {
    return bookings.filter(booking => {
      // Podstawowe filtrowanie po nazwisku, emailu i telefonie
      const nameMatch = !filters.name || booking.customerName.toLowerCase().includes(filters.name.toLowerCase())
      const emailMatch = !filters.email || booking.customerEmail.toLowerCase().includes(filters.email.toLowerCase())
      const phoneMatch = !filters.phone || booking.customerPhone.includes(filters.phone)
      
      // Filtrowanie po dacie
      let dateMatch = true
      if (filters.dateFrom || filters.dateTo) {
        const checkInDate = new Date(booking.checkIn)
        if (filters.dateFrom && checkInDate < new Date(filters.dateFrom)) dateMatch = false
        if (filters.dateTo && checkInDate > new Date(filters.dateTo)) dateMatch = false
      }
      
      // Dodatkowe filtrowanie dla konkretnych zakładek
      let additionalFilter = true
      if (isUpcoming) {
        additionalFilter = new Date(booking.checkIn) > new Date() && booking.status !== 'cancelled'
      } else if (isArchive) {
        additionalFilter = booking.status === 'completed' || booking.status === 'cancelled' || new Date(booking.checkOut) < new Date()
      } else {
        // Zakładka "Aktywne"
        const today = new Date()
        additionalFilter = booking.status !== 'cancelled' && isWithinInterval(today, {
          start: new Date(booking.checkIn),
          end: new Date(booking.checkOut)
        })
      }
      
      return nameMatch && emailMatch && phoneMatch && dateMatch && additionalFilter
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={onBack} className="mr-4">
          ← Powrót
        </Button>
        <h1 className="text-3xl font-bold">{spot.name}</h1>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/campsites/${spot.id}/reservations/new`)}>
            <Plus className="w-4 h-4 mr-2" />
            Dodaj rezerwację
          </Button>
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edytuj
          </Button>
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Usuń
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informacje o polu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Opis</h3>
                  <p className="text-gray-600">{spot.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500">Lokalizacja:</span>
                    <p className="font-medium">{spot.location.zone} - {spot.location.spotNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Pojemność:</span>
                    <p className="font-medium">{spot.capacity} osób</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Cena za noc:</span>
                    <p className="font-medium">{spot.pricePerNight} zł</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <p className="font-medium">
                      {currentBookings.length > 0 ? 'Zajęte' : 'Dostępne'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">Aktywne</TabsTrigger>
              <TabsTrigger value="upcoming">Nadchodzące</TabsTrigger>
              <TabsTrigger value="archive">Archiwum</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <Card>
                <CardHeader>
                  <CardTitle>Aktualne rezerwacje</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <Label className="text-xs">Imię i nazwisko</Label>
                        <Input
                          placeholder="Szukaj..."
                          value={activeFilters.name}
                          onChange={(e) => setActiveFilters({...activeFilters, name: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Email</Label>
                        <Input
                          placeholder="Szukaj..."
                          value={activeFilters.email}
                          onChange={(e) => setActiveFilters({...activeFilters, email: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Telefon</Label>
                        <Input
                          placeholder="Szukaj..."
                          value={activeFilters.phone}
                          onChange={(e) => setActiveFilters({...activeFilters, phone: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Data od</Label>
                        <Input
                          type="date"
                          value={activeFilters.dateFrom}
                          onChange={(e) => setActiveFilters({...activeFilters, dateFrom: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Data do</Label>
                        <Input
                          type="date"
                          value={activeFilters.dateTo}
                          onChange={(e) => setActiveFilters({...activeFilters, dateTo: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {filterBookings(currentBookings, activeFilters).length > 0 ? (
                      filterBookings(currentBookings, activeFilters).map(booking => (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{booking.customerName}</h4>
                              <p className="text-sm text-gray-600">{booking.customerEmail}</p>
                              <p className="text-sm text-gray-600">{booking.customerPhone}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditReservation(booking)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteReservation(booking)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Przyjazd:</span>
                              <p className="font-medium">{format(new Date(booking.checkIn), 'dd.MM.yyyy', { locale: pl })}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Wyjazd:</span>
                              <p className="font-medium">{format(new Date(booking.checkOut), 'dd.MM.yyyy', { locale: pl })}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Liczba osób:</span>
                              <p className="font-medium">{booking.numberOfPeople}</p>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <span className="text-gray-500">Cena:</span>
                            <p className="font-medium">{booking.totalPrice} zł</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">Brak aktualnych rezerwacji</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="upcoming">
              <Card>
                <CardHeader>
                  <CardTitle>Nadchodzące rezerwacje</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <Label className="text-xs">Imię i nazwisko</Label>
                        <Input
                          placeholder="Szukaj..."
                          value={upcomingFilters.name}
                          onChange={(e) => setUpcomingFilters({...upcomingFilters, name: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Email</Label>
                        <Input
                          placeholder="Szukaj..."
                          value={upcomingFilters.email}
                          onChange={(e) => setUpcomingFilters({...upcomingFilters, email: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Telefon</Label>
                        <Input
                          placeholder="Szukaj..."
                          value={upcomingFilters.phone}
                          onChange={(e) => setUpcomingFilters({...upcomingFilters, phone: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Data od</Label>
                        <Input
                          type="date"
                          value={upcomingFilters.dateFrom}
                          onChange={(e) => setUpcomingFilters({...upcomingFilters, dateFrom: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Data do</Label>
                        <Input
                          type="date"
                          value={upcomingFilters.dateTo}
                          onChange={(e) => setUpcomingFilters({...upcomingFilters, dateTo: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {filterBookings(bookings, upcomingFilters, true).length > 0 ? (
                      filterBookings(bookings, upcomingFilters, true)
                        .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
                        .map(booking => (
                          <div key={booking.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{booking.customerName}</h4>
                                <p className="text-sm text-gray-600">{booking.customerEmail}</p>
                                <p className="text-sm text-gray-600">{booking.customerPhone}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'destructive'}>
                                  {translateBookingStatus(booking.status)}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditReservation(booking)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-500">Przyjazd:</span>
                                <p className="font-medium">{format(new Date(booking.checkIn), 'dd.MM.yyyy', { locale: pl })}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Wyjazd:</span>
                                <p className="font-medium">{format(new Date(booking.checkOut), 'dd.MM.yyyy', { locale: pl })}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Liczba osób:</span>
                                <p className="font-medium">{booking.numberOfPeople}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Cena:</span>
                                <p className="font-medium">{booking.totalPrice} zł</p>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-500">Brak nadchodzących rezerwacji</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="archive">
              <Card>
                <CardHeader>
                  <CardTitle>Archiwum rezerwacji</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <Label className="text-xs">Imię i nazwisko</Label>
                        <Input
                          placeholder="Szukaj..."
                          value={archiveFilters.name}
                          onChange={(e) => setArchiveFilters({...archiveFilters, name: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Email</Label>
                        <Input
                          placeholder="Szukaj..."
                          value={archiveFilters.email}
                          onChange={(e) => setArchiveFilters({...archiveFilters, email: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Telefon</Label>
                        <Input
                          placeholder="Szukaj..."
                          value={archiveFilters.phone}
                          onChange={(e) => setArchiveFilters({...archiveFilters, phone: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Data od</Label>
                        <Input
                          type="date"
                          value={archiveFilters.dateFrom}
                          onChange={(e) => setArchiveFilters({...archiveFilters, dateFrom: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Data do</Label>
                        <Input
                          type="date"
                          value={archiveFilters.dateTo}
                          onChange={(e) => setArchiveFilters({...archiveFilters, dateTo: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {filterBookings(bookings, archiveFilters, false, true).length > 0 ? (
                      filterBookings(bookings, archiveFilters, false, true)
                        .sort((a, b) => new Date(b.checkOut).getTime() - new Date(a.checkOut).getTime())
                        .map(booking => (
                          <div key={booking.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{booking.customerName}</h4>
                                <p className="text-sm text-gray-600">{booking.customerEmail}</p>
                                <p className="text-sm text-gray-600">{booking.customerPhone}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={booking.status === 'completed' ? 'default' : booking.status === 'cancelled' ? 'destructive' : 'secondary'}>
                                  {translateBookingStatus(booking.status)}
                                </Badge>
                              </div>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-500">Przyjazd:</span>
                                <p className="font-medium">{format(new Date(booking.checkIn), 'dd.MM.yyyy', { locale: pl })}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Wyjazd:</span>
                                <p className="font-medium">{format(new Date(booking.checkOut), 'dd.MM.yyyy', { locale: pl })}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Liczba osób:</span>
                                <p className="font-medium">{booking.numberOfPeople}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Cena:</span>
                                <p className="font-medium">{booking.totalPrice} zł</p>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-500">Brak rezerwacji w archiwum</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Udogodnienia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-2">
                {spot.amenities.electricity && (
                  <div className="flex items-center text-sm">
                    <Zap className="w-4 h-4 mr-2 text-green-600" />
                    <span>Prąd elektryczny</span>
                  </div>
                )}
                {spot.amenities.water && (
                  <div className="flex items-center text-sm">
                    <Droplet className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Dostęp do wody</span>
                  </div>
                )}
                {spot.amenities.wifi && (
                  <div className="flex items-center text-sm">
                    <Wifi className="w-4 h-4 mr-2 text-green-600" />
                    <span>WiFi</span>
                  </div>
                )}
                {spot.amenities.firePit && (
                  <div className="flex items-center text-sm">
                    <span className="mr-2">🔥</span>
                    <span>Miejsce na ognisko</span>
                  </div>
                )}
                {spot.amenities.picnicTable && (
                  <div className="flex items-center text-sm">
                    <span className="mr-2">🪑</span>
                    <span>Stół piknikowy</span>
                  </div>
                )}
                {spot.amenities.shower && (
                  <div className="flex items-center text-sm">
                    <span className="mr-2">🚿</span>
                    <span>Prysznic</span>
                  </div>
                )}
                {spot.amenities.toilet && (
                  <div className="flex items-center text-sm">
                    <span className="mr-2">🚽</span>
                    <span>Toaleta</span>
                  </div>
                )}
                {!Object.values(spot.amenities).some(Boolean) && (
                  <div className="text-sm text-gray-500">Brak dodatkowych udogodnień</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statystyki</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Aktualnie gości:</span>
                <span className="font-semibold">
                  {currentBookings.reduce((sum, b) => sum + b.numberOfPeople, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Aktywne rezerwacje:</span>
                <span className="font-semibold">{currentBookings.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pojemność:</span>
                <span className="font-semibold">{spot.capacity} osób</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edytuj pole namiotowe</h3>
            
            <div className="space-y-4">
              <div>
                <Label>Nazwa</Label>
                <Input
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label>Opis</Label>
                <Textarea
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Strefa</Label>
                  <Input
                    value={editFormData.location?.zone || ''}
                    onChange={(e) => setEditFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location!, zone: e.target.value } 
                    }))}
                  />
                </div>
                <div>
                  <Label>Numer miejsca</Label>
                  <Input
                    value={editFormData.location?.spotNumber || ''}
                    onChange={(e) => setEditFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location!, spotNumber: e.target.value } 
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pojemność</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editFormData.capacity || 1}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label>Cena za noc (PLN)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editFormData.pricePerNight || 0}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, pricePerNight: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2">Udogodnienia</Label>
                <div className="space-y-2">
                  {Object.entries(editFormData.amenities || {}).map(([key, value]) => {
                    const amenityLabels: Record<string, string> = {
                      electricity: 'Prąd elektryczny',
                      water: 'Dostęp do wody',
                      wifi: 'WiFi',
                      firePit: 'Miejsce na ognisko',
                      picnicTable: 'Stół piknikowy',
                      shower: 'Prysznic',
                      toilet: 'Toaleta'
                    }
                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          checked={value as boolean}
                          onCheckedChange={(checked) => setEditFormData(prev => ({
                            ...prev,
                            amenities: { ...prev.amenities!, [key]: checked }
                          }))}
                        />
                        <Label className="font-normal">{amenityLabels[key]}</Label>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={handleEditSave} disabled={isSaving}>
                {isSaving ? 'Zapisywanie...' : 'Zapisz'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Anuluj
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Potwierdź usunięcie</h3>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Czy na pewno chcesz usunąć pole <strong>{spot.name}</strong>?
              </p>
              <p className="text-sm text-gray-500">
                Ta operacja jest nieodwracalna. Wszystkie rezerwacje powiązane z tym polem również zostaną usunięte.
              </p>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Anuluj
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSpot}
                disabled={isSaving}
              >
                {isSaving ? 'Usuwanie...' : 'Usuń'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Edit Dialog */}
      {isEditReservationOpen && editingReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edytuj rezerwację</h3>
            
            <div className="space-y-4">
              <div>
                <Label>Imię i nazwisko</Label>
                <Input
                  value={reservationFormData.customerName || ''}
                  onChange={(e) => setReservationFormData(prev => ({ ...prev, customerName: e.target.value }))}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={reservationFormData.customerEmail || ''}
                  onChange={(e) => setReservationFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                />
              </div>

              <div>
                <Label>Telefon</Label>
                <Input
                  type="tel"
                  value={reservationFormData.customerPhone || ''}
                  onChange={(e) => setReservationFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Przyjazd</Label>
                  <Input
                    type="date"
                    value={reservationFormData.checkIn ? new Date(reservationFormData.checkIn).toISOString().split('T')[0] : ''}
                    onChange={(e) => setReservationFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Wyjazd</Label>
                  <Input
                    type="date"
                    value={reservationFormData.checkOut ? new Date(reservationFormData.checkOut).toISOString().split('T')[0] : ''}
                    onChange={(e) => setReservationFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Liczba osób</Label>
                  <Input
                    type="number"
                    min="1"
                    max={spot.capacity}
                    value={reservationFormData.numberOfPeople || 1}
                    onChange={(e) => setReservationFormData(prev => ({ ...prev, numberOfPeople: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label>Cena (zł)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={reservationFormData.totalPrice || 0}
                    onChange={(e) => setReservationFormData(prev => ({ ...prev, totalPrice: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={reservationFormData.status || 'confirmed'}
                  onValueChange={(value) => setReservationFormData(prev => ({ 
                    ...prev, 
                    status: value as 'confirmed' | 'pending' | 'cancelled' 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Potwierdzona</SelectItem>
                    <SelectItem value="pending">Oczekująca</SelectItem>
                    <SelectItem value="cancelled">Anulowana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditReservationOpen(false)
                  setEditingReservation(null)
                }}
              >
                Anuluj
              </Button>
              <Button
                onClick={handleSaveReservation}
                disabled={isSaving}
              >
                {isSaving ? 'Zapisywanie...' : 'Zapisz'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Delete Dialog */}
      {isDeleteReservationOpen && deletingReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Potwierdź usunięcie rezerwacji</h3>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Czy na pewno chcesz usunąć rezerwację dla <strong>{deletingReservation.customerName}</strong>?
              </p>
              <p className="text-sm text-gray-500">
                Okres: {format(new Date(deletingReservation.checkIn), 'dd.MM.yyyy', { locale: pl })} - {format(new Date(deletingReservation.checkOut), 'dd.MM.yyyy', { locale: pl })}
              </p>
              <p className="text-sm text-gray-500">
                Ta operacja jest nieodwracalna.
              </p>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteReservationOpen(false)
                  setDeletingReservation(null)
                }}
              >
                Anuluj
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDeleteReservation}
                disabled={isSaving}
              >
                {isSaving ? 'Usuwanie...' : 'Usuń rezerwację'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}