'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface NewSpotForm {
  name: string;
  description: string;
  location: {
    zone: string;
    spotNumber: string;
  };
  capacity: number;
  pricePerNight: number;
  amenities: {
    electricity: boolean;
    water: boolean;
    wifi: boolean;
    firePit: boolean;
    picnicTable: boolean;
    shower: boolean;
    toilet: boolean;
  };
}

export default function NewSpotPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<NewSpotForm>({
    name: '',
    description: '',
    location: {
      zone: '',
      spotNumber: '',
    },
    capacity: 4,
    pricePerNight: 100,
    amenities: {
      electricity: false,
      water: false,
      wifi: false,
      firePit: false,
      picnicTable: false,
      shower: false,
      toilet: false,
    },
  });

  const handleInputChange = (field: keyof NewSpotForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field: keyof NewSpotForm['location'], value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handleAmenitiesChange = (amenity: keyof NewSpotForm['amenities'], checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: checked
      }
    }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/campsites/spots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create spot');
      }

      router.push('/campsites');
    } catch (error) {
      console.error('Error creating spot:', error);
      alert('Wystąpił błąd podczas tworzenia działki');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Dodaj nową działkę</h1>
          <Button
            variant="ghost"
            onClick={() => router.push('/campsites')}
          >
            Anuluj
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="name">Nazwa działki</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="np. Działka A1"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Opisz działkę..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zone">Strefa</Label>
              <Input
                id="zone"
                value={formData.location.zone}
                onChange={(e) => handleLocationChange('zone', e.target.value)}
                placeholder="np. A"
                required
              />
            </div>
            <div>
              <Label htmlFor="spotNumber">Numer miejsca</Label>
              <Input
                id="spotNumber"
                value={formData.location.spotNumber}
                onChange={(e) => handleLocationChange('spotNumber', e.target.value)}
                placeholder="np. 1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="capacity">Pojemność (osoby)</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                min="1"
                required
              />
            </div>
            <div>
              <Label htmlFor="pricePerNight">Cena za noc (PLN)</Label>
              <Input
                id="pricePerNight"
                type="number"
                value={formData.pricePerNight}
                onChange={(e) => handleInputChange('pricePerNight', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-lg font-medium mb-4">Udogodnienia</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData.amenities).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => handleAmenitiesChange(key as keyof NewSpotForm['amenities'], checked as boolean)}
                  />
                  <Label htmlFor={key} className="cursor-pointer">
                    {{
                      electricity: 'Prąd elektryczny',
                      water: 'Dostęp do wody',
                      wifi: 'WiFi',
                      firePit: 'Miejsce na ognisko',
                      picnicTable: 'Stół piknikowy',
                      shower: 'Prysznic',
                      toilet: 'Toaleta'
                    }[key]}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/campsites')}
            >
              Anuluj
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving || !formData.name || !formData.location.zone || !formData.location.spotNumber}
            >
              {isSaving ? 'Dodawanie...' : 'Dodaj działkę'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}