'use client'

import { useState } from 'react'
import { CampsiteSpot } from '@/types/campsite'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Edit, Trash2, MapPin, Users, Zap, Wifi, Droplet } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CampsiteGridProps {
  spots: CampsiteSpot[]
  onUpdate: () => void
}

export function CampsiteGrid({ spots, onUpdate }: CampsiteGridProps) {
  const [editingSpot, setEditingSpot] = useState<CampsiteSpot | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<CampsiteSpot>>({})

  const handleEdit = (spot: CampsiteSpot) => {
    setEditingSpot(spot)
    setFormData(spot)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const spotToSave = editingSpot
        ? { ...formData, id: editingSpot.id }
        : { ...formData, id: Date.now().toString() }

      const response = await fetch('/api/campsites/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spotToSave)
      })

      if (response.ok) {
        setIsDialogOpen(false)
        onUpdate()
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę działkę?')) return

    try {
      const response = await fetch(`/api/campsites/spots/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Błąd podczas usuwania:', error)
    }
  }

  const toggleAvailability = async (spot: CampsiteSpot) => {
    const updatedSpot = { ...spot, isAvailable: !spot.isAvailable }

    try {
      const response = await fetch(`/api/campsites/spots/${spot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSpot)
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji:', error)
    }
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      tent: 'Namiot',
      caravan: 'Przyczepa',
      camper: 'Kamper',
      glamping: 'Glamping'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getTypeColor = (type: string) => {
    const colors = {
      tent: 'bg-green-100 text-green-800',
      caravan: 'bg-blue-100 text-blue-800',
      camper: 'bg-purple-100 text-purple-800',
      glamping: 'bg-amber-100 text-amber-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spots.map((spot) => (
          <Card key={spot.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{spot.name}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-3 h-3" />
                      {spot.location?.zone && spot.location?.spotNumber
                        ? `Strefa ${spot.location.zone}, miejsce ${spot.location.spotNumber}`
                        : 'Lokalizacja nieokreślona'}
                    </div>
                  </CardDescription>
                </div>
                <Badge className={getTypeColor(spot.type)}>
                  {getTypeLabel(spot.type)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cena za noc:</span>
                  <span className="font-semibold">{spot.pricePerNight} zł</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pojemność:</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{spot.capacity} os.</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  {spot.utilities.electricity && <Zap className="w-4 h-4 text-yellow-500" />}
                  {spot.utilities.water && <Droplet className="w-4 h-4 text-blue-500" />}
                  {spot.utilities.wifi && <Wifi className="w-4 h-4 text-green-500" />}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={spot.isAvailable}
                      onCheckedChange={() => toggleAvailability(spot)}
                    />
                    <Label className="text-sm">
                      {spot.isAvailable ? 'Dostępne' : 'Niedostępne'}
                    </Label>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(spot)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(spot.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSpot ? 'Edytuj działkę' : 'Dodaj nową działkę'}
            </DialogTitle>
            <DialogDescription>
              {editingSpot ? 'Edytuj dane istniejącej działki.' : 'Utwórz nową działkę na polu namiotowym.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nazwa działki</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="np. Działka A1"
                />
              </div>
              
              <div>
                <Label>Typ</Label>
                <Select
                  value={formData.type || 'tent'}
                  onValueChange={(value) => setFormData({ ...formData, type: value as CampsiteSpot['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tent">Namiot</SelectItem>
                    <SelectItem value="caravan">Przyczepa</SelectItem>
                    <SelectItem value="camper">Kamper</SelectItem>
                    <SelectItem value="glamping">Glamping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Pojemność (os.)</Label>
                <Input
                  type="number"
                  value={formData.capacity || 0}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                />
              </div>
              
              <div>
                <Label>Cena za noc (zł)</Label>
                <Input
                  type="number"
                  value={formData.pricePerNight || 0}
                  onChange={(e) => setFormData({ ...formData, pricePerNight: parseInt(e.target.value) })}
                />
              </div>
              
              <div>
                <Label>Strefa</Label>
                <Input
                  value={formData.location?.zone || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: {
                      zone: e.target.value,
                      spotNumber: formData.location?.spotNumber ?? ''
                    }
                  })}
                  placeholder="np. A"
                />
              </div>
            </div>

            <div>
              <Label>Opis</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Opis działki..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Prąd
                </Label>
                <Switch
                  checked={formData.utilities?.electricity || false}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    utilities: {
                      electricity: Boolean(checked),
                      water: formData.utilities?.water ?? false,
                      sewage: formData.utilities?.sewage ?? false,
                      wifi: formData.utilities?.wifi ?? false
                    }
                  })}
                />
              </div>
              
              <div>
                <Label className="flex items-center gap-2">
                  <Droplet className="w-4 h-4" />
                  Woda
                </Label>
                <Switch
                  checked={formData.utilities?.water || false}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    utilities: {
                      electricity: formData.utilities?.electricity ?? false,
                      water: Boolean(checked),
                      sewage: formData.utilities?.sewage ?? false,
                      wifi: formData.utilities?.wifi ?? false
                    }
                  })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Anuluj
              </Button>
              <Button onClick={handleSave}>
                {editingSpot ? 'Zapisz zmiany' : 'Dodaj działkę'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}