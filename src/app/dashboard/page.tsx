import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import type { Booking } from "@/types/booking"

export default async function Page() {
  let bookingsData: Booking[] = []
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/data`, { cache: 'no-store' })
    if (res.ok) {
      bookingsData = await res.json()
    }
  } catch {
    bookingsData = []
  }

  // Helpers to get today's local date boundaries
  const startOfLocalDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
  const endOfLocalDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
  const parseLocalDateString = (dateStr: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-').map(Number)
      return new Date(y, (m as number) - 1, d as number)
    }
    return new Date(dateStr)
  }

  const now = new Date()
  const todayStart = startOfLocalDay(now)
  const todayEnd = endOfLocalDay(now)
  const activeBookings = bookingsData.filter(b => {
    const bookingDate = parseLocalDateString(b.Data)
    return bookingDate >= todayStart && bookingDate <= todayEnd
  })

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={activeBookings} />
        </div>
      </div>
    </div>
  )
}
