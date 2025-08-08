export type AgreementType = "campsite" | "kayak"

export type AgreementAcceptance = {
  userId: string
  type: AgreementType
  version: string
  acceptedAt: string
  userAgent?: string
  ip?: string
}


