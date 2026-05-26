import { useMemo, useRef, useState } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { router } from "expo-router"
import i18n from "i18next"
import {
  Controller,
  type FieldErrors,
  type Path,
  type UseFormReturn,
  useForm,
} from "react-hook-form"

import { BackHeader } from "@/components/BackHeader"
import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import type { QuoteFormFieldDescriptor } from "@/domain/requests/quoteFormSchema"
import type { TxKeyPath } from "@/i18n"
import { translate } from "@/i18n/translate"
import type {
  ApiFailure,
  CreateQuoteRequestInputDto,
  QuoteRequestAttributesDto,
  QuoteRequestDto,
} from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { DynamicSchemaField } from "./components/DynamicSchemaField"
import { ReviewSummaryBlock } from "./components/ReviewSummaryBlock"
import { SubmissionReceipt } from "./components/SubmissionReceipt"
import { useCreateQuoteRequestMutation } from "./hooks/useCreateQuoteRequestMutation"
import { useRfqFormContextQuery } from "./hooks/useRfqFormContextQuery"

type RfqFormScreenProps = {
  categoryId?: string
  categorySlug?: string
  supplierId?: string
}

type RfqStep = "form" | "receipt" | "review"

type PreparedSubmission = {
  idempotencyKey: string
  input: CreateQuoteRequestInputDto
  signature: string
}

export type RfqFormValues = {
  attributes: QuoteRequestAttributesDto
  deadline: string
  message: string
  quantity: string
  subject: string
}

export function RfqFormScreen({ categoryId, supplierId }: RfqFormScreenProps) {
  const { themed } = useAppTheme()
  const context = useRfqFormContextQuery(supplierId, categoryId)
  const createQuoteRequestMutation = useCreateQuoteRequestMutation()
  const sendingRef = useRef(false)
  const [step, setStep] = useState<RfqStep>("form")
  const [preparedSubmission, setPreparedSubmission] = useState<PreparedSubmission>()
  const [submittedRequest, setSubmittedRequest] = useState<QuoteRequestDto>()
  const [submitFailure, setSubmitFailure] = useState<ApiFailure>()
  const form = useForm<RfqFormValues>({
    defaultValues: {
      attributes: {},
      deadline: "",
      message: "",
      quantity: "",
      subject: "",
    },
    mode: "onSubmit",
  })

  const dynamicFields = useMemo(
    () => (context.contextStatus === "ready" ? context.data.schema.fields : []),
    [context],
  )
  const visibleDynamicFields = useMemo(
    () => dynamicFields.filter((field) => field.type !== "attachmentPlaceholder"),
    [dynamicFields],
  )
  const attachmentFields = useMemo(
    () => dynamicFields.filter((field) => field.type === "attachmentPlaceholder"),
    [dynamicFields],
  )

  if (context.contextStatus === "loading") {
    return (
      <RfqState
        bodyTx="funeralHome:rfq.states.loadingBody"
        titleTx="funeralHome:rfq.states.loadingTitle"
      />
    )
  }

  if (context.contextStatus !== "ready") {
    const action =
      context.contextStatus === "missing-context"
        ? () => router.replace("/funeral-home/discover")
        : context.refetch

    return (
      <RfqState
        actionTx={
          context.contextStatus === "missing-context"
            ? "funeralHome:rfq.states.backToDiscoverAction"
            : "funeralHome:rfq.states.retryAction"
        }
        bodyTx={context.errorKey}
        onAction={action}
        titleTx="funeralHome:rfq.states.blockedTitle"
      />
    )
  }

  const { category, supplier } = context.data
  const categoryName = getCategoryName(category)
  const supplierName = supplier.tradingName.trim() || supplier.legalName
  const currentValues = form.getValues()
  const isSending = createQuoteRequestMutation.isPending

  const showForm = step === "form"
  const showReview = step === "review"
  const showReceipt = step === "receipt" && submittedRequest

  const editFormSection = (path?: Path<RfqFormValues>) => {
    setSubmitFailure(undefined)
    setStep("form")
    if (path) {
      setTimeout(() => form.setFocus(path), 0)
    }
  }

  const prepareReview = (values: RfqFormValues) => {
    const input = buildCreateQuoteRequestInput({
      categoryId: category.id,
      fields: dynamicFields,
      supplierId: supplier.id,
      values,
    })
    const signature = JSON.stringify(input)

    setPreparedSubmission((current) =>
      current?.signature === signature
        ? current
        : {
            idempotencyKey: createIdempotencyKey(),
            input,
            signature,
          },
    )
    setSubmitFailure(undefined)
    setStep("review")
  }

  const submitPreparedRequest = async () => {
    if (!preparedSubmission || isSending || sendingRef.current) return

    sendingRef.current = true
    try {
      const result = await createQuoteRequestMutation.mutateAsync({
        idempotencyKey: preparedSubmission.idempotencyKey,
        input: preparedSubmission.input,
      })

      if (result.ok) {
        setSubmittedRequest(result.data)
        setPreparedSubmission(undefined)
        setSubmitFailure(undefined)
        setStep("receipt")
        return
      }

      sendingRef.current = false
      setSubmitFailure(result)
    } catch {
      sendingRef.current = false
      setSubmitFailure({
        ok: false,
        problem: "network",
        messageKey: "funeralHome:rfq.submit.errors.network",
      })
    }
  }

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      keyboardBottomOffset={96}
      contentContainerStyle={themed($content)}
    >
      <BackHeader fallbackHref="/funeral-home/discover" />
      <View style={themed($section)}>
        <Text tx="funeralHome:rfq.eyebrow" preset="formHelper" style={themed($mutedText)} />
        <Text tx="funeralHome:rfq.title" preset="heading" />
        <Text tx="funeralHome:rfq.body" style={themed($mutedText)} />
      </View>

      <View style={themed($section)}>
        <Text tx="funeralHome:rfq.context.title" preset="formLabel" />
        <ContextLine labelTx="funeralHome:rfq.context.supplierLabel" value={supplierName} />
        <ContextLine labelTx="funeralHome:rfq.context.categoryLabel" value={categoryName} />
      </View>

      {showForm ? (
        <>
          <View style={themed($section)}>
            <Text tx="funeralHome:rfq.sections.requestBasics" preset="formLabel" />
            <Controller
              control={form.control}
              name="subject"
              rules={{ validate: validateRequiredText }}
              render={({ field, fieldState }) => (
                <TextField
                  accessibilityLabel={translate("funeralHome:rfq.fields.subjectA11y")}
                  helper={fieldState.error?.message}
                  labelTx="funeralHome:rfq.fields.subjectLabel"
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  ref={field.ref}
                  status={fieldState.error ? "error" : undefined}
                  value={field.value}
                />
              )}
            />
            <Controller
              control={form.control}
              name="message"
              rules={{ validate: validateRequiredText }}
              render={({ field, fieldState }) => (
                <TextField
                  accessibilityLabel={translate("funeralHome:rfq.fields.messageA11y")}
                  helper={fieldState.error?.message}
                  labelTx="funeralHome:rfq.fields.messageLabel"
                  multiline
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  ref={field.ref}
                  status={fieldState.error ? "error" : undefined}
                  value={field.value}
                />
              )}
            />
            <Controller
              control={form.control}
              name="deadline"
              rules={{
                required: translate("funeralHome:rfq.validation.required"),
                validate: validateDateOnly,
              }}
              render={({ field, fieldState }) => (
                <TextField
                  accessibilityLabel={translate("funeralHome:rfq.fields.deadlineA11y")}
                  helper={
                    fieldState.error?.message ?? translate("funeralHome:rfq.fields.deadlineHelper")
                  }
                  labelTx="funeralHome:rfq.fields.deadlineLabel"
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  ref={field.ref}
                  status={fieldState.error ? "error" : undefined}
                  value={field.value}
                />
              )}
            />
            <Controller
              control={form.control}
              name="quantity"
              rules={{ validate: validateOptionalQuantity }}
              render={({ field, fieldState }) => (
                <TextField
                  accessibilityLabel={translate("funeralHome:rfq.fields.quantityA11y")}
                  helper={fieldState.error?.message}
                  helperTx={fieldState.error ? undefined : "funeralHome:rfq.fields.quantityHelper"}
                  keyboardType="numeric"
                  labelTx="funeralHome:rfq.fields.quantityLabel"
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  ref={field.ref}
                  status={fieldState.error ? "error" : undefined}
                  value={field.value}
                />
              )}
            />
          </View>

          <View style={themed($section)}>
            <Text tx="funeralHome:rfq.sections.categoryFields" preset="formLabel" />
            {visibleDynamicFields.length > 0 ? (
              visibleDynamicFields.map((field) => (
                <DynamicSchemaField
                  key={field.id}
                  control={form.control}
                  field={field}
                  name={`attributes.${field.id}`}
                />
              ))
            ) : (
              <Text tx="funeralHome:rfq.dynamic.empty" style={themed($mutedText)} />
            )}
          </View>

          <View style={themed($section)}>
            <Text tx="funeralHome:rfq.sections.attachments" preset="formLabel" />
            <Text tx="funeralHome:rfq.fields.attachmentsPlaceholder" style={themed($mutedText)} />
            {attachmentFields.map((field) => (
              <DynamicSchemaField
                key={field.id}
                control={form.control}
                field={field}
                name={`attributes.${field.id}`}
              />
            ))}
          </View>

          <View style={themed($actions)}>
            <Button
              tx="funeralHome:rfq.actions.continueToReview"
              accessibilityLabel={translate("funeralHome:rfq.actions.continueToReviewA11y")}
              onPress={form.handleSubmit(prepareReview, (errors) =>
                focusFirstInvalidField(form, errors),
              )}
              preset="filled"
            />
          </View>
        </>
      ) : null}

      {showReview ? (
        <>
          <ReviewSummaryBlock
            attachmentFields={attachmentFields}
            categoryName={categoryName}
            dynamicFields={dynamicFields}
            onEditAttachments={() => editFormSection()}
            onEditBasics={() => editFormSection("subject")}
            onEditCategoryFields={() =>
              editFormSection(
                visibleDynamicFields[0]
                  ? (`attributes.${visibleDynamicFields[0].id}` as Path<RfqFormValues>)
                  : undefined,
              )
            }
            supplierName={supplierName}
            values={currentValues}
          />

          {submitFailure ? (
            <View accessibilityRole="alert" style={themed($errorNotice)}>
              <Text tx="funeralHome:rfq.submit.errors.title" preset="formLabel" />
              <Text tx={submitFailure.messageKey} style={themed($errorText)} />
            </View>
          ) : null}

          <View style={themed($actions)}>
            <Button
              accessibilityLabel={translate(
                isSending
                  ? "funeralHome:rfq.actions.sendPendingA11y"
                  : "funeralHome:rfq.actions.sendA11y",
              )}
              disabled={isSending}
              onPress={submitPreparedRequest}
              preset="filled"
              tx={
                isSending ? "funeralHome:rfq.actions.sendPending" : "funeralHome:rfq.actions.send"
              }
            />
            <Button
              accessibilityLabel={translate("funeralHome:rfq.review.editBasicsA11y")}
              disabled={isSending}
              onPress={() => editFormSection("subject")}
              tx="funeralHome:rfq.review.backToEdit"
            />
          </View>
        </>
      ) : null}

      {showReceipt ? (
        <SubmissionReceipt
          onStartAnotherSearch={() => router.replace("/funeral-home/discover")}
          onViewRequests={() => router.replace("/funeral-home/quotes")}
          request={submittedRequest}
        />
      ) : null}
    </Screen>
  )
}

function focusFirstInvalidField(
  form: UseFormReturn<RfqFormValues>,
  errors: FieldErrors<RfqFormValues>,
) {
  const firstPath = getFirstErrorPath(errors)
  if (!firstPath) return

  form.setFocus(firstPath as Path<RfqFormValues>)
}

function getFirstErrorPath(errors: Record<string, unknown>, parentPath = ""): string | undefined {
  for (const [key, value] of Object.entries(errors)) {
    if (!value || typeof value !== "object") continue

    const path = parentPath ? `${parentPath}.${key}` : key
    const candidate = value as { message?: unknown; type?: unknown }
    if (candidate.message || candidate.type) return path

    const childPath = getFirstErrorPath(value as Record<string, unknown>, path)
    if (childPath) return childPath
  }

  return undefined
}

export function composePreparedRequestAttributes(
  values: RfqFormValues,
  fields: QuoteFormFieldDescriptor[] = [],
): QuoteRequestAttributesDto {
  const attributes = normalizeDynamicAttributes(values.attributes, fields)

  return {
    ...attributes,
    ...(values.quantity.trim() ? { quantity: values.quantity.trim() } : {}),
  }
}

export function buildCreateQuoteRequestInput({
  categoryId,
  fields = [],
  supplierId,
  values,
}: {
  categoryId: string
  fields?: QuoteFormFieldDescriptor[]
  supplierId: string
  values: RfqFormValues
}): CreateQuoteRequestInputDto {
  return {
    attachments: [],
    attributes: composePreparedRequestAttributes(values, fields),
    categoryId,
    deadline: toApiDeadlineDate(values.deadline),
    message: values.message.trim(),
    subject: values.subject.trim(),
    supplierId,
  }
}

export function toApiDeadlineDate(value: string): string {
  return value.trim()
}

export function validateDateOnly(value: string) {
  const trimmedValue = value.trim()
  if (!trimmedValue) return translate("funeralHome:rfq.validation.required")
  if (!isValidDateOnly(trimmedValue)) return translate("funeralHome:rfq.validation.date")

  return true
}

function validateRequiredText(value: string) {
  return value.trim().length > 0 || translate("funeralHome:rfq.validation.required")
}

function validateOptionalQuantity(value: string) {
  const trimmedValue = value.trim()
  if (!trimmedValue) return true

  return /^[1-9]\d*$/.test(trimmedValue) || translate("funeralHome:rfq.validation.quantity")
}

function normalizeDynamicAttributes(
  attributes: QuoteRequestAttributesDto,
  fields: QuoteFormFieldDescriptor[],
): QuoteRequestAttributesDto {
  const numberFieldIds = new Set(
    fields.filter((field) => field.type === "number").map((field) => field.id),
  )

  return Object.fromEntries(
    Object.entries(attributes).map(([key, value]) => {
      if (!numberFieldIds.has(key) || typeof value !== "string") return [key, value]

      const parsedValue = Number(value.trim())
      return Number.isFinite(parsedValue) ? [key, parsedValue] : [key, value]
    }),
  )
}

function isValidDateOnly(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false

  const [, yearText, monthText, dayText] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}

function createIdempotencyKey() {
  return `rfq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function RfqState({
  actionTx,
  bodyTx,
  onAction,
  titleTx,
}: {
  actionTx?: TxKeyPath
  bodyTx: TxKeyPath
  onAction?: () => void
  titleTx: TxKeyPath
}) {
  const { themed } = useAppTheme()

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($stateContent)}
    >
      <BackHeader fallbackHref="/funeral-home/discover" />
      <View style={themed($section)}>
        <Text tx={titleTx} preset="subheading" />
        <Text tx={bodyTx} style={themed($mutedText)} />
        {actionTx ? <Button tx={actionTx} onPress={onAction} preset="filled" /> : null}
      </View>
    </Screen>
  )
}

function ContextLine({ labelTx, value }: { labelTx: TxKeyPath; value: string }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($contextLine)}>
      <Text tx={labelTx} preset="formHelper" style={themed($mutedText)} />
      <Text text={value} preset="formLabel" />
    </View>
  )
}

function getCategoryName(category: { nameDe: string; nameEn: string }) {
  const primaryName = i18n.language.startsWith("en") ? category.nameEn : category.nameDe
  const fallbackName = i18n.language.startsWith("en") ? category.nameDe : category.nameEn

  return (
    primaryName.trim() ||
    fallbackName.trim() ||
    translate("funeralHome:rfq.context.categoryFallback")
  )
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
  padding: spacing.md,
  paddingBottom: spacing.xl,
})

const $stateContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  gap: spacing.sm,
  padding: spacing.lg,
})

const $section: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  gap: spacing.sm,
  padding: spacing.md,
})

const $contextLine: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xxxs,
})

const $errorNotice: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.errorBackground,
  borderColor: colors.danger,
  borderRadius: 8,
  borderWidth: 1,
  gap: spacing.xs,
  padding: spacing.md,
})

const $actions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $mutedText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
})
