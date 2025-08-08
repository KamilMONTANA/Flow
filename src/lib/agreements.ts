import crypto from "node:crypto"
import type { AgreementType } from "@/types/documents"

type AgreementCanonical = {
  type: AgreementType
  version: string
  title: string
  content: string
}

const canonicalAgreements: AgreementCanonical[] = [
  {
    type: "campsite",
    version: "1.0",
    title: "Umowa pola namiotowego",
    content:
      "Regulamin korzystania z pola namiotowego. Zasady BHP, odpowiedzialność materialna, cisza nocna, stosowanie się do poleceń obsługi. Akceptacja oznacza zawarcie umowy na zasadach regulaminu i cennika operatora obiektu.",
  },
  {
    type: "kayak",
    version: "1.0",
    title: "Umowa wypożyczenia kajaków",
    content:
      "Regulamin wypożyczenia kajaków i sprzętu pływającego. Użytkownik oświadcza, że potrafi pływać i jest trzeźwy, używa kamizelek, odpowiada za szkody i zwraca sprzęt w stanie niepogorszonym ponad zwykłe zużycie.",
  },
]

export const getAgreementCanonical = (type: AgreementType, version: string) => {
  return canonicalAgreements.find((a) => a.type === type && a.version === version)
}

export const sha256 = (input: string) => {
  const hash = crypto.createHash("sha256")
  hash.update(input)
  return hash.digest("hex")
}

export const computeAgreementHash = (type: AgreementType, version: string) => {
  const found = getAgreementCanonical(type, version)
  if (!found) return undefined
  // Hash obejmuje typ, wersję, tytuł i treść
  return sha256(`${found.type}|${found.version}|${found.title}|${found.content}`)
}


