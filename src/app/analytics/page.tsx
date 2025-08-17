"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

import { Booking } from "@/types/booking"
import { Route } from "@/types/route"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  type ChartConfig,
} from "@/components/ui/chart"

type MonthBucket = { month: string; count: number }
type RouteBucket = { route: string; count: number }
type PaymentBucket = { status: string; count: number }

const monthNames = [
  "Sty",
  "Lut",
  "Mar",
  "Kwi",
  "Maj",
  "Cze",
  "Lip",
  "Sie",
  "Wrz",
  "Paź",
  "Lis",
  "Gru",
]

const AnalyticsPage: React.FC = () => {
  const [bookings, setBookings] = React.useState<Booking[]>([])
  const [routes, setRoutes] = React.useState<Route[]>([])
  const [loading, setLoading] = React.useState(true)

  const handleFetch = React.useCallback(async () => {
    try {
      const [bRes, rRes] = await Promise.all([
        fetch("/api/data", { cache: "no-store" }),
        fetch("/api/routes", { cache: "no-store" }),
      ])
      if (bRes.ok) {
        const data = (await bRes.json()) as Booking[]
        setBookings(Array.isArray(data) ? data : [])
      }
      if (rRes.ok) {
        const data = (await rRes.json()) as Route[]
        setRoutes(Array.isArray(data) ? data : [])
      }
    } catch {
      setBookings([])
      setRoutes([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    handleFetch()
  }, [handleFetch])

  const routeIdToName = React.useMemo(() => {
    const map = new Map<number, string>()
    routes.forEach((r) => map.set(r.id, r.name))
    return map
  }, [routes])

  const metrics = React.useMemo(() => {
    if (!bookings.length) {
      return {
        total: 0,
        confirmed: 0,
        inProgress: 0,
        finished: 0,
        totalKayaks: 0,
        paidPercent: 0,
      }
    }

    const total = bookings.length
    let confirmed = 0
    let inProgress = 0
    let finished = 0
    let paid = 0
    let totalKayaks = 0

    for (const b of bookings) {
      if (b.status === "potwierdzony") confirmed += 1
      if (b.status === "rozpoczal_splyw") inProgress += 1
      if (b.status === "zakonczyl_splyw") finished += 1
      if (b.paymentStatus === "oplacony" || b.paymentStatus === "faktura_zaplacona") paid += 1
      totalKayaks += (b.dwuosobowe ?? 0) + (b.jednoosobowe ?? 0)
    }

    const paidPercent = total === 0 ? 0 : Math.round((paid / total) * 100)

    return { total, confirmed, inProgress, finished, totalKayaks, paidPercent }
  }, [bookings])

  const bookingsByMonth: MonthBucket[] = React.useMemo(() => {
    const counts = Array.from({ length: 12 }, (_, i) => ({ month: monthNames[i], count: 0 }))
    for (const b of bookings) {
      const d = new Date(b.Data)
      const idx = Number.isNaN(d.getTime()) ? undefined : d.getMonth()
      if (idx !== undefined && idx >= 0 && idx < 12) counts[idx].count += 1
    }
    return counts
  }, [bookings])

  const bookingsByRoute: RouteBucket[] = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const b of bookings) {
      const name = routeIdToName.get(b.Trasa) ?? `Trasa #${b.Trasa}`
      map.set(name, (map.get(name) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([route, count]) => ({ route, count }))
  }, [bookings, routeIdToName])

  const paymentsDist: PaymentBucket[] = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const b of bookings) map.set(b.paymentStatus, (map.get(b.paymentStatus) ?? 0) + 1)
    return Array.from(map.entries()).map(([status, count]) => ({ status, count }))
  }, [bookings])

  const monthChartConfig: ChartConfig = {
    count: { label: "Rezerwacje", color: "hsl(var(--chart-1))" },
  }

  const routeChartConfig: ChartConfig = {
    count: { label: "Rezerwacje", color: "hsl(var(--chart-2))" },
  }

  const paymentChartConfig: ChartConfig = {
    count: { label: "Liczba", color: "hsl(var(--chart-3))" },
  }

  return (
    <div className="flex flex-1 flex-col" aria-busy={loading} aria-live="polite">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Analityka</h1>
              <p className="text-muted-foreground">Przegląd kluczowych metryk rezerwacji.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @4xl/main:grid-cols-3">
            <Card>
              <CardHeader>
                <CardDescription>Wszystkie rezerwacje</CardDescription>
                <CardTitle className="tabular-nums">{metrics.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Potwierdzone</CardDescription>
                <CardTitle className="tabular-nums">{metrics.confirmed}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>W trakcie</CardDescription>
                <CardTitle className="tabular-nums">{metrics.inProgress}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Zakończone</CardDescription>
                <CardTitle className="tabular-nums">{metrics.finished}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Łącznie kajaków</CardDescription>
                <CardTitle className="tabular-nums">{metrics.totalKayaks}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Opłacone (%)</CardDescription>
                <CardTitle className="tabular-nums">{metrics.paidPercent}%</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Rezerwacje wg miesiąca</CardTitle>
                <CardDescription>Bieżący rok kalendarzowy</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={monthChartConfig} className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bookingsByMonth} aria-label="Wykres słupkowy rezerwacji wg miesiąca">
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-count, hsl(var(--chart-1)))" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rezerwacje wg trasy</CardTitle>
                <CardDescription>Sumy na trasę</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={routeChartConfig} className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bookingsByRoute} layout="vertical" aria-label="Wykres słupkowy rezerwacji wg trasy">
                      <CartesianGrid vertical={false} />
                      <XAxis type="number" allowDecimals={false} hide />
                      <YAxis type="category" dataKey="route" width={120} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-count, hsl(var(--chart-2)))" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Status płatności</CardTitle>
                <CardDescription>Udział procentowy</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={paymentChartConfig} className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <ChartLegend />
                      <Pie
                        data={paymentsDist}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={4}
                        strokeWidth={4}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage


