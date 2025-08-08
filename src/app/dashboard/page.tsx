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

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={bookingsData} />
        </div>
      </div>
    </div>
  )
}
