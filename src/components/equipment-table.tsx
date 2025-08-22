'use client'

import { useState, useEffect } from 'react'
import { Equipment, Category } from '@/types/inventory'
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


interface EquipmentTableProps {
  categories: Category[]
}

export function EquipmentTable({ categories }: EquipmentTableProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Equipment | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    price: 0, // cena za jedną sztukę
    description: '',
    condition: 'good' as Equipment['condition'],
    categoryId: '',
  })

  useEffect(() => {
    loadEquipment()
  }, [])

  const loadEquipment = async () => {
    try {
      const response = await fetch('/api/inventory/equipment')
      if (response.ok) {
        const data = await response.json()
        setEquipment(data)
      }
    } catch (error) {
      console.error('Błąd podczas ładowania sprzętu:', error)
    }
  }

  const saveEquipment = async (newEquipment: Equipment[]) => {
    try {
      const response = await fetch('/api/inventory/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEquipment),
      })
      return response.ok
    } catch (error) {
      console.error('Błąd podczas zapisywania sprzętu:', error)
      return false
    }
  }

  const handleAdd = async () => {
    const newItem: Equipment = {
      id: uuidv4(),
      ...formData,
    }
    const newEquipment = [...equipment, newItem]
    setEquipment(newEquipment)
    await saveEquipment(newEquipment)
    resetForm()
  }

  const handleEdit = (item: Equipment) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      quantity: item.quantity,
      price: item.price ?? 0,
      description: item.description || '',
      condition: item.condition,
      categoryId: item.categoryId,
    })
    setIsDrawerOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingItem) return
    
    const newEquipment = equipment.map(item => 
      item.id === editingItem.id 
        ? { ...item, ...formData }
        : item
    )
    setEquipment(newEquipment)
    await saveEquipment(newEquipment)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    const newEquipment = equipment.filter(item => item.id !== id)
    setEquipment(newEquipment)
    await saveEquipment(newEquipment)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      quantity: 0,
      price: 0,
      description: '',
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



  const getConditionLabel = (condition: Equipment['condition']) => {
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
        <h3 className="text-lg font-semibold">Lista sprzętu</h3>
        <Button onClick={openDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj sprzęt
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nazwa</TableHead>
            <TableHead>Kategoria</TableHead>
            <TableHead>Ilość</TableHead>
            <TableHead>Cena</TableHead>
            <TableHead>Stan</TableHead>
            <TableHead>Opis</TableHead>
            <TableHead>Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipment.map((item) => {
            const category = categories.find(cat => cat.id === item.categoryId)
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
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
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  {/* wyświetlenie ceny z dokładnością do groszy */}
                  {item.price !== undefined ? `${item.price.toFixed(2)} zł` : '-'}
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
                <TableCell className="max-w-xs truncate">{item.description}</TableCell>
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
              {editingItem ? 'Edytuj sprzęt' : 'Dodaj nowy sprzęt'}
            </DrawerTitle>
            <DrawerDescription>
              {editingItem 
                ? 'Edytuj dane istniejącego sprzętu.' 
                : 'Dodaj nowy sprzęt do inwentarza.'}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="np. Kajak jednoosobowy"
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
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Cena</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                }
                placeholder="Cena w zł" // pole do wpisania ceny
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Stan</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData({ ...formData, condition: value as Equipment['condition'] })}
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
            
            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Opcjonalny opis sprzętu"
              />
            </div>
          </div>
          
          <DrawerFooter>
            <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={editingItem ? handleUpdate : handleAdd}>
              {editingItem ? 'Zapisz zmiany' : 'Dodaj sprzęt'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}