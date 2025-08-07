"use client"

import * as React from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { DataTable } from "@/components/data-table"
import { Booking } from "@/types/booking"
import { ImportantBookingsCard } from "@/components/important-bookings-card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Typ dla filtrów
interface BookingFilters {
  name: string
  email: string
  phone: string
  dateFrom: string
  dateTo: string
}

export default function ReservationsPage() {
  const [data, setData] = React.useState<Booking[]>([])
  const [loading, setLoading] = React.useState(true)
  
  // Filtry dla każdej kategorii
  const [activeFilters, setActiveFilters] = React.useState<BookingFilters>({ 
    name: '', 
    email: '', 
    phone: '', 
    dateFrom: '', 
    dateTo: '' 
  })
  
  const [upcomingFilters, setUpcomingFilters] = React.useState<BookingFilters>({ 
    name: '', 
    email: '', 
    phone: '', 
    dateFrom: '', 
    dateTo: '' 
  })
  
  const [archiveFilters, setArchiveFilters] = React.useState<BookingFilters>({ 
    name: '', 
    email: '', 
    phone: '', 
    dateFrom: '', 
    dateTo: '' 
  })

  // Dedykowana baza /reservations: /api/data (nowy backend i plik reservations.json)
  const fetchData = async () => {
    try {
      const response = await fetch('/api/data', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const jsonData = await response.json()
      setData(jsonData)
    } catch (error) {
      console.error('Błąd podczas pobierania danych:', error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
  }, [])

  // Pomocnicze funkcje do bezpiecznej pracy z datami (lokalne granice dnia)
  const startOfLocalDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
  const endOfLocalDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)

  // Parser daty "yyyy-MM-dd" jako lokalnej (bez przesunięcia UTC)
  const parseLocalDateString = (dateStr: string) => {
    // Obsługa zarówno "yyyy-MM-dd", jak i pełnych ISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-').map(Number)
      return new Date(y, (m as number) - 1, d as number)
    }
    // fallback do natywnego parsera dla innych formatów
    return new Date(dateStr)
  }

  // Funkcja pomocnicza do filtrowania rezerwacji
  const filterBookings = (bookings: Booking[], filters: BookingFilters, category: 'active' | 'upcoming' | 'archive') => {
    const now = new Date()
    const todayStart = startOfLocalDay(now)
    const todayEnd = endOfLocalDay(now)

    return bookings.filter(booking => {
      // Podstawowe filtrowanie po nazwisku, emailu i telefonie
      const fullName = `${booking.Imie} ${booking.Nazwisko}`.trim().toLowerCase()
      const nameMatch = !filters.name || fullName.includes(filters.name.toLowerCase())
      const emailMatch = !filters.email || booking.Email.toLowerCase().includes(filters.email.toLowerCase())
      const phoneMatch = !filters.phone || booking.Telefon.includes(filters.phone)

      // Data rezerwacji dla tego modelu jest pojedynczą datą booking.Data
      const bookingDateRaw = parseLocalDateString(booking.Data)
      const bookingDate = bookingDateRaw

      // Filtrowanie po zakresie dat z normalizacją do granic dnia
      let dateMatch = true
      if (filters.dateFrom) {
        const from = startOfLocalDay(parseLocalDateString(filters.dateFrom))
        if (bookingDate < from) dateMatch = false
      }
      if (filters.dateTo) {
        const to = endOfLocalDay(parseLocalDateString(filters.dateTo))
        if (bookingDate > to) dateMatch = false
      }

      // Rozłączne kategorie względem lokalnych granic dnia
      let categoryMatch = true
      switch (category) {
        case 'active':
          // Aktualne: bookingDate mieści się w dzisiejszym dniu lokalnym
          categoryMatch = bookingDate >= todayStart && bookingDate <= todayEnd
          break
        case 'upcoming':
          // Nadchodzące: po zakończeniu dzisiejszego dnia
          categoryMatch = bookingDate > todayEnd
          break
        case 'archive':
          // Archiwalne: przed początkiem dzisiejszego dnia
          categoryMatch = bookingDate < todayStart
          break
      }

      return nameMatch && emailMatch && phoneMatch && dateMatch && categoryMatch
    })
  }

  // Dane przefiltrowane dla każdej kategorii
  const activeBookings = filterBookings(data, activeFilters, 'active')
  const upcomingBookings = filterBookings(data, upcomingFilters, 'upcoming')
  const archiveBookings = filterBookings(data, archiveFilters, 'archive')

  if (loading) {
    return (
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">Rezerwacje</h1>
                    <p className="text-sm text-muted-foreground">
                      Zarządzaj rezerwacjami i monitoruj status
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-4 lg:px-6">
                <div className="rounded-lg border bg-card">
                  <div className="p-4 md:p-6">
                    <h2 className="text-lg font-semibold mb-4">Lista rezerwacji</h2>
                    <div>Ładowanie danych...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Nagłówek sekcji */}
            <div className="px-4 lg:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Rezerwacje</h1>
                  <p className="text-sm text-muted-foreground">
                    Zarządzaj rezerwacjami i monitoruj status
                  </p>
                </div>
              </div>
            </div>
            
            {/* Karta z ważnymi rezerwacjami */}
            <div className="px-4 lg:px-6">
              <ImportantBookingsCard bookings={data} />
            </div>
            
            {/* Zakładki z rezerwacjami */}
            <div className="px-4 lg:px-6">
              <Tabs defaultValue="active" className="w-full">
                <TabsList>
                  <TabsTrigger value="active">Aktualne</TabsTrigger>
                  <TabsTrigger value="upcoming">Nadchodzące</TabsTrigger>
                  <TabsTrigger value="archive">Archiwalne</TabsTrigger>
                </TabsList>
                
                {/* Zakładka Aktualne */}
                <TabsContent value="active">
                  <Card>
                    <CardHeader>
                      <CardTitle>Aktualne rezerwacje</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div>
                            <Label className="text-xs">Imię i nazwisko</Label>
                            <Input
                              placeholder="Szukaj..."
                              value={activeFilters.name}
                              onChange={(e) => setActiveFilters({...activeFilters, name: e.target.value})}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Email</Label>
                            <Input
                              placeholder="Szukaj..."
                              value={activeFilters.email}
                              onChange={(e) => setActiveFilters({...activeFilters, email: e.target.value})}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Telefon</Label>
                            <Input
                              placeholder="Szukaj..."
                              value={activeFilters.phone}
                              onChange={(e) => setActiveFilters({...activeFilters, phone: e.target.value})}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Data od</Label>
                            <Input
                              type="date"
                              value={activeFilters.dateFrom}
                              onChange={(e) => setActiveFilters({...activeFilters, dateFrom: e.target.value})}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Data do</Label>
                            <Input
                              type="date"
                              value={activeFilters.dateTo}
                              onChange={(e) => setActiveFilters({...activeFilters, dateTo: e.target.value})}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <DataTable data={activeBookings} refreshData={fetchData} />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Zakładka Nadchodzące */}
                <TabsContent value="upcoming">
                  <Card>
                    <CardHeader>
                      <CardTitle>Nadchodzące rezerwacje</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div>
                            <Label className="text-xs">Imię i nazwisko</Label>
                            <Input
                              placeholder="Szukaj..."
                              value={upcomingFilters.name}
                              onChange={(e) => setUpcomingFilters({...upcomingFilters, name: e.target.value})}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Email</Label>
                            <Input
                              placeholder="Szukaj..."
                              value={upcomingFilters.email}
                              onChange={(e) => setUpcomingFilters({...upcomingFilters, email: e.target.value})}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Telefon</Label>
                            <Input
                              placeholder="Szukaj..."
                              value={upcomingFilters.phone}
                              onChange={(e) => setUpcomingFilters({...upcomingFilters, phone: e.target.value})}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Data od</Label>
                            <Input
                              type="date"
                              value={upcomingFilters.dateFrom}
                              onChange={(e) => setUpcomingFilters({...upcomingFilters, dateFrom: e.target.value})}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Data do</Label>
                            <Input
                              type="date"
                              value={upcomingFilters.dateTo}
                              onChange={(e) => setUpcomingFilters({...upcomingFilters, dateTo: e.target.value})}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <DataTable data={upcomingBookings} refreshData={fetchData} />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Zakładka Archiwalne */}
                <TabsContent value="archive">
                  <Card>
                    <CardHeader>
                      <CardTitle>Archiwalne rezerwacje</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div>
                            <Label className="text-xs">Imię i nazwisko</Label>
                            <Input
                              placeholder="Szukaj..."
                              value={archiveFilters.name}
                              onChange={(e) => setArchiveFilters({...archiveFilters, name: e.target.value})}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Email</Label>
                            <Input
                              placeholder="Szukaj..."
                              value={archiveFilters.email}
                              onChange={(e) => setArchiveFilters({...archiveFilters, email: e.target.value})}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Telefon</Label>
                            <Input
                              placeholder="Szukaj..."
                              value={archiveFilters.phone}
                              onChange={(e) => setArchiveFilters({...archiveFilters, phone: e.target.value})}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Data od</Label>
                            <Input
                              type="date"
                              value={archiveFilters.dateFrom}
                              onChange={(e) => setArchiveFilters({...archiveFilters, dateFrom: e.target.value})}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Data do</Label>
                            <Input
                              type="date"
                              value={archiveFilters.dateTo}
                              onChange={(e) => setArchiveFilters({...archiveFilters, dateTo: e.target.value})}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <DataTable data={archiveBookings} refreshData={fetchData} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}