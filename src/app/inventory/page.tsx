'use client'

import { useState } from 'react'
import { EquipmentTable } from '@/components/equipment-table'
import { CarsTable } from '@/components/cars-table'
import { CategoryManager } from '@/components/category-manager'
import { Category } from '@/types/inventory'

export default function InventoryPage() {
  const [categories, setCategories] = useState<Category[]>([])

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">Inwentarz</h1>
            <p className="text-gray-600">Zarządzaj sprzętem i pojazdami w systemie</p>
          </div>
          <CategoryManager categories={categories} setCategories={setCategories} />
        </div>
      </div>

      <div className="space-y-8">

        <div>
          <h2 className="text-2xl font-semibold mb-4">Sprzęt</h2>
          <EquipmentTable categories={categories} />
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Pojazdy</h2>
          <CarsTable categories={categories} />
        </div>
      </div>
    </div>
  )
}