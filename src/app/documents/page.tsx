"use client"

import React from "react"
import { IconFileDescription, IconShieldCheck } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type AgreementType = "campsite" | "kayak"

type AgreementStatus = {
  type: AgreementType
  acceptedAt?: string
  version: string
}

const AGREEMENTS: { type: AgreementType; title: string; version: string; content: React.ReactNode }[] = [
  {
    type: "campsite",
    title: "Umowa pola namiotowego",
    version: "1.0",
    content: (
      <div className="space-y-2 text-sm leading-6 text-muted-foreground">
        <p>
          Regulamin korzystania z pola namiotowego. Akceptacja oznacza zawarcie umowy na warunkach
          regulaminu i cennika operatora obiektu. Prosimy o zapoznanie się z pełną treścią regulaminu.
        </p>
        <ul className="list-disc pl-6">
          <li>Przestrzeganie ciszy nocnej i zasad BHP.</li>
          <li>Odpowiedzialność materialna za szkody wyrządzone przez Gościa i osoby towarzyszące.</li>
          <li>Obowiązek stosowania się do poleceń obsługi w zakresie bezpieczeństwa.</li>
        </ul>
      </div>
    ),
  },
  {
    type: "kayak",
    title: "Umowa wypożyczenia kajaków",
    version: "1.0",
    content: (
      <div className="space-y-2 text-sm leading-6 text-muted-foreground">
        <p>
          Regulamin wypożyczenia kajaków i sprzętu pływającego. Akceptacja oznacza zawarcie umowy
          i odpowiedzialność za sprzęt zgodnie z cennikiem i warunkami regulaminu.
        </p>
        <ul className="list-disc pl-6">
          <li>Użytkownik oświadcza, że potrafi pływać i jest w stanie trzeźwości.</li>
          <li>Obowiązek używania kamizelek asekuracyjnych.</li>
          <li>Odpowiedzialność za szkody i zwrot sprzętu w stanie niepogorszonym ponad zwykłe zużycie.</li>
        </ul>
      </div>
    ),
  },
]

export default function DocumentsPage() {
  const [statuses, setStatuses] = React.useState<Record<AgreementType, AgreementStatus>>({
    campsite: { type: "campsite", version: "1.0" },
    kayak: { type: "kayak", version: "1.0" },
  })
  const [rows, setRows] = React.useState<Array<{
    acceptanceId: string
    firstName?: string
    lastName?: string
    phone?: string
    kayakAccepted: boolean
    campsiteAccepted: boolean
  }>>([])

  const refreshRows = React.useCallback(async () => {
    try {
      const res = await fetch("/api/documents/accept", { cache: "no-store" })
      const data = await res.json()
      const grouped = new Map<string, any>()
      ;(data as any[]).forEach((item) => {
        const key = item.phone || item.email || item.userId
        const prev = grouped.get(key) || { firstName: item.firstName, lastName: item.lastName, phone: item.phone, kayakAccepted: false, campsiteAccepted: false }
        if (item.type === "kayak") prev.kayakAccepted = true
        if (item.type === "campsite") prev.campsiteAccepted = true
        grouped.set(key, prev)
      })
      const tableRows = Array.from(grouped.entries()).map(([k, v]) => ({
        acceptanceId: k,
        ...v,
      }))
      setRows(tableRows)
    } catch {
      setRows([])
    }
  }, [])

  React.useEffect(() => {
    refreshRows()
  }, [refreshRows])

  const handleAccept = async (type: AgreementType, version: string) => {
    const now = new Date().toISOString()
    setStatuses((prev) => ({
      ...prev,
      [type]: { type, acceptedAt: now, version },
    }))

    try {
      await fetch("/api/documents/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, version, acceptedAt: now }),
      })
      refreshRows()
    } catch {
      // no-op fallback; UI już zaktualizowany optymistycznie
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="mb-4 flex items-center gap-2 text-muted-foreground">
              <IconFileDescription className="size-5" />
              <h1 className="text-xl font-semibold">Dokumenty i umowy</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Poniżej możesz zaakceptować regulaminy/umowy. Akceptacja w aplikacji jest zawarciem
              umowy na odległość i jest równoważna podpisowi, ponieważ rejestrujemy Twój jednoznaczny
              zamiar akceptacji wraz z identyfikacją, treścią, wersją dokumentu oraz pieczęcią
              czasu i danymi technicznymi (dowód zawarcia umowy zgodnie z KC oraz eIDAS w zakresie
              podpisu elektronicznego niewymagającego formy kwalifikowanej, gdy nie zastrzeżono formy
              szczególnej).
            </p>
          </div>

          <div className="grid gap-4 px-4 lg:grid-cols-2 lg:px-6">
            {AGREEMENTS.map((a) => {
              const status = statuses[a.type]
              const isAccepted = Boolean(status?.acceptedAt)
              return (
                <Card key={a.type} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconShieldCheck className="size-5 text-primary" /> {a.title}
                    </CardTitle>
                    <CardDescription>
                      Wersja {a.version}
                      {isAccepted && status?.acceptedAt && (
                        <span className="ml-2 rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                          zaakceptowano: {new Date(status.acceptedAt).toLocaleString()}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <Separator />
                  <CardContent className="space-y-4 pt-4">
                    {a.content}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Akceptując oświadczasz, że zapoznałeś/aś się z treścią i akceptujesz warunki.
                      </span>
                      <Button
                        aria-label={`Zaakceptuj: ${a.title}`}
                        onClick={() => handleAccept(a.type, a.version)}
                        disabled={isAccepted}
                        className="min-w-40"
                      >
                        {isAccepted ? "Zaakceptowano" : "Zaakceptowałem regulamin"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Akceptacje klientów</CardTitle>
                <CardDescription>Imię, nazwisko, telefon, akceptacje: kajaki i pole namiotowe</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imię i nazwisko</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Kajaki</TableHead>
                      <TableHead>Pole namiotowe</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">Brak danych</TableCell>
                      </TableRow>
                    ) : (
                      rows.map((r) => (
                        <TableRow key={r.acceptanceId}>
                          <TableCell>{[r.firstName, r.lastName].filter(Boolean).join(" ") || "—"}</TableCell>
                          <TableCell>{r.phone || "—"}</TableCell>
                          <TableCell>
                            <span className={r.kayakAccepted ? "text-emerald-600" : "text-muted-foreground"}>
                              {r.kayakAccepted ? "Tak" : "Nie"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={r.campsiteAccepted ? "text-emerald-600" : "text-muted-foreground"}>
                              {r.campsiteAccepted ? "Tak" : "Nie"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


