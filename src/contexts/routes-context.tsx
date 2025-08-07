"use client"

import * as React from "react"
import { Route } from "@/types/route"
import { sampleRoutes } from "@/data/routes"

interface RoutesContextType {
  routes: Route[]
  addRoute: (route: Omit<Route, "id" | "createdAt" | "updatedAt">) => void
  updateRoute: (id: number, updates: Partial<Route>) => void
  deleteRoute: (id: number) => void
  updateBookingsAfterRouteDelete: (routeId: number) => Promise<void>
}

const RoutesContext = React.createContext<RoutesContextType | undefined>(undefined)

export function RoutesProvider({ children }: { children: React.ReactNode }) {
  const [routes, setRoutes] = React.useState<Route[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('routes')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return sampleRoutes
        }
      }
    }
    return sampleRoutes
  })

  const addRoute = (route: Omit<Route, "id" | "createdAt" | "updatedAt">) => {
    const newRoute: Route = {
      id: Math.max(0, ...routes.map(r => r.id)) + 1,
      ...route,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setRoutes(prev => {
      const updated = [...prev, newRoute]
      if (typeof window !== 'undefined') {
        localStorage.setItem('routes', JSON.stringify(updated))
      }
      return updated
    })
  }

  const updateRoute = (id: number, updates: Partial<Route>) => {
    setRoutes(prev => {
      const updated = prev.map(route =>
        route.id === id
          ? { ...route, ...updates, updatedAt: new Date().toISOString() }
          : route
      )
      if (typeof window !== 'undefined') {
        localStorage.setItem('routes', JSON.stringify(updated))
      }
      return updated
    })
  }

  const deleteRoute = (id: number) => {
    setRoutes(prev => {
      const updated = prev.filter(route => route.id !== id)
      if (typeof window !== 'undefined') {
        localStorage.setItem('routes', JSON.stringify(updated))
      }
      return updated
    })
  }

  const updateBookingsAfterRouteDelete = async (routeId: number) => {
    try {
      // Wywołaj API do aktualizacji rezerwacji
      const response = await fetch('/api/update-bookings-after-route-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ routeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bookings');
      }

      console.log(`Zaktualizowano rezerwacje po usunięciu trasy ${routeId}`);
    } catch (error) {
      console.error('Błąd podczas aktualizacji rezerwacji:', error);
    }
  };

  return (
    <RoutesContext.Provider value={{ routes, addRoute, updateRoute, deleteRoute, updateBookingsAfterRouteDelete }}>
      {children}
    </RoutesContext.Provider>
  )
}

export function useRoutes() {
  const context = React.useContext(RoutesContext)
  if (context === undefined) {
    throw new Error("useRoutes must be used within a RoutesProvider")
  }
  return context
}