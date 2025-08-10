"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"


import { Booking } from "@/types/booking"
import { useRoutes } from "@/contexts/routes-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface BookingFormProps {
  booking?: Booking
  onSave: (booking: Booking) => void
  onCancel: () => void
}

const formSchema = z.object({
  Imie: z.string().min(1, "Imię jest wymagane"),
  Nazwisko: z.string().min(1, "Nazwisko jest wymagane"),
  Trasa: z.number().min(1, "Trasa jest wymagana"),
  status: z.string().min(1, "Status jest wymagany"),
  paymentStatus: z.string().min(1, "Status płatności jest wymagany"),
  dwuosobowe: z.number().min(0),
  jednoosobowe: z.number().min(0),
  Telefon: z.string().regex(/\d+/, "Nieprawidłowy format numeru telefonu"),
  Email: z.string().email("Nieprawidłowy format email"),
  Data: z.string().refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, {
    message: "Data rezerwacji nie może być z przeszłości",
  }),
  godzinaSplywu: z.string().optional(),
  meals: z.boolean(),
  groupTransport: z.boolean(),
  electricity: z.boolean(),
  gazebo: z.boolean(),
  driversCount: z.number().min(0),
  childKayaks: z.number().min(0),
  deliveries: z.number().min(0),
  // Akceptacje regulaminów
  acceptKayakTerms: z.boolean().refine(v => v === true, "Wymagana akceptacja regulaminu wypożyczenia kajaków"),
  acceptCampsiteTerms: z.boolean().optional(),
  
})

export function BookingForm({ booking, onSave, onCancel }: BookingFormProps) {
  const { routes } = useRoutes()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Imie: booking?.Imie || "",
      Nazwisko: booking?.Nazwisko || "",
      Trasa: booking?.Trasa || 1,
      status: booking?.status || "nie_potwierdzony",
      paymentStatus: booking?.paymentStatus || "nieoplacony",
      dwuosobowe: Number(booking?.dwuosobowe) || 0,
      jednoosobowe: Number(booking?.jednoosobowe) || 0,
      Telefon: booking?.Telefon || "",
      Email: booking?.Email || "",
      Data: booking?.Data || format(new Date(), "yyyy-MM-dd"),
      godzinaSplywu: booking?.godzinaSplywu || "",
      meals: booking?.meals || false,
      groupTransport: booking?.groupTransport || false,
      electricity: booking?.electricity || false,
      gazebo: booking?.gazebo || false,
      driversCount: booking?.driversCount ?? 0,
      childKayaks: booking?.childKayaks ?? 0,
      deliveries: booking?.deliveries ?? 0,
      acceptKayakTerms: false,
      acceptCampsiteTerms: false,
      
    },
  })

  const { handleSubmit, formState: { isSubmitting, errors }, register, setValue, watch } = form

  React.useEffect(() => {
    if (!booking && routes.length > 0) {
      setValue("Trasa", routes[0].id);
    }
  }, [booking, routes, setValue]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const now = new Date().toISOString()
      // Wymuś akceptacje: kajaki zawsze, pole namiotowe tylko dla tras odpowiadających polu (przykład: Trasa id === 0 traktowana jako pole?)
      // W tym projekcie nie mamy mapowania Trasa->typ usługi. Przyjmijmy regułę:
      // - Jeżeli liczba kajaków > 0 => wymagaj acceptKayakTerms === true.
      // - Jeżeli electricity/gazebo lub inne campowe dodatki => wymagaj acceptCampsiteTerms === true.
      const requiresKayak = (values.dwuosobowe > 0) || (values.jednoosobowe > 0)
      const requiresCampsite = values.electricity || values.gazebo
      if (requiresKayak && !values.acceptKayakTerms) {
        throw new Error("Musisz zaakceptować regulamin wypożyczenia kajaków")
      }
      if (requiresCampsite && !values.acceptCampsiteTerms) {
        throw new Error("Musisz zaakceptować regulamin pola namiotowego")
      }
      // Rejestr audytu akceptacji (opcjonalnie, bez blokowania zapisu)
      try {
        if (values.acceptKayakTerms) {
          await fetch('/api/documents/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'kayak',
              version: '1.0',
              acceptedAt: now,
              firstName: values.Imie,
              lastName: values.Nazwisko,
              email: values.Email,
              phone: values.Telefon,
            })
          })
        }
        if (values.acceptCampsiteTerms) {
          await fetch('/api/documents/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'campsite',
              version: '1.0',
              acceptedAt: now,
              firstName: values.Imie,
              lastName: values.Nazwisko,
              email: values.Email,
              phone: values.Telefon,
            })
          })
        }
      } catch {}
      const newBooking: Booking = {
        id: booking?.id || Date.now(),
        Imie: values.Imie,
        Nazwisko: values.Nazwisko,
        Trasa: values.Trasa,
        status: values.status as Booking["status"],
        paymentStatus: values.paymentStatus as Booking["paymentStatus"],
        dwuosobowe: Number(values.dwuosobowe) as unknown as Booking["dwuosobowe"],
        jednoosobowe: Number(values.jednoosobowe) as unknown as Booking["jednoosobowe"],
        Telefon: values.Telefon,
        Email: values.Email,
        Data: values.Data,
        godzinaSplywu: values.godzinaSplywu || undefined,
        meals: values.meals,
        groupTransport: values.groupTransport,
        electricity: values.electricity,
        gazebo: values.gazebo,
        driversCount: values.driversCount,
        childKayaks: values.childKayaks,
        deliveries: values.deliveries,
        createdAt: booking?.createdAt || now,
        updatedAt: now,
        history: booking?.history || [
          {
            timestamp: now,
            action: "created",
            status: values.status as Booking["status"],
            paymentStatus: values.paymentStatus as Booking["paymentStatus"],
            notes: "Rezerwacja utworzona"
          }
        ]
      }
      if (booking) {
        const lastHistory = booking.history[booking.history.length - 1]
        if (lastHistory.status !== values.status || lastHistory.paymentStatus !== values.paymentStatus) {
          newBooking.history = [
            ...booking.history,
            {
              timestamp: now,
              action: "updated",
              status: values.status as Booking["status"],
              paymentStatus: values.paymentStatus as Booking["paymentStatus"],
              notes: "Status rezerwacji zaktualizowany"
            }
          ]
        }
      }
      onSave(newBooking)
      toast.success(booking ? "Zaktualizowano rezerwację" : "Utworzono nową rezerwację")
    } catch {
      toast.error("Błąd podczas zapisywania rezerwacji")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-full sm:max-w-2xl lg:max-w-5xl">
      {/* Dane osobowe */}
      <div className="mb-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3">Dane osobowe</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="imie">Imię</Label>
            <Input
              id="imie"
              {...register("Imie")}
              placeholder="Jan"
              required
              autoFocus
              aria-label="Imię"
            />

            {errors.Imie && <p className="text-sm text-red-500">{errors.Imie.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="nazwisko">Nazwisko</Label>
            <Input
              id="nazwisko"
              {...register("Nazwisko")}
              placeholder="Kowalski"
              required
              aria-label="Nazwisko"
            />
            {errors.Nazwisko && <p className="text-sm text-red-500">{errors.Nazwisko.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("Email")}
              placeholder="jan@example.com"
              required
              aria-label="Email"
            />
            {errors.Email && <p className="text-sm text-red-500">{errors.Email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefon">Telefon</Label>
            <Input
              id="telefon"
              type="tel"
              {...register("Telefon")}
              placeholder="+48 123 456 789"
              required
              aria-label="Telefon"
            />
            {errors.Telefon && <p className="text-sm text-red-500">{errors.Telefon.message}</p>}
          </div>
        </div>
      </div>

      {/* Szczegóły rezerwacji */}
      <div className="mb-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3">Szczegóły rezerwacji</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="trasa">Trasa</Label>
            <Select
              value={watch("Trasa").toString()}
              onValueChange={(value) => setValue("Trasa", parseInt(value))}
            >
              <SelectTrigger id="trasa" aria-label="Trasa" className="w-full">
                <SelectValue placeholder="Wybierz trasę" />
              </SelectTrigger>
              <SelectContent>
                {routes.map((route: { id: number; name: string }) => (
                  <SelectItem key={route.id} value={route.id.toString()}>
                    {route.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.Trasa && <p className="text-xs text-red-500">{errors.Trasa.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="data">Data rezerwacji</Label>
            <Input
              id="data"
              type="date"
              {...register("Data")}
              required
              aria-label="Data rezerwacji"
            />
            {errors.Data && <p className="text-xs text-red-500">{errors.Data.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="godzinaSplywu">Godzina spływu</Label>
            <Select
              value={watch("godzinaSplywu") || "none"}
              onValueChange={(value) => setValue("godzinaSplywu", value === "none" ? undefined : value)}
            >
              <SelectTrigger id="godzinaSplywu" aria-label="Godzina spływu" className="w-full">
                <SelectValue placeholder="Wybierz godzinę spływu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Brak</SelectItem>
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
            {errors.godzinaSplywu && <p className="text-xs text-red-500">{errors.godzinaSplywu.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dwuosobowe">Kajaki dwuosobowe</Label>
            <Input
              id="dwuosobowe"
              type="number"
              min="0"
              {...register("dwuosobowe", { valueAsNumber: true })}
              onChange={(e) => setValue("dwuosobowe", Number(e.target.value) || 0)}
              aria-label="Kajaki dwuosobowe"
            />
            {errors.dwuosobowe && <p className="text-xs text-red-500">{errors.dwuosobowe.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="jednoosobowe">Kajaki jednoosobowe</Label>
            <Input
              id="jednoosobowe"
              type="number"
              min="0"
              {...register("jednoosobowe", { valueAsNumber: true })}
              onChange={(e) => setValue("jednoosobowe", Number(e.target.value) || 0)}
              aria-label="Kajaki jednoosobowe"
            />
            {errors.jednoosobowe && <p className="text-xs text-red-500">{errors.jednoosobowe.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status rezerwacji</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) => setValue("status", value)}
            >
              <SelectTrigger id="status" aria-label="Status rezerwacji" className="w-full">
                <SelectValue placeholder="Wybierz status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nie_potwierdzony">Nie potwierdzony</SelectItem>
                <SelectItem value="potwierdzony">Potwierdzony</SelectItem>
                <SelectItem value="rozpoczal_splyw">Rozpoczął spływ</SelectItem>
                <SelectItem value="zakonczyl_splyw">Zakończył spływ</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentStatus">Status płatności</Label>
            <Select
              value={watch("paymentStatus")}
              onValueChange={(value) => setValue("paymentStatus", value)}
            >
              <SelectTrigger id="paymentStatus" aria-label="Status płatności" className="w-full">
                <SelectValue placeholder="Wybierz status płatności" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nieoplacony">Nieopłacony</SelectItem>
                <SelectItem value="oplacony">Opłacony</SelectItem>
                <SelectItem value="faktura_nie_zaplacona">Faktura nie zapłacona</SelectItem>
                <SelectItem value="faktura_zaplacona">Faktura zapłacona</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentStatus && <p className="text-xs text-red-500">{errors.paymentStatus.message}</p>}
          </div>
        </div>
      </div>

      {/* Dodatki */}
      <div className="mb-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3">Dodatki</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="meals"
                checked={watch("meals")}
                onCheckedChange={(checked) => setValue("meals", Boolean(checked))}
                aria-label="Wyżywienie"
              />
              <Label htmlFor="meals" className="mb-0">Wyżywienie</Label>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="groupTransport"
                checked={watch("groupTransport")}
                onCheckedChange={(checked) => setValue("groupTransport", Boolean(checked))}
                aria-label="Nasz transport"
              />
              <Label htmlFor="groupTransport" className="mb-0">Nasz transport</Label>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="electricity"
                checked={watch("electricity")}
                onCheckedChange={(checked) => setValue("electricity", Boolean(checked))}
                aria-label="Ognisko"
              />
              <Label htmlFor="electricity" className="mb-0">Ognisko</Label>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="gazebo"
                checked={watch("gazebo")}
                onCheckedChange={(checked) => setValue("gazebo", Boolean(checked))}
                aria-label="Altana"
              />
              <Label htmlFor="gazebo" className="mb-0">Altana</Label>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="driversCount">Ilość kierowców</Label>
            <Input
              id="driversCount"
              type="number"
              min="0"
              {...register("driversCount", { valueAsNumber: true })}
              aria-label="Ilość kierowców"
            />
            {errors.driversCount && <p className="text-sm text-red-500">{errors.driversCount.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="childKayaks">Kapoki dziecięce</Label>
            <Input
              id="childKayaks"
              type="number"
              min="0"
              {...register("childKayaks", { valueAsNumber: true })}
              aria-label="Kapoki dziecięce"
            />
            {errors.childKayaks && <p className="text-sm text-red-500">{errors.childKayaks.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="deliveries">Ilość dostawek</Label>
            <Input
              id="deliveries"
              type="number"
              min="0"
              {...register("deliveries", { valueAsNumber: true })}
              aria-label="Ilość dostawek"
            />
            {errors.deliveries && <p className="text-sm text-red-500">{errors.deliveries.message}</p>}
          </div>
        </div>
      </div>

      {/* Akceptacje regulaminów */}
      <div className="mb-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3">Regulaminy i zgody</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="acceptKayakTerms"
                checked={watch("acceptKayakTerms")}
                onCheckedChange={(checked) => setValue("acceptKayakTerms", Boolean(checked))}
                aria-label="Akceptuję regulamin wypożyczenia kajaków"
              />
              <Label htmlFor="acceptKayakTerms" className="mb-0">Akceptuję regulamin wypożyczenia kajaków (wymagane przy rezerwacji kajaków)</Label>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="acceptCampsiteTerms"
                checked={watch("acceptCampsiteTerms")}
                onCheckedChange={(checked) => setValue("acceptCampsiteTerms", Boolean(checked))}
                aria-label="Akceptuję regulamin pola namiotowego"
              />
              <Label htmlFor="acceptCampsiteTerms" className="mb-0">Akceptuję regulamin pola namiotowego (wymagane przy rezerwacji pola)</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Przyciski sticky na dole */}
      <div className="sticky bottom-0 left-0 right-0 bg-card pt-3 pb-3 flex gap-2 justify-end z-10 border-t mt-6">
        <Button type="button" variant="outline" onClick={onCancel} aria-label="Anuluj" className="w-full sm:w-auto">
          Anuluj
        </Button>
        <Button type="submit" className="w-full sm:w-auto min-w-36" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Zapisywanie...
            </span>
          ) : (
            booking ? "Zapisz zmiany" : "Utwórz"
          )}
        </Button>
      </div>
    </form>
  )
}