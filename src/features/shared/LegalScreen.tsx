import { PlaceholderScreen } from "@/features/shared/PlaceholderScreen"

type LegalKind = "impressum" | "privacy" | "terms"

const legalCopy: Record<LegalKind, Parameters<typeof PlaceholderScreen>[0]> = {
  impressum: {
    eyebrowTx: "shared:legal.eyebrow",
    titleTx: "shared:legal.impressum.title",
    bodyTx: "shared:legal.impressum.body",
    statusTx: "shared:legal.status",
  },
  privacy: {
    eyebrowTx: "shared:legal.eyebrow",
    titleTx: "shared:legal.privacy.title",
    bodyTx: "shared:legal.privacy.body",
    statusTx: "shared:legal.status",
  },
  terms: {
    eyebrowTx: "shared:legal.eyebrow",
    titleTx: "shared:legal.terms.title",
    bodyTx: "shared:legal.terms.body",
    statusTx: "shared:legal.status",
  },
}

interface LegalScreenProps {
  kind: LegalKind
}

export function LegalScreen({ kind }: LegalScreenProps) {
  return <PlaceholderScreen {...legalCopy[kind]} showBack backFallbackHref="/" />
}
