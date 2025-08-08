import { NextRequest, NextResponse } from "next/server"
import { computeAgreementHash, getAgreementCanonical } from "@/lib/agreements"
import { createSupabaseAdminClient } from "@/lib/supabase/server"

type AgreementType = "campsite" | "kayak"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const revalidate = 0

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from("document_acceptances")
      .select("acceptance_id, user_id, first_name, last_name, phone, email, type, version, accepted_at")
      .order("accepted_at", { ascending: false })

    if (error) throw error
    const mapped = (data ?? []).map((r: any) => ({
      acceptanceId: r.acceptance_id,
      userId: r.user_id,
      firstName: r.first_name,
      lastName: r.last_name,
      phone: r.phone,
      email: r.email,
      type: r.type,
      version: r.version,
      acceptedAt: r.accepted_at,
    }))
    return NextResponse.json(mapped)
  } catch (e) {
    return NextResponse.json([], { status: 200 })
  }
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

    const supabase = createSupabaseAdminClient()
    const { error } = await supabase.from("document_acceptances").upsert({
      acceptance_id: acceptanceId,
      user_id: userId,
      type,
      version,
      accepted_at: new Date(acceptedAt).toISOString(),
      user_agent: userAgent,
      ip,
      document_hash: documentHash,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
    })
    if (error) throw error

    return NextResponse.json({ ok: true, documentHash, acceptanceId })
  } catch (e) {
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}

