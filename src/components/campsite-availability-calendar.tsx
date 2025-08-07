'use client'

import { useState } from 'react'
import { CampsiteSpot, CampsiteBooking } from '@/types/campsite'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CampsiteAvailabilityCalendarProps {
  spots: CampsiteSpot[]
  bookings: CampsiteBooking[]
}

export function CampsiteAvailabilityCalendar({ spots, bookings }: CampsiteAvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedSpot, setSelectedSpot] = useState<string>('all')

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const checkIn = new Date(booking.checkIn)
      const checkOut = new Date(booking.checkOut)
      
      const isWithinDate = date >= checkIn && date < checkOut
      const matchesSpot = selectedSpot === 'all' || booking.spotId === selectedSpot
      
      return isWithinDate && matchesSpot && booking.status !== 'cancelled'
    })
  }

  const getSpotColor = (spotId: string) => {
    const colors = [
      'bg-blue-200 text-blue-800',
      'bg-green-200 text-green-800',
      'bg-purple-200 text-purple-800',
      'bg-yellow-200 text-yellow-800',
      'bg-pink-200 text-pink-800',
      'bg-indigo-200 text-indigo-800'
    ]
    const index = parseInt(spotId) % colors.length
    return colors[index] || colors[0]
  }

  const getAvailabilityForDate = (date: Date) => {
    const spotsToCheck = selectedSpot === 'all' ? spots : spots.filter(s => s.id === selectedSpot)
    
    const available = spotsToCheck.filter(s => {
      const spotBookings = getBookingsForDate(date)
      return s.isAvailable && spotBookings.length === 0
    })

    const booked = spotsToCheck.filter(() => {
      const spotBookings = getBookingsForDate(date)
      return spotBookings.length > 0
    })

    return { available, booked, total: spotsToCheck.length }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1))
  }

  const weekDays = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <h3 className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy', { locale: pl })}
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <select
          value={selectedSpot}
          onChange={(e) => setSelectedSpot(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="all">Wszystkie działki</option>
          {spots.map(spot => (
            <option key={spot.id} value={spot.id}>
              {spot.name} ({spot.type})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {weekDays.map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-sm font-semibold">
            {day}
          </div>
        ))}
        
        {Array.from({ length: monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1 }).map((_, index) => (
          <div key={`empty-${index}`} className="bg-white p-2" />
        ))}

        {daysInMonth.map(day => {
          const availability = getAvailabilityForDate(day)
          const dayBookings = getBookingsForDate(day)

          return (
            <div key={day.toISOString()} className="bg-white p-2 min-h-24 border">
              <div className="text-sm font-medium mb-1">
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {availability.available.length > 0 && (
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-green-50 text-green-700"
                  >
                    {availability.available.length} wolne
                  </Badge>
                )}
                
                {dayBookings.slice(0, 2).map((booking) => {
                  const spot = spots.find(s => s.id === booking.spotId)
                  return (
                    <div
                      key={booking.id}
                      className={`text-xs p-1 rounded ${getSpotColor(booking.spotId)}`}
                      title={`${spot?.name} - ${booking.customerName}`}
                    >
                      {spot?.name?.substring(0, 8)}...
                    </div>
                  )
                })}
                
                {dayBookings.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayBookings.length - 2} więcej
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Podsumowanie miesiąca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Całkowita liczba działek:</span>
                <span className="font-medium">
                  {selectedSpot === 'all' ? spots.length : 1}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Aktywnych rezerwacji:</span>
                <span className="font-medium">
                  {bookings.filter(b => b.status !== 'cancelled').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Przychód miesięczny:</span>
                <span className="font-medium">
                  {bookings
                    .filter(b => b.status !== 'cancelled')
                    .reduce((sum, b) => sum + b.totalPrice, 0)} zł
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Legenda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {spots.slice(0, 4).map(spot => (
                <div key={spot.id} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${getSpotColor(spot.id)}`} />
                  <span>{spot.name}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-200" />
                <span>Dostępne</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Najbliższe rezerwacje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bookings
                .filter(b => b.status === 'confirmed')
                .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
                .slice(0, 3)
                .map(booking => {
                  const spot = spots.find(s => s.id === booking.spotId)
                  return (
                    <div key={booking.id} className="text-sm">
                      <div className="font-medium">{booking.customerName}</div>
                      <div className="text-gray-500">
                        {spot?.name} - {format(new Date(booking.checkIn), 'dd.MM', { locale: pl })}
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}