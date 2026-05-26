import i18n from "i18next"

import { normalizeQuoteFormSchema, type QuoteFormFieldDescriptor } from "./quoteFormSchema"

describe("normalizeQuoteFormSchema", () => {
  beforeEach(() => {
    i18n.language = "de"
  })

  test("maps supported backend fields to app-owned descriptors", () => {
    const normalized = normalizeQuoteFormSchema({
      fields: [
        {
          key: "serviceNotes",
          label: { de: "Hinweise", en: "Notes" },
          type: "textarea",
          helper: "Kurzer Hinweis für den Lieferanten",
          required: true,
          minLength: 5,
          defaultValue: "Vor Ort abstimmen",
        },
        {
          name: "pieceCount",
          label: "Stückzahl",
          type: "number",
          minimum: 1,
          maximum: 50,
        },
        {
          name: "deliveryDate",
          label: "Lieferdatum",
          type: "date",
        },
        {
          name: "variant",
          label: "Variante",
          type: "select",
          options: [
            { value: "simple", label: "Schlicht" },
            { value: "premium", label: { de: "Gehoben", en: "Premium" } },
          ],
        },
        {
          name: "addons",
          label: "Zusatzleistungen",
          type: "multi_select",
          options: ["Schleife", "Karte"],
        },
        {
          name: "urgent",
          label: "Eilt",
          type: "boolean",
          defaultValue: false,
        },
        {
          name: "deliveryMode",
          label: "Übergabe",
          type: "segmented",
          options: [
            { value: "pickup", label: "Abholung" },
            { value: "delivery", label: "Lieferung" },
          ],
        },
        {
          name: "referenceFile",
          label: "Referenz",
          type: "file",
        },
      ],
    })

    expect(normalized.status).toBe("ready")
    expect(normalized.fields).toMatchObject([
      {
        id: "serviceNotes",
        type: "text",
        label: "Hinweise",
        helper: "Kurzer Hinweis für den Lieferanten",
        required: true,
        defaultValue: "Vor Ort abstimmen",
        validation: { minLength: 5 },
        sourcePath: "fields.0",
      },
      {
        id: "pieceCount",
        type: "number",
        label: "Stückzahl",
        validation: { min: 1, max: 50 },
      },
      { id: "deliveryDate", type: "date" },
      {
        id: "variant",
        type: "select",
        options: [
          { label: "Schlicht", value: "simple" },
          { label: "Gehoben", value: "premium" },
        ],
      },
      {
        id: "addons",
        type: "multiSelect",
        options: [
          { label: "Schleife", value: "Schleife" },
          { label: "Karte", value: "Karte" },
        ],
      },
      { id: "urgent", type: "boolean", defaultValue: false },
      { id: "deliveryMode", type: "segmented" },
      { id: "referenceFile", type: "attachmentPlaceholder" },
    ] satisfies Partial<QuoteFormFieldDescriptor>[])
  })

  test("supports JSON-schema-like properties with required metadata", () => {
    const normalized = normalizeQuoteFormSchema({
      type: "object",
      required: ["material"],
      properties: {
        material: {
          title: "Material",
          type: "string",
          enum: ["Eiche", "Buche"],
          default: "Eiche",
        },
      },
    })

    expect(normalized).toMatchObject({
      status: "ready",
      fields: [
        {
          id: "material",
          type: "select",
          label: "Material",
          required: true,
          defaultValue: "Eiche",
          options: [
            { label: "Eiche", value: "Eiche" },
            { label: "Buche", value: "Buche" },
          ],
        },
      ],
    })
  })

  test("returns an empty ready schema for empty or absent category schema", () => {
    expect(normalizeQuoteFormSchema({})).toEqual({
      fields: [],
      status: "ready",
      warnings: [],
    })
    expect(normalizeQuoteFormSchema(null)).toEqual({
      fields: [],
      status: "ready",
      warnings: [],
    })
  })

  test("normalizes unsupported and incomplete fields without throwing", () => {
    const normalized = normalizeQuoteFormSchema({
      fields: [
        { name: "backendPayload", type: "matrix", label: "Interne Matrix" },
        "malformed-field",
        { type: "text", label: "Ohne Kennung" },
        { name: "missingOptions", type: "select", label: "Auswahl" },
      ],
    })

    expect(normalized.status).toBe("ready")
    expect(normalized.fields).toMatchObject([
      {
        id: "backendPayload",
        type: "unsupported",
        label: "Interne Matrix",
        unsupportedType: "matrix",
        errorKey: "funeralHome:rfq.errors.unsupportedField",
      },
      {
        id: "field-1",
        type: "unsupported",
        errorKey: "funeralHome:rfq.errors.unsupportedField",
      },
      {
        id: "field-2",
        type: "unsupported",
        label: "Ohne Kennung",
        errorKey: "funeralHome:rfq.errors.unsupportedField",
      },
      {
        id: "missingOptions",
        type: "unsupported",
        label: "Auswahl",
        errorKey: "funeralHome:rfq.errors.unsupportedField",
      },
    ])
    expect(normalized.warnings).toEqual([
      "fields.0.unsupportedType",
      "fields.1.malformedField",
      "fields.2.missingId",
      "fields.3.missingOptions",
    ])
  })

  test("uses the active locale for dynamic labels and option labels", () => {
    i18n.language = "en"

    const normalized = normalizeQuoteFormSchema({
      fields: [
        {
          name: "variant",
          label: { de: "Variante", en: "Variant" },
          type: "select",
          options: [{ value: "premium", label: { de: "Gehoben", en: "Premium" } }],
        },
      ],
    })

    expect(normalized.fields).toMatchObject([
      {
        id: "variant",
        label: "Variant",
        options: [{ label: "Premium", value: "premium" }],
      },
    ])
  })

  test("returns a localized schema failure for malformed root values", () => {
    expect(normalizeQuoteFormSchema("not-json-like")).toEqual({
      fields: [],
      messageKey: "funeralHome:rfq.errors.schemaInvalid",
      status: "invalid",
      warnings: ["schema.invalidRoot"],
    })
  })
})
