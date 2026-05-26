import { Pressable, TextStyle, View, ViewStyle } from "react-native"
import {
  Controller,
  type Control,
  type FieldError,
  type FieldValues,
  type Path,
} from "react-hook-form"

import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { Switch } from "@/components/Toggle/Switch"
import type {
  QuoteFormFieldDescriptor,
  QuoteFormOptionDescriptor,
} from "@/domain/requests/quoteFormSchema"
import { translate } from "@/i18n/translate"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type DynamicSchemaFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  field: QuoteFormFieldDescriptor
  name: Path<TFieldValues>
}

export function DynamicSchemaField<TFieldValues extends FieldValues>({
  control,
  field,
  name,
}: DynamicSchemaFieldProps<TFieldValues>) {
  const { themed } = useAppTheme()
  const label = field.label ?? translate("funeralHome:rfq.dynamic.unnamedField")

  if (field.type === "unsupported") {
    if (field.required) {
      return (
        <Controller<TFieldValues>
          control={control}
          defaultValue={"" as never}
          name={name}
          rules={{
            validate: () => translate(field.errorKey),
          }}
          render={({ fieldState }) => (
            <FallbackPanel
              helper={fieldState.error?.message ?? translate(field.errorKey)}
              label={label}
              status={fieldState.error ? "error" : undefined}
            />
          )}
        />
      )
    }

    return <FallbackPanel helper={translate(field.errorKey)} label={label} />
  }

  if (field.type === "attachmentPlaceholder") {
    return (
      <View style={themed($fallbackPanel)}>
        <Text text={label} preset="formLabel" />
        <Text
          text={translate("funeralHome:rfq.dynamic.attachmentPlaceholder")}
          preset="formHelper"
          style={themed($mutedText)}
        />
      </View>
    )
  }

  return (
    <Controller<TFieldValues>
      control={control}
      defaultValue={getDefaultValue(field) as never}
      name={name}
      rules={{
        validate: (value) => validateField(field, value),
      }}
      render={({ field: controllerField, fieldState }) => {
        const error = fieldState.error

        if (field.type === "boolean") {
          return (
            <Switch
              accessibilityLabel={label}
              helper={buildHelper(field, error)}
              label={label}
              onValueChange={controllerField.onChange}
              status={error ? "error" : undefined}
              value={!!controllerField.value}
            />
          )
        }

        if (field.type === "select" || field.type === "segmented") {
          return (
            <OptionGroup
              error={error}
              field={field}
              label={label}
              onChange={controllerField.onChange}
              selectedValue={typeof controllerField.value === "string" ? controllerField.value : ""}
            />
          )
        }

        if (field.type === "multiSelect") {
          const selectedValues = Array.isArray(controllerField.value)
            ? controllerField.value.map(String)
            : []

          return (
            <OptionGroup
              error={error}
              field={field}
              label={label}
              multi
              onChange={(value) => {
                const nextValues = selectedValues.includes(value)
                  ? selectedValues.filter((item: string) => item !== value)
                  : [...selectedValues, value]
                controllerField.onChange(nextValues)
              }}
              selectedValues={selectedValues}
            />
          )
        }

        return (
          <TextField
            accessibilityLabel={label}
            helper={buildHelper(field, error)}
            keyboardType={field.type === "number" ? "numeric" : "default"}
            label={label}
            multiline={field.type === "text"}
            onBlur={controllerField.onBlur}
            onChangeText={controllerField.onChange}
            ref={controllerField.ref}
            status={error ? "error" : undefined}
            value={toInputValue(controllerField.value)}
          />
        )
      }}
    />
  )
}

function FallbackPanel({
  helper,
  label,
  status,
}: {
  helper: string
  label: string
  status?: "error"
}) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($fallbackPanel)}>
      <Text text={label} preset="formLabel" />
      <Text
        text={helper}
        preset="formHelper"
        style={themed(status === "error" ? $errorText : $mutedText)}
      />
    </View>
  )
}

function OptionGroup({
  error,
  field,
  label,
  multi,
  onChange,
  selectedValue,
  selectedValues = [],
}: {
  error?: FieldError
  field: QuoteFormFieldDescriptor
  label: string
  multi?: boolean
  onChange: (value: string) => void
  selectedValue?: string
  selectedValues?: string[]
}) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($fieldGroup)}>
      <Text text={label} preset="formLabel" />
      <View style={themed($optionWrap)}>
        {(field.options ?? []).map((option) => {
          const selected = multi
            ? selectedValues.includes(option.value)
            : selectedValue === option.value

          return (
            <OptionButton
              key={option.value}
              onPress={() => onChange(option.value)}
              option={option}
              selected={selected}
            />
          )
        })}
      </View>
      <Text
        text={buildHelper(field, error)}
        preset="formHelper"
        style={themed(error ? $errorText : $mutedText)}
      />
    </View>
  )
}

function OptionButton({
  onPress,
  option,
  selected,
}: {
  onPress: () => void
  option: QuoteFormOptionDescriptor
  selected: boolean
}) {
  const { themed } = useAppTheme()

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={themed(selected ? $optionSelected : $option)}
    >
      <Text
        text={option.label}
        preset="formHelper"
        style={themed(selected ? $optionSelectedText : $optionText)}
      />
    </Pressable>
  )
}

function getDefaultValue(field: QuoteFormFieldDescriptor) {
  if (field.defaultValue !== undefined) return field.defaultValue
  if (field.type === "boolean") return false
  if (field.type === "multiSelect") return []
  return ""
}

function validateField(field: QuoteFormFieldDescriptor, value: unknown) {
  const requiredResult = validateRequired(field, value)
  if (requiredResult !== true) return requiredResult

  const validation = field.validation
  if (!validation) return true

  if (field.type === "number") {
    const text = toInputValue(value).trim()
    if (!text) return true

    const parsedValue = Number(text)
    if (!Number.isFinite(parsedValue)) return translate("funeralHome:rfq.validation.number")
    if (validation.min !== undefined && parsedValue < validation.min) {
      return translate("funeralHome:rfq.validation.min", { min: validation.min })
    }
    if (validation.max !== undefined && parsedValue > validation.max) {
      return translate("funeralHome:rfq.validation.max", { max: validation.max })
    }
  }

  if (typeof value === "string") {
    const text = value.trim()
    if (!text) return true

    if (validation.minLength !== undefined && text.length < validation.minLength) {
      return translate("funeralHome:rfq.validation.minLength", { min: validation.minLength })
    }
    if (validation.maxLength !== undefined && text.length > validation.maxLength) {
      return translate("funeralHome:rfq.validation.maxLength", { max: validation.maxLength })
    }
    if (validation.pattern) {
      try {
        if (!new RegExp(validation.pattern).test(text)) {
          return translate("funeralHome:rfq.validation.pattern")
        }
      } catch {
        return true
      }
    }
  }

  return true
}

function validateRequired(field: QuoteFormFieldDescriptor, value: unknown) {
  if (!field.required) return true
  if (Array.isArray(value)) return value.length > 0 || translate(field.errorKey)
  if (typeof value === "boolean") return value || translate(field.errorKey)
  if (typeof value === "number") return Number.isFinite(value) || translate(field.errorKey)
  if (typeof value === "string") return value.trim().length > 0 || translate(field.errorKey)

  return value != null || translate(field.errorKey)
}

function buildHelper(field: QuoteFormFieldDescriptor, error?: FieldError) {
  if (error?.message) return error.message

  const requiredSuffix = field.required
    ? translate("funeralHome:rfq.dynamic.requiredSuffix")
    : undefined

  return [field.helper, requiredSuffix].filter(Boolean).join(" · ")
}

function toInputValue(value: unknown) {
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)

  return ""
}

const $fieldGroup: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $optionWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
})

const $option: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: 6,
  borderWidth: 1,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $optionSelected: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surfaceWarm,
  borderColor: colors.primary,
  borderRadius: 6,
  borderWidth: 1,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $optionText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $optionSelectedText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.primary,
})

const $fallbackPanel: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surfaceWarm,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  gap: spacing.xs,
  padding: spacing.md,
})

const $mutedText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
})
