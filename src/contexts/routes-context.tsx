"use client"

import * as React from "react"
import { Route } from "@/types/route"

interface RoutesContextType {
  routes: Route[]
  addRoute: (route: Omit<Route, "id" | "createdAt" | "updatedAt">) => void
  updateRoute: (id: number, updates: Partial<Route>) => void
  deleteRoute: (id: number) => void
  updateBookingsAfterRouteDelete: (routeId: number) => Promise<void>
}

const RoutesContext = React.createContext<RoutesContextType | undefined>(undefined)

export function RoutesProvider({ children }: { children: React.ReactNode }) {
  const [routes, setRoutes] = React.useState<Route[]>([])

  React.useEffect(() => {
    const loadRoutes = async () => {
      try {
        const res = await fetch('/api/routes', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setRoutes(data)
        }
      } catch {
        setRoutes([])
      }
    }
    loadRoutes()
  }, [])

  const addRoute = (route: Omit<Route, "id" | "createdAt" | "updatedAt">) => {
    const save = async () => {
      const now = new Date().toISOString()
      const temp: Route = {
        id: Math.max(0, ...routes.map(r => r.id)) + 1,
        ...route,
        createdAt: now,
        updatedAt: now,
      }
      setRoutes(prev => [...prev, temp])
      try {
        const res = await fetch('/api/routes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(temp) })
        if (!res.ok) throw new Error('Failed to save route')
      } catch {
        // noop – UI already updated; could revalidate later
      }
    }
    void save()
  }

  const updateRoute = (id: number, updates: Partial<Route>) => {
    setRoutes(prev => prev.map(route => (route.id === id ? { ...route, ...updates, updatedAt: new Date().toISOString() } : route)))
    const save = async () => {
      try {
        const current = routes.find(r => r.id === id)
        const payload = { ...(current as Route), ...updates, updatedAt: new Date().toISOString() }
        await fetch('/api/routes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      } catch {
        // noop
      }
    }
    void save()
  }

  const deleteRoute = (id: number) => {
    setRoutes(prev => prev.filter(route => route.id !== id))
    const run = async () => {
      try {
        await fetch(`/api/routes?id=${id}`, { method: 'DELETE' })
      } catch {
        // noop
      }
    }
    void run()
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