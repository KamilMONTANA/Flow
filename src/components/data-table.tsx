"use client"

import * as React from "react"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconArrowUp,
  IconArrowDown,
  IconArrowsUpDown,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Booking, bookingStatusOptions, paymentStatusOptions } from "@/types/booking"
import { Route } from "@/types/route"
import { IconCheck, IconX } from "@tabler/icons-react"

// import { BookingAddonsPopup } from "@/components/booking-addons-popup"
import { BookingStatusFilter } from "@/components/booking-status-filter"
import { BookingForm } from "@/components/booking-form"
import { RouteManager } from "@/components/route-manager"
import { useRoutes } from "@/contexts/routes-context"
import { useDrawer } from "@/contexts/drawer-context"



function TableCellViewer({ item, onUpdate }: {
  item: Booking,
  onUpdate: (updatedItem: Booking) => void
}) {
  const isMobile = useIsMobile()
  const [editedData, setEditedData] = React.useState(item)
  const [isSaving, setIsSaving] = React.useState(false)
  const { routes } = useRoutes()

  // Resetuj edytowane dane gdy oryginalny item się zmienia
  React.useEffect(() => {
    setEditedData(item)
  }, [item])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate(editedData)
      toast.success('Zapisano zmiany')
    } catch {
      toast.error('Błąd podczas zapisywania')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedData(item)
  }

  const handleInputChange = (field: keyof Booking, value: string) => {
    if (field === 'Trasa') {
      setEditedData(prev => ({ ...prev, [field]: parseInt(value) }))
    } else {
      setEditedData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleNameChange = (value: string) => {
    const [imie, ...nazwiskoParts] = value.split(' ')
    const nazwisko = nazwiskoParts.join(' ')
    setEditedData(prev => ({ ...prev, Imie: imie || '', Nazwisko: nazwisko }))
  }

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.Imie} {item.Nazwisko}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.Imie} {item.Nazwisko}</DrawerTitle>
          <DrawerDescription>
            Szczegóły rezerwacji dla {item.Imie} {item.Nazwisko}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-3">
              <Label htmlFor="imie-nazwisko">Imię i Nazwisko</Label>
              <Input
                id="imie-nazwisko"
                value={`${editedData.Imie} ${editedData.Nazwisko}`}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="trasa">Trasa</Label>
                <Select
                  value={editedData.Trasa.toString()}
                  onValueChange={(value) => handleInputChange('Trasa', value)}
                >
                  <SelectTrigger id="trasa" className="w-full">
                    <SelectValue placeholder="Wybierz trasę" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((route) => (
                      <SelectItem key={route.id} value={route.id.toString()}>
                        {route.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editedData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Wybierz status" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookingStatusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="paymentStatus">Status płatności</Label>
                <Select
                  value={editedData.paymentStatus}
                  onValueChange={(value) => handleInputChange('paymentStatus', value)}
                >
                  <SelectTrigger id="paymentStatus" className="w-full">
                    <SelectValue placeholder="Wybierz status płatności" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={editedData.Data}
                  onChange={(e) => handleInputChange('Data', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="godzinaSplywu">Godzina spływu</Label>
                <Select
                  value={editedData.godzinaSplywu || ""}
                  onValueChange={(value) => handleInputChange('godzinaSplywu', value)}
                >
                  <SelectTrigger id="godzinaSplywu" className="w-full">
                    <SelectValue placeholder="Wybierz godzinę" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Brak</SelectItem>
                    <SelectItem value="08:00">08:00</SelectItem>
                    <SelectItem value="09:00">09:00</SelectItem>
                    <SelectItem value="10:00">10:00</SelectItem>
                    <SelectItem value="11:00">11:00</SelectItem>
                    <SelectItem value="12:00">12:00</SelectItem>
                    <SelectItem value="13:00">13:00</SelectItem>
                    <SelectItem value="14:00">14:00</SelectItem>
                    <SelectItem value="15:00">15:00</SelectItem>
                    <SelectItem value="16:00">16:00</SelectItem>
                    <SelectItem value="17:00">17:00</SelectItem>
                    <SelectItem value="18:00">18:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="dwuosobowe">Dwuosobowe</Label>
                <Input
                  id="dwuosobowe"
                  type="number"
                  value={editedData.dwuosobowe}
                  onChange={(e) => handleInputChange('dwuosobowe', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="jednoosobowe">Jednoosobowe</Label>
                <Input
                  id="jednoosobowe"
                  type="number"
                  value={editedData.jednoosobowe}
                  onChange={(e) => handleInputChange('jednoosobowe', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="telefon">Telefon</Label>
                <Input
                  id="telefon"
                  value={editedData.Telefon}
                  onChange={(e) => handleInputChange('Telefon', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={editedData.Email}
                  onChange={(e) => handleInputChange('Email', e.target.value)}
                />
              </div>
            </div>
            
            {/* Nowe pola */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="meals"
                  checked={editedData.meals || false}
                  onCheckedChange={(checked) => setEditedData(prev => ({ ...prev, meals: checked as boolean }))}
                />
                <Label htmlFor="meals">Wyżywienie</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="groupTransport"
                  checked={editedData.groupTransport || false}
                  onCheckedChange={(checked) => setEditedData(prev => ({ ...prev, groupTransport: checked as boolean }))}
                />
                <Label htmlFor="groupTransport">Transport grupowy</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="electricity"
                  checked={editedData.electricity || false}
                  onCheckedChange={(checked) => setEditedData(prev => ({ ...prev, electricity: checked as boolean }))}
                />
                <Label htmlFor="electricity">Prąd</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="gazebo"
                  checked={editedData.gazebo || false}
                  onCheckedChange={(checked) => setEditedData(prev => ({ ...prev, gazebo: checked as boolean }))}
                />
                <Label htmlFor="gazebo">Altana</Label>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="driversCount">Ilość kierowców</Label>
                <Input
                  id="driversCount"
                  type="number"
                  min="0"
                  value={editedData.driversCount || 0}
                  onChange={(e) => setEditedData(prev => ({ ...prev, driversCount: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="childKayaks">Ilość kapoków dziecięcych</Label>
                <Input
                  id="childKayaks"
                  type="number"
                  min="0"
                  value={editedData.childKayaks || 0}
                  onChange={(e) => setEditedData(prev => ({ ...prev, childKayaks: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="deliveries">Ilość dostawek</Label>
                <Input
                  id="deliveries"
                  type="number"
                  min="0"
                  value={editedData.deliveries || 0}
                  onChange={(e) => setEditedData(prev => ({ ...prev, deliveries: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Zapisywanie...' : 'Zapisz'}
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button variant="outline" onClick={handleCancel}>
              Anuluj
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export function DataTable({
  data: initialData,
  refreshData: externalRefreshData
}: {
  data: Booking[],
  refreshData?: () => void
}) {
  const [data, setData] = React.useState(() => initialData)

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      Email: false,
      meals: false,
      groupTransport: false,
      electricity: false,
      gazebo: false,
      driversCount: false,
      childKayaks: false,
      deliveries: false,
    })
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const { isDrawerOpen, setIsDrawerOpen } = useDrawer()
  const [editingBooking, setEditingBooking] = React.useState<Booking | undefined>()
  const { routes } = useRoutes()

  // Aktualizuj dane gdy routes się zmienia, aby kolumna "Trasa" mogła pokazywać aktualne nazwy tras
  React.useEffect(() => {
    setData(prevData => [...prevData]);
  }, [routes]);

  // Aktualizacja pojedynczego rekordu po id -> PUT /api/data
  const handleUpdate = async (updatedItem: Booking) => {
    setData((prevData) => {
      const newData = prevData.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      )
      return newData
    })

    try {
      const response = await fetch('/api/data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItem),
      })

      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(`HTTP ${response.status} ${text}`)
      }

      if (externalRefreshData) externalRefreshData()
      toast.success('Zaktualizowano rezerwację')
    } catch (error) {
      console.error('Błąd podczas aktualizacji:', error)
      toast.error('Błąd podczas aktualizacji')
      throw error
    }
  }

  // Tworzenie – w tym UI generujemy pełny snapshot i zapisujemy całą listę POST /api/data
  // (alternatywnie można dodać dedykowany POST pojedynczego rekordu – obecny backend wspiera POST jako overwrite listy)
  const handleCreate = (newBooking: Booking) => {
    // nadaj unikalne id, jeśli nie ma
    const id: number = typeof newBooking.id === 'number' ? newBooking.id : Date.now()
    const bookingWithId: Booking = { ...newBooking, id }

    // Wyślij tylko pojedynczy rekord do API i dopiero po sukcesie zaktualizuj stan
    fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingWithId),
    })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text().catch(() => '')
          throw new Error(`HTTP ${response.status} ${text}`)
        }
        setData((prev) => [...prev, bookingWithId])
        if (externalRefreshData) externalRefreshData()
        toast.success('Utworzono rezerwację')
        setIsDrawerOpen(false)
      })
      .catch((error) => {
        console.error('Błąd podczas zapisywania:', error)
        toast.error('Błąd podczas zapisywania rezerwacji')
      })
  }

  // Usuwanie wyłącznie po jednoznacznym "id" rekordu,
  // z dodatkową walidacją typu oraz kopią defensywną danych.
  const handleDelete = (id: number) => {
    setData((prevData) => {
      // Zabezpieczenie: pracujemy na kopii
      const prev = Array.isArray(prevData) ? [...prevData] : []
      // Znajdź dokładnie jeden rekord do usunięcia po id
      const toDeleteIndex = prev.findIndex((item) => item.id === id)
      if (toDeleteIndex === -1) {
        toast.error('Nie znaleziono rekordu do usunięcia')
        return prevData
      }

      const newData = prev.filter((item, idx) => idx !== toDeleteIndex)

      // Usuń pojedynczy rekord po id -> DELETE /api/data?id=...
      fetch(`/api/data?id=${encodeURIComponent(String(id))}`, {
        method: 'DELETE',
      })
        .then(async (response) => {
          if (!response.ok) {
            const text = await response.text().catch(() => '')
            throw new Error(`HTTP ${response.status} ${text}`)
          }
          if (externalRefreshData) externalRefreshData()
          toast.success('Rezerwacja usunięta')
        })
        .catch((error) => {
          console.error('Błąd podczas usuwania:', error)
          toast.error('Błąd podczas usuwania')
          // W przypadku błędu nie zmieniamy stanu na newData – zachowujemy spójność
        })

      return newData
    })
  }

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "Imie",
      header: "Imię i Nazwisko",
      cell: ({ row }) => (
        <TableCellViewer item={row.original} onUpdate={handleUpdate} />
      ),
      enableHiding: false,
      enableSorting: true,
    },
    {
      accessorKey: "Trasa",
      header: "Trasa",
      cell: ({ row }) => {
        // Znajdź trasę po ID
        const route = routes.find((r: Route) => r.id === row.original.Trasa);
        return (
          <div className="w-32">
            <Badge 
              variant="outline" 
              className="px-1.5" 
              style={{ color: route?.color || 'inherit', borderColor: route?.color || 'currentColor' }}
            >
              {route ? route.name : `Nieznana trasa (${row.original.Trasa})`}
            </Badge>
          </div>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = bookingStatusOptions.find(s => s.value === row.original.status)
        return (
          <Badge variant="outline" className={`${status?.color} px-1.5`}>
            {status?.label || row.original.status}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id))
      },
      enableSorting: true,
    },
    {
      accessorKey: "paymentStatus",
      header: "Płatność",
      cell: ({ row }) => {
        const status = paymentStatusOptions.find(s => s.value === row.original.paymentStatus)
        return (
          <Badge variant="outline" className={`${status?.color} px-1.5`}>
            {status?.label || row.original.paymentStatus}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id))
      },
      enableSorting: true,
    },
    {
      accessorKey: "dwuosobowe",
      header: () => <div className="w-full text-right">Dwuosobowe</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.dwuosobowe}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "jednoosobowe",
      header: () => <div className="w-full text-right">Jednoosobowe</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.jednoosobowe}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "Telefon",
      header: "Telefon",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.Telefon}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "Email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.Email}
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "Data",
      header: "Data",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.Data}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "godzinaSplywu",
      header: "Godzina",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.godzinaSplywu || "-"}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "meals",
      header: "Wyżywienie",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.original.meals ? <IconCheck className="text-green-500" /> : <IconX className="text-red-500" />}
        </div>
      ),
      enableHiding: true,
    },
    {
      accessorKey: "groupTransport",
      header: "Transport",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.original.groupTransport ? <IconCheck className="text-green-500" /> : <IconX className="text-red-500" />}
        </div>
      ),
      enableHiding: true,
    },
    {
      accessorKey: "electricity",
      header: "Prąd",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.original.electricity ? <IconCheck className="text-green-500" /> : <IconX className="text-red-500" />}
        </div>
      ),
      enableHiding: true,
    },
    {
      accessorKey: "gazebo",
      header: "Altana",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.original.gazebo ? <IconCheck className="text-green-500" /> : <IconX className="text-red-500" />}
        </div>
      ),
      enableHiding: true,
    },
    {
      accessorKey: "driversCount",
      header: "Kierowcy",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.driversCount || 0}
        </div>
      ),
      enableHiding: true,
    },
    {
      accessorKey: "childKayaks",
      header: "Kapoki dziecięce",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.childKayaks || 0}
        </div>
      ),
      enableHiding: true,
    },
    {
      accessorKey: "deliveries",
      header: "Dostawki",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.deliveries || 0}
        </div>
      ),
      enableHiding: true,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => {
              setEditingBooking(row.original)
              setIsDrawerOpen(true)
            }}>
              Edytuj
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation()
                // Usuwamy rekord wyłącznie po jego unikalnym id
                handleDelete(row.original.id)
              }}
            >
              Usuń
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const [expanded, setExpanded] = React.useState({});
  
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
      expanded,
    },
    // Wymuś unikalność i stabilność identyfikatora wiersza – tylko po id
    getRowId: (row) => {
      // Obrona przed nieprawidłowymi/duplikowanymi ID
      return typeof row.id === 'number' || typeof row.id === 'string'
        ? row.id.toString()
        : `row-${Math.random().toString(36).slice(2)}`
    },
    enableRowSelection: false,
    enableMultiSort: true,
    isMultiSortEvent: () => true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    meta: {
      onUpdate: handleUpdate,
    },
  })

  // Funkcja do otwierania panelu edycji
  // Funkcja do otwierania panelu tworzenia (sidebar wywołuje setIsDrawerOpen(true), a my ustawiamy editingBooking na undefined)
  React.useEffect(() => {
    if (isDrawerOpen && !editingBooking) {
      // tryb tworzenia
    }
  }, [isDrawerOpen, editingBooking]);
  const handleClosePanel = () => setIsDrawerOpen(false);

  return (
    <div className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-end px-4 lg:px-6 mb-[15px]">
        <div className="flex items-center gap-[15px]">
          <RouteManager />
          <BookingStatusFilter table={table} />
        </div>
      </div>
      
      {/* Panel wysuwany z lewej strony */}
      {isDrawerOpen && (
        <div
          className={
            `fixed top-0 left-0 h-full z-50 bg-card shadow-2xl transition-transform duration-300 ease-in-out
          w-full max-w-full sm:max-w-2xl lg:max-w-xl
          ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`
          }
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b p-4">
              <span className="text-lg font-semibold">
                {editingBooking ? 'Edytuj rezerwację' : 'Nowa rezerwacja'}
              </span>
              <Button
                variant="ghost"
                onClick={handleClosePanel}
                aria-label="Zamknij panel"
              >
                ✕
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <BookingForm
                booking={editingBooking}
                onSave={editingBooking ? handleUpdate : handleCreate}
                onCancel={handleClosePanel}
              />
            </div>
          </div>
        </div>
      )}

      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50 backdrop-blur-sm sticky top-0 z-10 border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {/* Głowice standardowych kolumn */}
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : (
                            <div
                              className={cn(
                                "flex items-center",
                                header.column.getCanSort() && "cursor-pointer select-none hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
                              )}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <span className="font-medium">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              </span>
                              {header.column.getCanSort() && (
                                <span className="ml-2 text-muted-foreground">
                                  {header.column.getIsSorted() === 'asc' ? (
                                    <IconArrowUp className="size-3" />
                                  ) : header.column.getIsSorted() === 'desc' ? (
                                    <IconArrowDown className="size-3" />
                                  ) : (
                                    <IconArrowsUpDown className="size-3" />
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <TableRow
                      className="hover:bg-muted/50"
                      onClick={() => row.toggleExpanded()}
                      style={{ cursor: 'pointer' }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {row.getIsExpanded() && (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="bg-muted/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4" tabIndex={0} aria-label={`Szczegóły rezerwacji dla ${row.original.Imie} ${row.original.Nazwisko}`}> 
                            <div><span className="font-medium">Email:</span> {row.original.Email}</div>
                            <div><span className="font-medium">Data:</span> {row.original.Data}</div>
                            <div><span className="font-medium">Godzina:</span> {row.original.godzinaSplywu || '-'}</div>
                            <div className="flex items-center gap-2"><span className="font-medium">Wyżywienie:</span> {row.original.meals ? <IconCheck className="text-green-500" /> : <IconX className="text-red-500" />}</div>
                            <div className="flex items-center gap-2"><span className="font-medium">Transport:</span> {row.original.groupTransport ? <IconCheck className="text-green-500" /> : <IconX className="text-red-500" />}</div>
                            <div className="flex items-center gap-2"><span className="font-medium">Prąd:</span> {row.original.electricity ? <IconCheck className="text-green-500" /> : <IconX className="text-red-500" />}</div>
                            <div className="flex items-center gap-2"><span className="font-medium">Altana:</span> {row.original.gazebo ? <IconCheck className="text-green-500" /> : <IconX className="text-red-500" />}</div>
                            <div><span className="font-medium">Kierowcy:</span> {row.original.driversCount || 0}</div>
                            <div><span className="font-medium">Kapoki dziecięce:</span> {row.original.childKayaks || 0}</div>
                            <div><span className="font-medium">Dostawki:</span> {row.original.deliveries || 0}</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Brak wyników.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">

          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Wierszy na stronę
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Strona {table.getState().pagination.pageIndex + 1} z{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Przejdź do pierwszej strony</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Przejdź do poprzedniej strony</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Następna strona</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Poprzednia strona</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}
