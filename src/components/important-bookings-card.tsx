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