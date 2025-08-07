"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Booking } from "@/types/booking"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { isAfter, isSameDay } from "date-fns"
import { IconCheck, IconX } from "@tabler/icons-react"

interface ImportantBookingsCardProps {
  bookings: Booking[]
}

/**
 * Czy rezerwacja ma jakiekolwiek aktywne dodatki
 */
const hasActiveAddons = (booking: Booking): boolean => {
  return (
    booking.meals === true ||
    booking.groupTransport === true ||
    booking.electricity === true ||
    booking.gazebo === true ||
    (booking.driversCount ?? 0) > 0 ||
    (booking.childKayaks ?? 0) > 0 ||
    (booking.deliveries ?? 0) > 0
  )
}

/**
 * Zwraca listę aktywnych dodatków w formacie etykieta -> wartość
 * Pokazujemy tylko aktywne: boolean true lub liczba > 0
 */
const getActiveAddons = (booking: Booking): Array<{ label: string; value: string | number | boolean; type: 'boolean' | 'number' }> => {
  const list: Array<{ label: string; value: string | number | boolean; type: 'boolean' | 'number' }> = []
  if (typeof booking.meals !== 'undefined') list.push({ label: "Wyżywienie", value: booking.meals, type: 'boolean' })
  if (typeof booking.groupTransport !== 'undefined') list.push({ label: "Transport", value: booking.groupTransport, type: 'boolean' })
  if (typeof booking.electricity !== 'undefined') list.push({ label: "Prąd", value: booking.electricity, type: 'boolean' })
  if (typeof booking.gazebo !== 'undefined') list.push({ label: "Altana", value: booking.gazebo, type: 'boolean' })
  if ((booking.driversCount ?? 0) > 0) list.push({ label: "Kierowcy", value: booking.driversCount as number, type: 'number' })
  if ((booking.childKayaks ?? 0) > 0) list.push({ label: "Kapoki dziecięce", value: booking.childKayaks as number, type: 'number' })
  if ((booking.deliveries ?? 0) > 0) list.push({ label: "Dostawki", value: booking.deliveries as number, type: 'number' })
  return list
}

/**
 * Sprawdza czy data rezerwacji mieści się w bieżącym miesiącu i roku (wg lokalnego czasu)
 */
const isInCurrentMonth = (dateStr: string): boolean => {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

export function ImportantBookingsCard({ bookings }: ImportantBookingsCardProps) {
  // Tylko rezerwacje: Aktualne (dziś) lub Nadchodzące (po dziś)
  // ORAZ mają przynajmniej jeden z dodatków: Wyżywienie, Transport, Prąd, Altana
  const today = new Date();

  const hasRequiredAddons = (b: Booking) =>
    b.meals === true ||
    b.groupTransport === true ||
    b.electricity === true ||
    b.gazebo === true;

  const filtered = bookings
    .filter((b) => hasRequiredAddons(b))
    .filter((b) => {
      const bookingDate = new Date(b.Data);
      return isSameDay(bookingDate, today) || isAfter(bookingDate, today);
    })
    .sort((a, b) => new Date(a.Data).getTime() - new Date(b.Data).getTime());

  if (filtered.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ważne</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground py-2">
            Brak rezerwacji spełniających kryteria (Aktualne/Nadchodzące z: Wyżywienie, Transport, Prąd lub Altana)
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Ważne</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((booking) => {
            // Pokazujemy tylko cztery wymagane dodatki
            const addonsToShow = [
              { label: "Wyżywienie", value: booking.meals, type: "boolean" as const },
              { label: "Transport", value: booking.groupTransport, type: "boolean" as const },
              { label: "Prąd", value: booking.electricity, type: "boolean" as const },
              { label: "Altana", value: booking.gazebo, type: "boolean" as const },
            ].filter((a) => typeof a.value !== "undefined");

            return (
              <Card key={booking.id} className="p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      {booking.Imie} {booking.Nazwisko}
                    </h3>
                    <Badge variant="secondary">
                      {format(new Date(booking.Data), "dd.MM.yyyy", { locale: pl })}
                    </Badge>
                  </div>
                  {addonsToShow.length > 0 && (
                    <div className="flex flex-col gap-1 pt-2">
                      {addonsToShow.map((a, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{a.label}:</span>
                          {a.type === "boolean" ? (
                            a.value ? (
                              <IconCheck className="text-green-500" />
                            ) : (
                              <IconX className="text-red-500" />
                            )
                          ) : (
                            <span className="text-sm font-medium">{String(a.value)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}