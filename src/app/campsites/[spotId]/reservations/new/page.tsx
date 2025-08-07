"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CampsiteSpot } from '@/types/campsite'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function NewReservationPage() {
  const router = useRouter()
  const params = useParams()
  const spotId = params.spotId as string

  const [spot, setSpot] = useState<CampsiteSpot | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    numberOfPeople: 1,
    checkIn: new Date(),
    checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000), // +1 day
    notes: '',
    // Dodatki w cenie
    addons: {
      firePit: false,
      electricity: false,
      meals: false,
      groupTransport: false,
      gazebo: false,
      driversCount: 0
    },
    totalPrice: 0
  })

  const loadSpot = useCallback(async () => {
    try {
      const response = await fetch(`/api/campsites/spots`)
      if (response.ok) {
        const spots = await response.json()
        const foundSpot = spots.find((s: CampsiteSpot) => s.id === spotId)
        setSpot(foundSpot)
      }
    } catch (error) {
      console.error('Błąd podczas ładowania działki:', error)
    } finally {
      setLoading(false)
    }
  }, [spotId])

  useEffect(() => {
    loadSpot()
  }, [spotId, loadSpot])

  useEffect(() => {
    if (spot) {
      const nights = Math.ceil((formData.checkOut.getTime() - formData.checkIn.getTime()) / (1000 * 60 * 60 * 24))
      setFormData(prev => ({
        ...prev,
        totalPrice: nights * spot.pricePerNight * formData.numberOfPeople
      }))
    }
  }, [formData.checkIn, formData.checkOut, formData.numberOfPeople, spot])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!spot) return

    setSaving(true)
    
    try {
      const response = await fetch('/api/campsites/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          spotId: spot.id,
          status: 'pending',
          addons: formData.addons
        }),
      })

      if (response.ok) {
        router.push('/campsites')
      } else {
        console.error('Błąd podczas zapisywania rezerwacji')
      }
    } catch (error) {
      console.error('Błąd:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfPeople' ? parseInt(value) || 1 : value
    }))
  }

  const handleAddonChange = (addon: keyof typeof formData.addons, checked: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      addons: {
        ...prev.addons,
        [addon]: checked as boolean
      }
    }))
  }
  
  const handleDriversCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setFormData(prev => ({
      ...prev,
      addons: {
        ...prev.addons,
        driversCount: value
      }
    }));
  }

  const handleDateChange = (type: 'checkIn' | 'checkOut', date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        [type]: date
      }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!spot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Błąd</CardTitle>
            <CardDescription>Nie znaleziono działki</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/campsites')}>
              Powrót do listy działek
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/campsites')}
            className="mb-4"
          >
            ← Powrót do listy działek
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nowa rezerwacja</h1>
            <p className="text-gray-600">Działka: {spot.name} ({spot.type})</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formularz rezerwacji</CardTitle>
            <CardDescription>
              Wypełnij dane gościa i okres pobytu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Imię i nazwisko *</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    placeholder="Jan Kowalski"
                  />
                </div>
                
                <div>
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    required
                    placeholder="jan@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerPhone">Telefon *</Label>
                  <Input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    required
                    placeholder="+48 123 456 789"
                  />
                </div>
                
                <div>
                  <Label htmlFor="numberOfPeople">Liczba osób *</Label>
                  <Input
                    id="numberOfPeople"
                    name="numberOfPeople"
                    type="number"
                    min="1"
                    max={spot.capacity}
                    value={formData.numberOfPeople}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Data przyjazdu *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.checkIn && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.checkIn, "PPP", { locale: pl })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.checkIn}
                        onSelect={(date) => handleDateChange('checkIn', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label>Data wyjazdu *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.checkOut && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.checkOut, "PPP", { locale: pl })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.checkOut}
                        onSelect={(date) => handleDateChange('checkOut', date)}
                        disabled={(date) => date <= formData.checkIn}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div>
                <Label className="mb-2">Dodatki w cenie</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="firePit"
                      checked={formData.addons.firePit}
                      onCheckedChange={(checked) => handleAddonChange('firePit', checked as boolean)}
                    />
                    <Label htmlFor="firePit" className="font-normal">Ognisko</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="electricity"
                      checked={formData.addons.electricity}
                      onCheckedChange={(checked) => handleAddonChange('electricity', checked as boolean)}
                    />
                    <Label htmlFor="electricity" className="font-normal">Prąd</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="meals"
                      checked={formData.addons.meals}
                      onCheckedChange={(checked) => handleAddonChange('meals', checked as boolean)}
                    />
                    <Label htmlFor="meals" className="font-normal">Wyżywienie</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="groupTransport"
                      checked={formData.addons.groupTransport}
                      onCheckedChange={(checked) => handleAddonChange('groupTransport', checked as boolean)}
                    />
                    <Label htmlFor="groupTransport" className="font-normal">Wywóz całej grupy na spływ</Label>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="mb-2">Dodatkowe opcje</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="gazebo"
                      checked={formData.addons.gazebo || false}
                      onCheckedChange={(checked) => handleAddonChange('gazebo', checked as boolean)}
                    />
                    <Label htmlFor="gazebo" className="font-normal">Altana</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="driversCount"
                      type="number"
                      min="0"
                      value={formData.addons.driversCount || 0}
                      onChange={handleDriversCountChange}
                      className="w-20"
                    />
                    <Label htmlFor="driversCount" className="font-normal">Ilość kierowców</Label>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Uwagi (opcjonalne)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Dodatkowe informacje o rezerwacji..."
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Całkowita cena:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formData.totalPrice} zł
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {Math.ceil((formData.checkOut.getTime() - formData.checkIn.getTime()) / (1000 * 60 * 60 * 24))} dni × {formData.numberOfPeople} osób × {spot.pricePerNight} zł/noc
                </p>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={saving}
                >
                  {saving ? 'Zapisywanie...' : 'Zapisz rezerwację'}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/campsites')}
                >
                  Anuluj
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}