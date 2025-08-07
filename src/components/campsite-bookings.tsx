'use client'

import { useState } from 'react'
import { CampsiteBooking, CampsiteSpot } from '@/types/campsite'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Mail, Phone, Users, DollarSign, Clock, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface CampsiteBookingsProps {
  bookings: CampsiteBooking[]
  spots: CampsiteSpot[]
  onUpdate: () => void
}

export function CampsiteBookings({ bookings, spots, onUpdate }: CampsiteBookingsProps) {
  const [editingBooking, setEditingBooking] = useState<CampsiteBooking | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<CampsiteBooking>>({})
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Oczekująca',
      confirmed: 'Potwierdzona',
      cancelled: 'Anulowana',
      completed: 'Zakończona'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const calculateTotalPrice = (checkIn: Date, checkOut: Date, spotId: string) => {
    const spot = spots.find(s => s.id === spotId)
    if (!spot) return 0

    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    return nights * spot.pricePerNight
  }

  const handleEdit = (booking: CampsiteBooking) => {
    setEditingBooking(booking)
    setFormData({
      ...booking,
      checkIn: new Date(booking.checkIn).toISOString().split('T')[0],
      checkOut: new Date(booking.checkOut).toISOString().split('T')[0]
    })
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingBooking(null)
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      spotId: '',
      checkIn: '',
      checkOut: '',
      numberOfPeople: 1,
      specialRequests: '',
      status: 'pending',
      addons: {
        firePit: false,
        electricity: false,
        meals: false,
        groupTransport: false,
        gazebo: false,
        driversCount: 0
      }
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const spot = spots.find(s => s.id === formData.spotId)
      if (!spot) return

      const checkInDate = new Date(formData.checkIn as string)
      const checkOutDate = new Date(formData.checkOut as string)
      const totalPrice = calculateTotalPrice(checkInDate, checkOutDate, formData.spotId as string)

      const bookingToSave = {
        ...formData,
        totalPrice,
        id: editingBooking?.id || Date.now().toString()
      }

      const response = await fetch('/api/campsites/bookings', {
        method: editingBooking ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingToSave)
      })

      if (response.ok) {
        setIsDialogOpen(false)
        onUpdate()
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania rezerwacji:', error)
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/campsites/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status: newStatus })
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji statusu:', error)
    }
  }

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus)

  const sortedBookings = [...filteredBookings].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="pending">Oczekujące</SelectItem>
              <SelectItem value="confirmed">Potwierdzone</SelectItem>
              <SelectItem value="cancelled">Anulowane</SelectItem>
              <SelectItem value="completed">Zakończone</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-600">
            {filteredBookings.length} rezerwacji
          </span>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Nowa rezerwacja
        </Button>
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Klient</TableHead>
              <TableHead>Działka</TableHead>
              <TableHead>Termin</TableHead>
              <TableHead>Liczba osób</TableHead>
              <TableHead>Cena</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedBookings.map((booking) => {
              const spot = spots.find(s => s.id === booking.spotId)
              return (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.customerName}</div>
                      <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{spot?.name || 'Nieznana'}</div>
                      <div className="text-sm text-gray-500">
                        {spot?.type === 'tent' ? 'Namiot' : 
                         spot?.type === 'caravan' ? 'Przyczepa' :
                         spot?.type === 'camper' ? 'Kamper' : 'Glamping'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(new Date(booking.checkIn), 'dd.MM.yyyy', { locale: pl })}</div>
                      <div className="text-gray-500">{format(new Date(booking.checkOut), 'dd.MM.yyyy', { locale: pl })}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{booking.numberOfPeople}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{booking.totalPrice} zł</div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={booking.status}
                      onValueChange={(value) => handleStatusChange(booking.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Oczekująca</SelectItem>
                        <SelectItem value="confirmed">Potwierdzona</SelectItem>
                        <SelectItem value="cancelled">Anulowana</SelectItem>
                        <SelectItem value="completed">Zakończona</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(booking)}
                    >
                      Edytuj
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-4">
        {sortedBookings.map((booking) => {
          const spot = spots.find(s => s.id === booking.spotId)
          return (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{booking.customerName}</CardTitle>
                    <CardDescription>{booking.customerEmail}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Działka:</span>
                    <span>{spot?.name || 'Nieznana'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Termin:</span>
                    <span>
                      {format(new Date(booking.checkIn), 'dd.MM', { locale: pl })} - 
                      {format(new Date(booking.checkOut), 'dd.MM', { locale: pl })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Liczba osób:</span>
                    <span>{booking.numberOfPeople} os.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cena:</span>
                    <span className="font-medium">{booking.totalPrice} zł</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(booking)}
                  >
                    Edytuj
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBooking ? 'Edytuj rezerwację' : 'Nowa rezerwacja'}
            </DialogTitle>
            <DialogDescription>
              {editingBooking ? 'Edytuj dane istniejącej rezerwacji.' : 'Utwórz nową rezerwację działki.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Imię i nazwisko</Label>
                <Input
                  value={formData.customerName || ''}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Jan Kowalski"
                />
              </div>
              
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.customerEmail || ''}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  placeholder="jan@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Telefon</Label>
                <Input
                  value={formData.customerPhone || ''}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="+48 123 456 789"
                />
              </div>
              
              <div>
                <Label>Działka</Label>
                <Select
                  value={formData.spotId || ''}
                  onValueChange={(value) => setFormData({ ...formData, spotId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz działkę" />
                  </SelectTrigger>
                  <SelectContent>
                    {spots.map((spot) => (
                      <SelectItem key={spot.id} value={spot.id}>
                        {spot.name} ({spot.pricePerNight} zł/noc)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data zameldowania</Label>
                <Input
                  type="date"
                  value={formData.checkIn || ''}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                />
              </div>
              
              <div>
                <Label>Data wymeldowania</Label>
                <Input
                  type="date"
                  value={formData.checkOut || ''}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Liczba osób</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.numberOfPeople || 1}
                  onChange={(e) => setFormData({ ...formData, numberOfPeople: parseInt(e.target.value) || 1 })}
                />
              </div>
              
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status || 'pending'}
                  onValueChange={(value) => setFormData({ ...formData, status: value as 'pending' | 'confirmed' | 'cancelled' | 'completed' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Oczekująca</SelectItem>
                    <SelectItem value="confirmed">Potwierdzona</SelectItem>
                    <SelectItem value="cancelled">Anulowana</SelectItem>
                    <SelectItem value="completed">Zakończona</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Dodatki w cenie</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="meals"
                    checked={formData.addons?.meals || false}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      addons: { ...prev.addons, meals: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  <label htmlFor="meals" className="text-sm">Wyżywienie</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="groupTransport"
                    checked={formData.addons?.groupTransport || false}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      addons: { ...prev.addons, groupTransport: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  <label htmlFor="groupTransport" className="text-sm">Transport grupowy</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="electricity"
                    checked={formData.addons?.electricity || false}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      addons: { ...prev.addons, electricity: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  <label htmlFor="electricity" className="text-sm">Prąd</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="gazebo"
                    checked={formData.addons?.gazebo || false}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      addons: { ...prev.addons, gazebo: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  <label htmlFor="gazebo" className="text-sm">Altana</label>
                </div>
                <div className="flex items-center col-span-2">
                  <label htmlFor="driversCount" className="text-sm mr-2">Ilość kierowców:</label>
                  <input
                    type="number"
                    id="driversCount"
                    min="0"
                    value={formData.addons?.driversCount || 0}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      addons: { ...prev.addons, driversCount: parseInt(e.target.value) || 0 }
                    }))}
                    className="border rounded px-2 py-1 text-sm w-16"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label>Specjalne życzenia</Label>
              <Textarea
                value={formData.specialRequests || ''}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                placeholder="Dodatkowe informacje..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Anuluj
              </Button>
              <Button onClick={handleSave}>
                {editingBooking ? 'Zapisz zmiany' : 'Utwórz rezerwację'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}