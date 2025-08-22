import { z } from "zod"

export const bookingSchema = z.object({
  id: z.number(),
  Imie: z.string(),
  Nazwisko: z.string(),
  // Zmieniono z tekstowej trasy na ID trasy
  Trasa: z.number(), // ID trasy z typu Route
  status: z.enum(["nie_potwierdzony", "potwierdzony", "rozpoczal_splyw", "zakonczyl_splyw"]),
  paymentStatus: z.enum(["nieoplacony", "oplacony", "faktura_nie_zaplacona", "faktura_zaplacona"]),
  dwuosobowe: z.number(),
  jednoosobowe: z.number(),
  Telefon: z.string(),
  Email: z.string(),
  Data: z.string(),
  godzinaSplywu: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  // Nowe pola
  meals: z.boolean().optional(),
  groupTransport: z.boolean().optional(),
  electricity: z.boolean().optional(),
  gazebo: z.boolean().optional(),
  driversCount: z.number().optional(),
  childKayaks: z.number().optional(),
  deliveries: z.number().optional(),
  dryBags: z.number().optional(), // ilość worków wodoszczelnych dodanych do rezerwacji
  kayakPrice: z.number().optional(),
  history: z.array(z.object({
    timestamp: z.string(),
    action: z.string(),
    status: z.string(),
    paymentStatus: z.string(),
    notes: z.string().optional()
  }))
})

export type Booking = z.infer<typeof bookingSchema>

export const bookingStatusOptions = [
  { value: "nie_potwierdzony", label: "Nie potwierdzony", color: "text-yellow-600" },
  { value: "potwierdzony", label: "Potwierdzony", color: "text-blue-600" },
  { value: "rozpoczal_splyw", label: "Rozpoczął spływ", color: "text-purple-600" },
  { value: "zakonczyl_splyw", label: "Zakończył spływ", color: "text-green-600" }
] as const

export const paymentStatusOptions = [
  { value: "nieoplacony", label: "Nieopłacony", color: "text-red-600" },
  { value: "oplacony", label: "Opłacony", color: "text-green-600" },
  { value: "faktura_nie_zaplacona", label: "Faktura nie zapłacona", color: "text-orange-600" },
  { value: "faktura_zaplacona", label: "Faktura zapłacona", color: "text-green-700" }
] as const