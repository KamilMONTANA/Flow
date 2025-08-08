import { NextRequest, NextResponse } from "next/server"
import { computeAgreementHash, getAgreementCanonical } from "@/lib/agreements"

type AgreementType = "campsite" | "kayak"

// PAMIĘĆ TYMCZASOWA: w przyszłości zastąp DB (Mongo/Mongoose)
const inMemoryAcceptances: Array<{
  acceptanceId: string
  userId: string
  type: AgreementType
  version: string
  acceptedAt: string
  userAgent?: string
  ip?: string
  documentHash?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}> = []

export async function GET() {
  return NextResponse.json(inMemoryAcceptances)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, version, acceptedAt, firstName, lastName, email, phone } = body as {
      type?: AgreementType
      version?: string
      acceptedAt?: string
      firstName?: string
      lastName?: string
      email?: string
      phone?: string
    }

    if (!type || !version || !acceptedAt) {
      return NextResponse.json({ error: "Brak wymaganych pól" }, { status: 400 })
    }

    const canonical = getAgreementCanonical(type, version)
    if (!canonical) {
      return NextResponse.json({ error: "Nieznana umowa lub wersja" }, { status: 400 })
    }
    const documentHash = computeAgreementHash(type, version)

    const userId = email || phone || "demo-user"
    const userAgent = request.headers.get("user-agent") ?? undefined
    const ip = request.headers.get("x-forwarded-for") ?? undefined

    const acceptanceId = `${userId}-${type}-${acceptedAt}`
    inMemoryAcceptances.push({
      acceptanceId,
      userId,
      type,
      version,
      acceptedAt,
      userAgent,
      ip,
      documentHash,
      firstName,
      lastName,
      email,
      phone,
    })

    return NextResponse.json({ ok: true, documentHash, acceptanceId })
  } catch {
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}


