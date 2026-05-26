import type { ReactNode } from "react"
import { TextStyle, View, ViewStyle } from "react-native"

import { Button } from "@/components/Button"
import { Text } from "@/components/Text"
import type { QuoteFormFieldDescriptor } from "@/domain/requests/quoteFormSchema"
import { translate } from "@/i18n/translate"
import type { QuoteRequestAttributesDto } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type ReviewValues = {
  attributes: QuoteRequestAttributesDto
  deadline: string
  message: string
  quantity: string
  subject: string
}

type ReviewSummaryBlockProps = {
  attachmentFields: QuoteFormFieldDescriptor[]
  categoryName: string
  dynamicFields: QuoteFormFieldDescriptor[]
  onEditAttachments: () => void
  onEditBasics: () => void
  onEditCategoryFields: () => void
  supplierName: string
  values: ReviewValues
}

export function ReviewSummaryBlock({
  attachmentFields,
  categoryName,
  dynamicFields,
  onEditAttachments,
  onEditBasics,
  onEditCategoryFields,
  supplierName,
  values,
}: ReviewSummaryBlockProps) {
  const { themed } = useAppTheme()
  const visibleDynamicFields = dynamicFields.filter(
    (field) => field.type !== "attachmentPlaceholder" && field.type !== "unsupported",
  )

  return (
    <View style={themed($container)}>
      <View style={themed($header)}>
        <View style={themed($headerText)}>
          <Text tx="funeralHome:rfq.review.title" preset="subheading" />
          <Text tx="funeralHome:rfq.review.body" style={themed($mutedText)} />
        </View>
      </View>

      <SummarySection
        actionA11y={translate("funeralHome:rfq.review.editBasicsA11y")}
        actionText={translate("funeralHome:rfq.review.editAction")}
        onAction={onEditBasics}
        title={translate("funeralHome:rfq.sections.requestBasics")}
      >
        <SummaryRow
          label={translate("funeralHome:rfq.context.supplierLabel")}
          value={supplierName}
        />
        <SummaryRow
          label={translate("funeralHome:rfq.context.categoryLabel")}
          value={categoryName}
        />
        <SummaryRow
          label={translate("funeralHome:rfq.fields.subjectLabel")}
          value={values.subject}
        />
        <SummaryRow
          label={translate("funeralHome:rfq.fields.messageLabel")}
          value={values.message}
        />
        <SummaryRow
          label={translate("funeralHome:rfq.fields.deadlineLabel")}
          value={values.deadline}
        />
        {values.quantity.trim() ? (
          <SummaryRow
            label={translate("funeralHome:rfq.fields.quantityLabel")}
            value={values.quantity.trim()}
          />
        ) : null}
      </SummarySection>

      <SummarySection
        actionA11y={translate("funeralHome:rfq.review.editCategoryFieldsA11y")}
        actionText={translate("funeralHome:rfq.review.editAction")}
        onAction={onEditCategoryFields}
        title={translate("funeralHome:rfq.sections.categoryFields")}
      >
        {visibleDynamicFields.length > 0 ? (
          visibleDynamicFields.map((field) => (
            <SummaryRow
              key={field.id}
              label={field.label ?? translate("funeralHome:rfq.dynamic.unnamedField")}
              value={formatAttributeValue(field, values.attributes[field.id])}
            />
          ))
        ) : (
          <Text tx="funeralHome:rfq.dynamic.empty" style={themed($mutedText)} />
        )}
      </SummarySection>

      <SummarySection
        actionA11y={translate("funeralHome:rfq.review.editAttachmentsA11y")}
        actionText={translate("funeralHome:rfq.review.editAction")}
        onAction={onEditAttachments}
        title={translate("funeralHome:rfq.sections.attachments")}
      >
        <Text tx="funeralHome:rfq.review.attachmentsUnavailable" style={themed($mutedText)} />
        {attachmentFields.map((field) => (
          <SummaryRow
            key={field.id}
            label={field.label ?? translate("funeralHome:rfq.dynamic.unnamedField")}
            value={translate("funeralHome:rfq.review.attachmentPending")}
          />
        ))}
      </SummarySection>

      <View
        accessibilityLabel={translate("funeralHome:rfq.review.metadataA11y")}
        style={themed($metadata)}
      >
        <Text tx="funeralHome:rfq.review.metadataTitle" preset="formLabel" />
        <Text tx="funeralHome:rfq.review.languageStatus" style={themed($mutedText)} />
      </View>
    </View>
  )
}

function SummarySection({
  actionA11y,
  actionText,
  children,
  onAction,
  title,
}: {
  actionA11y: string
  actionText: string
  children: ReactNode
  onAction: () => void
  title: string
}) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($section)}>
      <View style={themed($sectionHeader)}>
        <Text text={title} preset="formLabel" style={themed($sectionTitle)} />
        <Button
          accessibilityLabel={actionA11y}
          onPress={onAction}
          preset="default"
          style={themed($editButton)}
          text={actionText}
        />
      </View>
      <View style={themed($rows)}>{children}</View>
    </View>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($row)}>
      <Text text={label} preset="formHelper" style={themed($mutedText)} />
      <Text text={value || translate("funeralHome:rfq.review.notProvided")} preset="formLabel" />
    </View>
  )
}

export function formatAttributeValue(field: QuoteFormFieldDescriptor, value: unknown): string {
  if (value === undefined || value === null || value === "") {
    return translate("funeralHome:rfq.review.notProvided")
  }

  if (field.type === "boolean") {
    return value
      ? translate("funeralHome:rfq.review.booleanYes")
      : translate("funeralHome:rfq.review.booleanNo")
  }

  if (field.type === "select" || field.type === "segmented") {
    return field.options?.find((option) => option.value === value)?.label ?? ""
  }

  if (field.type === "multiSelect") {
    if (!Array.isArray(value)) return ""
    return value
      .map((item) => field.options?.find((option) => option.value === item)?.label)
      .filter((label): label is string => !!label)
      .join(", ")
  }

  if (typeof value === "number" || typeof value === "string") return String(value)

  return translate("funeralHome:rfq.review.notProvided")
}

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  gap: spacing.md,
  padding: spacing.md,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $headerText: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $section: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  gap: spacing.sm,
  padding: spacing.sm,
})

const $sectionHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  flexDirection: "row",
  gap: spacing.sm,
  justifyContent: "space-between",
})

const $sectionTitle: ThemedStyle<TextStyle> = () => ({
  flex: 1,
})

const $editButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 36,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxxs,
})

const $rows: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $row: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xxxs,
})

const $metadata: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.infoBackground,
  borderRadius: 8,
  gap: spacing.xs,
  padding: spacing.sm,
})

const $mutedText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})
