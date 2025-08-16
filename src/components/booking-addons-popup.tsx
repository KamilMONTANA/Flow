"use client"

import * as React from "react"
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { IconX, IconCheck } from "@tabler/icons-react"
import { Booking } from "@/types/booking"

interface BookingAddonsPopupProps {
  booking: Booking | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookingAddonsPopup({ booking, open, onOpenChange }: BookingAddonsPopupProps) {
  if (!booking) return null

  // Funkcja pomocnicza do renderowania informacji o dodatku
  const renderAddonInfo = (label: string, value: boolean | number | undefined) => {
    if (value === undefined || value === null) return null
    
    // Dla boolean
    if (typeof value === 'boolean') {
      return (
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-sm font-medium">{label}</span>
          {value ? (
            <IconCheck className="text-green-500" size={20} />
          ) : (
            <IconX className="text-red-500" size={20} />
          )}
        </div>
      )
    }
    
    // Dla number
    if (typeof value === 'number' && value > 0) {
      return (
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm font-medium">{value}</span>
        </div>
      )
    }
    
    return null
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="flex items-center justify-between">
          <div>
            <DrawerTitle>Dodatkowe informacje</DrawerTitle>
            <DrawerDescription>
              {booking.Imie} {booking.Nazwisko} - {booking.Data}
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <IconX size={20} />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Email</span>
              <span className="text-sm">{booking.Email}</span>
            </div>
            
            {renderAddonInfo("Wyżywienie", booking.meals)}
            {renderAddonInfo("Transport grupowy", booking.groupTransport)}
            {renderAddonInfo("Prąd", booking.electricity)}
            {renderAddonInfo("Altana", booking.gazebo)}
            {renderAddonInfo("Kierowcy", booking.driversCount)}
            {renderAddonInfo("Kapoki dziecięce", booking.childKayaks)}
            {renderAddonInfo("Dostawki", booking.deliveries)}
            {renderAddonInfo("Worki wodoszczelne", booking.dryBags)} {/* liczba dodanych worków wodoszczelnych */}
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Zamknij</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}