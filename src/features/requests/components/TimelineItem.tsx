import { TextStyle, View, ViewStyle } from "react-native"

import { Text } from "@/components/Text"
import { getTimelineEventStatusDisplay } from "@/domain/requests/requestStatusDisplay"
import { translate } from "@/i18n/translate"
import type { RequestTimelineEventDto } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { formatDate } from "@/utils/formatDate"

import { StatusBadge } from "./StatusBadge"

interface TimelineItemProps {
  event: RequestTimelineEventDto
}

export function TimelineItem({ event }: TimelineItemProps) {
  const { themed } = useAppTheme()
  const display = getTimelineEventStatusDisplay(event)
  const title = getTimelineTitle(event)

  return (
    <View style={themed($container)}>
      <View style={themed($marker)} />
      <View style={themed($body)}>
        <View style={themed($header)}>
          <Text text={title} preset="formLabel" style={themed($title)} />
          <StatusBadge display={display} />
        </View>
        <Text text={safeFormatDate(event.occurredAt)} style={themed($meta)} />
        <Text
          tx="funeralHome:quotes.timeline.actorLabel"
          txOptions={{ actor: getActorLabel(event.actorRole) }}
          preset="formHelper"
          style={themed($meta)}
        />
        {event.description.trim() ? (
          <Text text={event.description} style={themed($description)} />
        ) : null}
      </View>
    </View>
  )
}

function getTimelineTitle(event: RequestTimelineEventDto) {
  const keyByType = {
    REQUEST_CREATED: "funeralHome:quotes.timeline.events.REQUEST_CREATED",
    REQUEST_SENT: "funeralHome:quotes.timeline.events.REQUEST_SENT",
    REQUEST_EMAIL_QUEUED: "funeralHome:quotes.timeline.events.REQUEST_EMAIL_QUEUED",
    RESPONSE_RECEIVED: "funeralHome:quotes.timeline.events.RESPONSE_RECEIVED",
    EMAIL_DELIVERED: "funeralHome:quotes.timeline.events.EMAIL_DELIVERED",
    DOCUMENT_ADDED: "funeralHome:quotes.timeline.events.DOCUMENT_ADDED",
    AUDIT: "funeralHome:quotes.timeline.events.AUDIT",
  } as const
  const key = keyByType[event.type as keyof typeof keyByType]

  return key ? translate(key) : event.title
}

function getActorLabel(actorRole: RequestTimelineEventDto["actorRole"]) {
  const keyByRole = {
    ADMIN: "funeralHome:quotes.timeline.actors.ADMIN",
    FUNERAL_HOME_USER: "funeralHome:quotes.timeline.actors.FUNERAL_HOME_USER",
    OPERATOR: "funeralHome:quotes.timeline.actors.OPERATOR",
    SUPER_ADMIN: "funeralHome:quotes.timeline.actors.SUPER_ADMIN",
    SUPPLIER_USER: "funeralHome:quotes.timeline.actors.SUPPLIER_USER",
    SUPPORT: "funeralHome:quotes.timeline.actors.SUPPORT",
    SYSTEM: "funeralHome:quotes.timeline.actors.SYSTEM",
  } as const

  return translate(keyByRole[actorRole])
}

function safeFormatDate(value: string) {
  try {
    return formatDate(value, "dd. MMM yyyy, HH:mm")
  } catch {
    return translate("funeralHome:quotes.card.dateUnavailable")
  }
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
})

const $marker: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: colors.primary,
  marginTop: spacing.xs,
})

const $body: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
  paddingBottom: spacing.sm,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $title: ThemedStyle<TextStyle> = () => ({
  flexShrink: 1,
})

const $meta: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})

const $description: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginTop: spacing.xs,
})
