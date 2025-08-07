'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Settings, Trash2, Edit } from 'lucide-react'
import { Category } from '@/types/inventory'
import { v4 as uuidv4 } from 'uuid'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'





interface CategoryManagerProps {
  categories: Category[]
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>
}

export function CategoryManager({ categories, setCategories }: CategoryManagerProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
    description: ''
  })

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        color: category.color,
        description: category.description
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        color: '#3b82f6',
        description: ''
      })
    }
    setIsDrawerOpen(true)
  }

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      return
    }
    const newCategory: Category = {
      id: uuidv4(),
      name: formData.name.trim(),
      color: formData.color,
      description: formData.description.trim()
    }
    const newCategories = [...categories, newCategory]
    setCategories(newCategories)
    await saveCategories(newCategories)
    setIsDrawerOpen(false)
    resetForm()
  }

  const handleUpdate = async () => {
    if (!editingCategory || !formData.name.trim()) {
      return
    }
    
    const newCategories = categories.map(cat => 
      cat.id === editingCategory.id 
        ? { ...cat, name: formData.name.trim(), color: formData.color, description: formData.description.trim() }
        : cat
    )
    setCategories(newCategories)
    await saveCategories(newCategories)
    setIsDrawerOpen(false)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    const newCategories = categories.filter(cat => cat.id !== id)
    setCategories(newCategories)
    await saveCategories(newCategories)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#3b82f6',
      description: ''
    })
    setEditingCategory(null)
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/inventory/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Błąd podczas ładowania kategorii:', error)
    }
  }

  const saveCategories = async (newCategories: Category[]) => {
    try {
      const response = await fetch('/api/inventory/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategories),
      })
      return response.ok
    } catch (error) {
      console.error('Błąd podczas zapisywania kategorii:', error)
      return false
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Zarządzaj kategoriami
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Kategorie ({categories?.length || 0})</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {categories?.map((category) => (
            <DropdownMenuItem key={category.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm">{category.name}</span>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => openDialog(category)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-destructive"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Dodaj nową kategorię
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editingCategory ? 'Edytuj kategorię' : 'Dodaj nową kategorię'}
            </DrawerTitle>
            <DrawerDescription>
              {editingCategory 
                ? 'Edytuj dane istniejącej kategorii.' 
                : 'Utwórz nową kategorię do organizacji inwentarza.'}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nazwa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="np. Kajaki"
                className={!formData.name.trim() ? "border-red-300" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Kolor</Label>
              <div className="flex items-center gap-3">
                <input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-12 rounded cursor-pointer border border-gray-300"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#000000"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis (opcjonalny)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Krótki opis kategorii"
              />
            </div>
          </div>
          
          <DrawerFooter>
            <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
              Anuluj
            </Button>
            <Button 
              onClick={editingCategory ? handleUpdate : handleAdd}
              disabled={!formData.name.trim()}
            >
              {editingCategory ? 'Zapisz zmiany' : 'Dodaj kategorię'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}