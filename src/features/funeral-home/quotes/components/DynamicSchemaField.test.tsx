import { Pressable } from "react-native"
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native"
import { useForm } from "react-hook-form"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { Text } from "@/components/Text"
import type { QuoteFormFieldDescriptor } from "@/domain/requests/quoteFormSchema"
import { ThemeProvider } from "@/theme/context"

import { DynamicSchemaField } from "./DynamicSchemaField"

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useScrollToTop: jest.fn(),
}))

jest.mock("react-native-keyboard-controller", () => {
  const { ScrollView } = require("react-native")

  return {
    KeyboardAwareScrollView: ScrollView,
  }
})

jest.mock("react-native-edge-to-edge", () => ({
  SystemBars: () => null,
}))

jest.mock("react-native-safe-area-context", () =>
  Object.assign({}, jest.requireActual("react-native-safe-area-context"), {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
  }),
)

jest.mock("@/i18n/translate", () => ({
  translate: (key: string, options?: Record<string, unknown>) => {
    const catalog: Record<string, string> = {
      "funeralHome:rfq.errors.unsupportedField":
        "Dieses Feld kann in der App noch nicht angezeigt werden.",
      "funeralHome:rfq.dynamic.attachmentPlaceholder":
        "Dateien können in dieser Version noch nicht hochgeladen werden.",
      "funeralHome:rfq.dynamic.unnamedField": "Zusatzangabe",
      "funeralHome:rfq.dynamic.requiredSuffix": "Pflichtfeld",
      "funeralHome:rfq.validation.required": "Bitte füllen Sie dieses Feld aus.",
      "funeralHome:rfq.validation.number": "Bitte geben Sie eine Zahl ein.",
      "funeralHome:rfq.validation.min": "Der Wert muss mindestens {{min}} sein.",
      "funeralHome:rfq.validation.minLength": "Bitte geben Sie mindestens {{min}} Zeichen ein.",
    }
    return Object.entries(options ?? {}).reduce(
      (text, [name, value]) => text.replace(`{{${name}}}`, String(value)),
      catalog[key] ?? key,
    )
  },
}))

type FormValues = {
  attributes: Record<string, unknown>
}

const baseField = {
  errorKey: "funeralHome:rfq.validation.required",
  id: "field",
  label: "Feld",
  required: false,
  sourcePath: "fields.0",
} satisfies Omit<QuoteFormFieldDescriptor, "type">

function renderField(field: QuoteFormFieldDescriptor) {
  function FieldHarness() {
    const { control } = useForm<FormValues>({
      defaultValues: {
        attributes: {},
      },
    })

    return <DynamicSchemaField control={control} field={field} name={`attributes.${field.id}`} />
  }

  return render(
    <SafeAreaProvider>
      <ThemeProvider>
        <FieldHarness />
      </ThemeProvider>
    </SafeAreaProvider>,
  )
}

function renderFieldWithSubmit(field: QuoteFormFieldDescriptor) {
  const onValid = jest.fn()

  function FieldHarness() {
    const { control, handleSubmit } = useForm<FormValues>({
      defaultValues: {
        attributes: {},
      },
    })

    return (
      <>
        <DynamicSchemaField control={control} field={field} name={`attributes.${field.id}`} />
        <Pressable accessibilityRole="button" onPress={handleSubmit(onValid)}>
          <Text text="Submit" />
        </Pressable>
      </>
    )
  }

  return {
    onValid,
    ...render(
      <SafeAreaProvider>
        <ThemeProvider>
          <FieldHarness />
        </ThemeProvider>
      </SafeAreaProvider>,
    ),
  }
}

describe("DynamicSchemaField", () => {
  test("renders text, number, and date descriptors as editable inputs", () => {
    renderField({ ...baseField, type: "text" })
    expect(screen.getByLabelText("Feld")).toBeTruthy()

    renderField({ ...baseField, id: "count", label: "Anzahl", type: "number" })
    expect(screen.getByLabelText("Anzahl")).toBeTruthy()

    renderField({ ...baseField, id: "date", label: "Datum", type: "date" })
    expect(screen.getByLabelText("Datum")).toBeTruthy()
  })

  test("renders select, multi-select, and segmented options as mobile choices", () => {
    const options = [
      { label: "Schlicht", value: "simple" },
      { label: "Gehoben", value: "premium" },
    ]

    renderField({ ...baseField, options, type: "select" })
    fireEvent.press(screen.getByText("Schlicht"))
    expect(screen.getByText("Gehoben")).toBeTruthy()

    renderField({ ...baseField, id: "addons", label: "Extras", options, type: "multiSelect" })
    fireEvent.press(screen.getByText("Schlicht"))
    expect(screen.getByText("Extras")).toBeTruthy()

    renderField({ ...baseField, id: "mode", label: "Modus", options, type: "segmented" })
    fireEvent.press(screen.getByText("Gehoben"))
    expect(screen.getByText("Modus")).toBeTruthy()
  })

  test("renders boolean, attachment placeholder, and unsupported fallback states", () => {
    renderField({ ...baseField, label: "Eilt", type: "boolean" })
    expect(screen.getByText("Eilt")).toBeTruthy()

    renderField({ ...baseField, id: "attachment", label: "Anhang", type: "attachmentPlaceholder" })
    expect(
      screen.getByText("Dateien können in dieser Version noch nicht hochgeladen werden."),
    ).toBeTruthy()

    renderField({
      ...baseField,
      errorKey: "funeralHome:rfq.errors.unsupportedField",
      id: "matrix",
      label: "Matrix",
      type: "unsupported",
    })
    expect(
      screen.getByText("Dieses Feld kann in der App noch nicht angezeigt werden."),
    ).toBeTruthy()
  })

  test("enforces validation metadata for text and number descriptors", async () => {
    const textField = renderFieldWithSubmit({
      ...baseField,
      required: true,
      type: "text",
      validation: { minLength: 5 },
    })
    fireEvent.changeText(screen.getByLabelText("Feld"), "abc")
    fireEvent.press(screen.getByText("Submit"))

    await waitFor(() => {
      expect(screen.getByText("Bitte geben Sie mindestens 5 Zeichen ein.")).toBeTruthy()
    })
    expect(textField.onValid).not.toHaveBeenCalled()

    textField.unmount()
    const numberField = renderFieldWithSubmit({
      ...baseField,
      id: "count",
      label: "Anzahl",
      type: "number",
      validation: { min: 2 },
    })
    fireEvent.changeText(screen.getByLabelText("Anzahl"), "abc")
    fireEvent.press(screen.getByText("Submit"))

    await waitFor(() => {
      expect(screen.getByText("Bitte geben Sie eine Zahl ein.")).toBeTruthy()
    })
    expect(numberField.onValid).not.toHaveBeenCalled()
  })

  test("blocks submit when a required unsupported field cannot be captured", async () => {
    const result = renderFieldWithSubmit({
      ...baseField,
      errorKey: "funeralHome:rfq.errors.unsupportedField",
      required: true,
      type: "unsupported",
    })

    fireEvent.press(screen.getByText("Submit"))

    await waitFor(() => {
      expect(result.onValid).not.toHaveBeenCalled()
    })
  })
})
