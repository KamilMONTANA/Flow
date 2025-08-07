"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger 
} from "@/components/ui/drawer"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Route } from "@/types/route"
import { useRoutes } from "@/contexts/routes-context"
import { toast } from "sonner"


export function RouteManager() {
  const { routes, addRoute, updateRoute, deleteRoute, updateBookingsAfterRouteDelete } = useRoutes()
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false)
  const [routeToDelete, setRouteToDelete] = React.useState<Route | null>(null)
  const [editingRoute, setEditingRoute] = React.useState<Route | null>(null)
  const [name, setName] = React.useState("")
  const [color, setColor] = React.useState("#3B82F6") // Domyślny kolor niebieski

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Nazwa trasy nie może być pusta")
      return
    }

    if (editingRoute) {
      // Edycja istniejącej trasy
      updateRoute(editingRoute.id, { name, color })
      toast.success("Trasa została zaktualizowana")
    } else {
      // Tworzenie nowej trasy
      addRoute({ name, color })
      toast.success("Nowa trasa została dodana")
    }

    // Reset formularza
    setName("")
    setColor("#3B82F6")
    setEditingRoute(null)
    setIsDrawerOpen(false)
  }

  const handleEdit = (route: Route) => {
    setEditingRoute(route)
    setName(route.name)
    setColor(route.color)
    setIsDrawerOpen(true)
  }

  const handleDeleteClick = (route: Route) => {
    setRouteToDelete(route)
    setIsDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (routeToDelete) {
      deleteRoute(routeToDelete.id)
      updateBookingsAfterRouteDelete(routeToDelete.id)
      toast.success("Trasa została usunięta")
      setIsDeleteConfirmOpen(false)
      setRouteToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteConfirmOpen(false)
    setRouteToDelete(null)
  }

  const handleCancel = () => {
    setName("")
    setColor("#3B82F6")
    setEditingRoute(null)
    setIsDrawerOpen(false)
  }

  return (
    <div>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline">Zarządzaj trasami</Button>
        </DrawerTrigger>
        <DrawerContent className="max-w-4xl mx-auto">
          <DrawerHeader>
            <DrawerTitle>
              {editingRoute ? "Edytuj trasę" : "Zarządzaj trasami"}
            </DrawerTitle>
            <DrawerDescription>
              {editingRoute
                ? `Edytujesz trasę: ${editingRoute.name}`
                : "Dodaj nową trasę lub edytuj/usuń istniejące trasy"}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Formularz dodawania/edycji trasy */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">
                  {editingRoute ? "Edytuj trasę" : "Dodaj nową trasę"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="route-name">Nazwa trasy</Label>
                    <Input
                      id="route-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Wprowadź nazwę trasy"
                    />
                  </div>
                  <div>
                    <Label htmlFor="route-color">Kolor trasy</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="route-color"
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <span className="text-sm text-gray-500">{color}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>
                      {editingRoute ? "Zaktualizuj" : "Dodaj trasę"}
                    </Button>
                    {editingRoute && (
                      <Button variant="outline" onClick={handleCancel}>
                        Anuluj
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Lista tras */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Istniejące trasy</h3>
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nazwa</TableHead>
                        <TableHead>Kolor</TableHead>
                        <TableHead className="text-right">Akcje</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {routes.map((route) => (
                        <TableRow key={route.id}>
                          <TableCell className="font-medium">{route.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: route.color }}
                              />
                              <span className="text-sm">{route.color}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(route)}
                              >
                                Edytuj
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClick(route)}
                              >
                                Usuń
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
          
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Zamknij</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      
      <Drawer open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DrawerContent className="max-w-md mx-auto">
          <DrawerHeader>
            <DrawerTitle>Potwierdź usunięcie trasy</DrawerTitle>
            <DrawerDescription>
              Czy na pewno chcesz usunąć trasę &quot;{routeToDelete?.name}&quot;? Tej operacji nie można cofnąć.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Usuń trasę
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" onClick={handleDeleteCancel}>
                Anuluj
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}