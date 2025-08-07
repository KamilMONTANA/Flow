'use client'

import { useState, useEffect } from 'react'
import { Car, Category } from '@/types/inventory'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'


interface CarsTableProps {
  categories: Category[]
}

export function CarsTable({ categories }: CarsTableProps) {
  const [cars, setCars] = useState<Car[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Car | null>(null)
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    capacity: 1,
    quantity: 1,
    condition: 'good' as Car['condition'],
    categoryId: '',
  })

  useEffect(() => {
    loadCars()
  }, [])

  const loadCars = async () => {
    try {
      const response = await fetch('/api/inventory/cars')
      if (response.ok) {
        const data = await response.json()
        setCars(data)
      }
    } catch (error) {
      console.error('Błąd podczas ładowania samochodów:', error)
    }
  }

  const saveCars = async (newCars: Car[]) => {
    try {
      const response = await fetch('/api/inventory/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCars),
      })
      return response.ok
    } catch (error) {
      console.error('Błąd podczas zapisywania samochodów:', error)
      return false
    }
  }

  const handleAdd = async () => {
    const newItem: Car = {
      id: uuidv4(),
      ...formData,
    }
    const newCars = [...cars, newItem]
    setCars(newCars)
    await saveCars(newCars)
    resetForm()
  }

  const handleEdit = (item: Car) => {
    setEditingItem(item)
    setFormData({
      brand: item.brand,
      model: item.model,
      year: item.year,
      licensePlate: item.licensePlate,
      capacity: item.capacity,
      quantity: item.quantity,
      condition: item.condition,
      categoryId: item.categoryId,
    })
    setIsDrawerOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingItem) return
    
    const newCars = cars.map(item => 
      item.id === editingItem.id 
        ? { ...item, ...formData }
        : item
    )
    setCars(newCars)
    await saveCars(newCars)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    const newCars = cars.filter(item => item.id !== id)
    setCars(newCars)
    await saveCars(newCars)
  }

  const resetForm = () => {
    setFormData({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      capacity: 1,
      quantity: 1,
      condition: 'good',
      categoryId: categories.length > 0 ? categories[0].id : '',
    })
    setEditingItem(null)
    setIsDrawerOpen(false)
  }

  const openDialog = () => {
    resetForm()
    setIsDrawerOpen(true)
  }

  const getConditionLabel = (condition: Car['condition']) => {
    const labels = {
      new: 'Nowy',
      good: 'Dobry',
      used: 'Używany',
      damaged: 'Uszkodzony',
    }
    return labels[condition]
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Lista samochodów</h3>
        <Button onClick={openDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj samochód
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Marka</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Rok</TableHead>
            <TableHead>Nr rejestracyjny</TableHead>
            <TableHead>Pojemność</TableHead>
            <TableHead>Ilość</TableHead>
            <TableHead>Kategoria</TableHead>
            <TableHead>Stan</TableHead>
            <TableHead>Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cars.map((item) => {
            const category = categories.find(cat => cat.id === item.categoryId)
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.brand}</TableCell>
                <TableCell>{item.model}</TableCell>
                <TableCell>{item.year}</TableCell>
                <TableCell>{item.licensePlate}</TableCell>
                <TableCell>{item.capacity} osób</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  {category ? (
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Brak kategorii</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.condition === 'new' ? 'bg-green-100 text-green-800' :
                    item.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                    item.condition === 'used' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {getConditionLabel(item.condition)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button className="hidden">Trigger</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editingItem ? 'Edytuj samochód' : 'Dodaj nowy samochód'}
            </DrawerTitle>
            <DrawerDescription>
              {editingItem 
                ? 'Edytuj dane istniejącego samochodu.' 
                : 'Dodaj nowy samochód do floty.'}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marka</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="np. Volkswagen"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="np. Transporter"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">Rok produkcji</Label>
              <Input
                id="year"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="licensePlate">Numer rejestracyjny</Label>
              <Input
                id="licensePlate"
                value={formData.licensePlate}
                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                placeholder="np. KR12345"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Pojemność (osób)</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategoria</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Ilość</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="condition">Stan</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData({ ...formData, condition: value as Car['condition'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Nowy</SelectItem>
                  <SelectItem value="good">Dobry</SelectItem>
                  <SelectItem value="used">Używany</SelectItem>
                  <SelectItem value="damaged">Uszkodzony</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DrawerFooter>
            <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={editingItem ? handleUpdate : handleAdd}>
              {editingItem ? 'Zapisz zmiany' : 'Dodaj samochód'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}