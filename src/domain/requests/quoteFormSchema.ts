import i18n from "i18next"

import type { TxKeyPath } from "@/i18n"

export type QuoteFormSupportedFieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "multiSelect"
  | "boolean"
  | "segmented"
  | "attachmentPlaceholder"

export type QuoteFormFieldType = QuoteFormSupportedFieldType | "unsupported"

export type QuoteFormOptionDescriptor = {
  label: string
  value: string
}

export type QuoteFormValidationDescriptor = {
  max?: number
  maxLength?: number
  min?: number
  minLength?: number
  pattern?: string
}

export type QuoteFormFieldDescriptor = {
  defaultValue?: unknown
  errorKey: TxKeyPath
  helper?: string
  id: string
  label?: string
  options?: QuoteFormOptionDescriptor[]
  required: boolean
  sourcePath: string
  type: QuoteFormFieldType
  unsupportedType?: string
  validation?: QuoteFormValidationDescriptor
}

export type NormalizedQuoteFormSchema =
  | {
      fields: QuoteFormFieldDescriptor[]
      status: "ready"
      warnings: string[]
    }
  | {
      fields: []
      messageKey: TxKeyPath
      status: "invalid"
      warnings: string[]
    }

type FieldCandidate = {
  field: Record<string, unknown>
  idFromKey?: string
  malformed?: boolean
  requiredFromParent?: boolean
  sourcePath: string
}

const invalidSchemaKey = "funeralHome:rfq.errors.schemaInvalid" as const
const unsupportedFieldKey = "funeralHome:rfq.errors.unsupportedField" as const
const requiredFieldKey = "funeralHome:rfq.validation.required" as const

export function normalizeQuoteFormSchema(schema: unknown): NormalizedQuoteFormSchema {
  if (schema == null) {
    return ready([])
  }

  if (!isRecord(schema)) {
    return {
      fields: [],
      messageKey: invalidSchemaKey,
      status: "invalid",
      warnings: ["schema.invalidRoot"],
    }
  }

  const fieldCandidates = getFieldCandidates(schema)
  const fields: QuoteFormFieldDescriptor[] = []
  const warnings: string[] = []

  fieldCandidates.forEach((candidate, index) => {
    const normalized = normalizeField(candidate, index)
    fields.push(normalized.field)
    warnings.push(...normalized.warnings)
  })

  return ready(fields, warnings)
}

function ready(
  fields: QuoteFormFieldDescriptor[],
  warnings: string[] = [],
): NormalizedQuoteFormSchema {
  return {
    fields,
    status: "ready",
    warnings,
  }
}

function getFieldCandidates(schema: Record<string, unknown>): FieldCandidate[] {
  const fields = schema.fields
  if (Array.isArray(fields)) {
    return fields.map((field, index) => ({
      field: isRecord(field) ? field : {},
      malformed: !isRecord(field),
      sourcePath: `fields.${index}`,
    }))
  }

  const properties = schema.properties
  if (isRecord(properties)) {
    const required = Array.isArray(schema.required)
      ? new Set(schema.required.filter((item): item is string => typeof item === "string"))
      : new Set<string>()

    return Object.entries(properties).map(([id, field]) => ({
      field: isRecord(field) ? field : {},
      idFromKey: id,
      malformed: !isRecord(field),
      requiredFromParent: required.has(id),
      sourcePath: `properties.${id}`,
    }))
  }

  return []
}

function normalizeField(candidate: FieldCandidate, index: number) {
  const id = getFieldId(candidate.field, candidate.idFromKey)
  const sourcePath = candidate.sourcePath
  const warnings: string[] = []
  const label = getLocalizedString(
    candidate.field.label ?? candidate.field.title ?? candidate.field.nameLabel,
  )
  const helper = getLocalizedString(candidate.field.helper ?? candidate.field.description)
  const required = Boolean(candidate.field.required) || Boolean(candidate.requiredFromParent)
  const backendType = getBackendType(candidate.field)
  const options = getOptions(candidate.field)
  const validation = getValidation(candidate.field)
  const defaultValue = candidate.field.defaultValue ?? candidate.field.default

  if (candidate.malformed) {
    warnings.push(`${sourcePath}.malformedField`)
    return {
      field: unsupportedField({
        id: id ?? candidate.idFromKey ?? `field-${index}`,
        label,
        required,
        sourcePath,
        unsupportedType: backendType,
      }),
      warnings,
    }
  }

  if (!id) {
    warnings.push(`${sourcePath}.missingId`)
    return {
      field: unsupportedField({
        id: `field-${index}`,
        label,
        required,
        sourcePath,
        unsupportedType: backendType,
      }),
      warnings,
    }
  }

  const type = mapSupportedType(backendType, candidate.field, options)

  if (!type) {
    warnings.push(`${sourcePath}.unsupportedType`)
    return {
      field: unsupportedField({ id, label, required, sourcePath, unsupportedType: backendType }),
      warnings,
    }
  }

  if (
    (type === "select" || type === "multiSelect" || type === "segmented") &&
    options.length === 0
  ) {
    warnings.push(`${sourcePath}.missingOptions`)
    return {
      field: unsupportedField({ id, label, required, sourcePath, unsupportedType: backendType }),
      warnings,
    }
  }

  return {
    field: compactField({
      defaultValue,
      errorKey: requiredFieldKey,
      helper,
      id,
      label,
      options:
        type === "select" || type === "multiSelect" || type === "segmented" ? options : undefined,
      required,
      sourcePath,
      type,
      validation,
    }),
    warnings,
  }
}

function unsupportedField({
  id,
  label,
  required,
  sourcePath,
  unsupportedType,
}: {
  id: string
  label?: string
  required: boolean
  sourcePath: string
  unsupportedType?: string
}): QuoteFormFieldDescriptor {
  return compactField({
    errorKey: unsupportedFieldKey,
    id,
    label,
    required,
    sourcePath,
    type: "unsupported",
    unsupportedType,
  })
}

function compactField(field: QuoteFormFieldDescriptor): QuoteFormFieldDescriptor {
  return Object.fromEntries(
    Object.entries(field).filter(([, value]) => value !== undefined),
  ) as QuoteFormFieldDescriptor
}

function getFieldId(field: Record<string, unknown>, idFromKey?: string) {
  return getString(field.id) ?? getString(field.key) ?? getString(field.name) ?? idFromKey
}

function getBackendType(field: Record<string, unknown>): string | undefined {
  const explicitType =
    getString(field.type) ??
    getString(field.fieldType) ??
    getString(field.control) ??
    getString(field.widget) ??
    getString(field.inputType)

  if (explicitType) return explicitType

  if (Array.isArray(field.enum)) return "select"

  return undefined
}

function mapSupportedType(
  backendType: string | undefined,
  field: Record<string, unknown>,
  options: QuoteFormOptionDescriptor[],
): QuoteFormSupportedFieldType | undefined {
  const normalized = backendType?.trim().toLowerCase().replace(/[-\s]/g, "_")

  if (!normalized) {
    return Array.isArray(field.enum) || options.length > 0 ? "select" : undefined
  }

  if (normalized === "string" && (Array.isArray(field.enum) || options.length > 0)) return "select"
  if (["string", "text", "textarea", "long_text"].includes(normalized)) return "text"
  if (["integer", "number", "decimal", "float"].includes(normalized)) return "number"
  if (["date", "datetime", "date_time"].includes(normalized)) return "date"
  if (["select", "enum", "dropdown", "choice"].includes(normalized)) return "select"
  if (["multi_select", "multiselect", "multi", "array"].includes(normalized)) return "multiSelect"
  if (["boolean", "bool", "checkbox", "switch"].includes(normalized)) return "boolean"
  if (["segmented", "radio", "toggle_group"].includes(normalized)) return "segmented"
  if (["attachment", "attachments", "file", "upload", "document"].includes(normalized)) {
    return "attachmentPlaceholder"
  }

  return undefined
}

function getOptions(field: Record<string, unknown>) {
  const rawOptions = [field.options, field.choices, field.enum].find(Array.isArray)

  if (!Array.isArray(rawOptions)) return []

  return rawOptions.flatMap((option) => {
    if (typeof option === "string" || typeof option === "number" || typeof option === "boolean") {
      const value = String(option)
      return [{ label: value, value }]
    }

    if (!isRecord(option)) return []

    const value = getString(option.value) ?? getString(option.id) ?? getString(option.key)
    const label = getLocalizedString(option.label ?? option.name ?? option.title) ?? value

    return value && label ? [{ label, value }] : []
  })
}

function getValidation(field: Record<string, unknown>) {
  const validation: QuoteFormValidationDescriptor = {
    max: getNumber(field.max ?? field.maximum),
    maxLength: getNumber(field.maxLength ?? field.max_length),
    min: getNumber(field.min ?? field.minimum),
    minLength: getNumber(field.minLength ?? field.min_length),
    pattern: getString(field.pattern),
  }

  const entries = Object.entries(validation).filter(([, value]) => value !== undefined)

  return entries.length > 0
    ? (Object.fromEntries(entries) as QuoteFormValidationDescriptor)
    : undefined
}

function getLocalizedString(value: unknown) {
  if (typeof value === "string") return value.trim() || undefined

  if (!isRecord(value)) return undefined

  if (i18n.language.startsWith("en")) {
    return (
      getString(value.en) ??
      getString(value.de) ??
      getString(value.label) ??
      getString(value.name) ??
      getString(value.title)
    )
  }

  return (
    getString(value.de) ??
    getString(value.en) ??
    getString(value.label) ??
    getString(value.name) ??
    getString(value.title)
  )
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value)
}
