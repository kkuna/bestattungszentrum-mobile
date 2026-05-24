import { PlaceholderScreen } from "@/features/shared/PlaceholderScreen"

type SettingsPlaceholderKind = "notifications" | "offline" | "empty" | "error"

const placeholderCopy: Record<SettingsPlaceholderKind, Parameters<typeof PlaceholderScreen>[0]> = {
  notifications: {
    eyebrowTx: "shared:settings.placeholders.notifications.eyebrow",
    titleTx: "shared:settings.placeholders.notifications.title",
    bodyTx: "shared:settings.placeholders.notifications.body",
    statusTx: "shared:settings.placeholders.notifications.status",
  },
  offline: {
    eyebrowTx: "shared:settings.placeholders.offline.eyebrow",
    titleTx: "shared:settings.placeholders.offline.title",
    bodyTx: "shared:settings.placeholders.offline.body",
    statusTx: "shared:settings.placeholders.offline.status",
    actions: [{ tx: "shared:settings.placeholders.offline.retryAction", disabled: true }],
  },
  empty: {
    eyebrowTx: "shared:settings.placeholders.empty.eyebrow",
    titleTx: "shared:settings.placeholders.empty.title",
    bodyTx: "shared:settings.placeholders.empty.body",
    statusTx: "shared:settings.placeholders.empty.status",
  },
  error: {
    eyebrowTx: "shared:settings.placeholders.error.eyebrow",
    titleTx: "shared:settings.placeholders.error.title",
    bodyTx: "shared:settings.placeholders.error.body",
    statusTx: "shared:settings.placeholders.error.status",
    actions: [{ tx: "shared:settings.placeholders.error.retryAction", disabled: true }],
  },
}

export function SettingsPlaceholderScreen({ kind }: { kind: SettingsPlaceholderKind }) {
  return <PlaceholderScreen {...placeholderCopy[kind]} />
}
