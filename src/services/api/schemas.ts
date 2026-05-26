import { z } from "zod"

const recordSchema = z.record(z.string(), z.unknown())
const optionalNullableString = z.string().nullable().optional()
const nonEmptyString = z.string().trim().min(1)
const isoDateTimeString = z.string().datetime({ offset: true })
const dateOnlyString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(isValidDateOnly)
const positiveAmount = z.number().finite().positive()

export const userRoleSchema = z.enum([
  "FUNERAL_HOME_USER",
  "SUPPLIER_USER",
  "ADMIN",
  "SUPER_ADMIN",
  "SUPPORT",
  "OPERATOR",
])
const timelineActorRoleSchema = z.union([userRoleSchema, z.literal("SYSTEM")])

export const userStatusSchema = z.enum(["PENDING", "ACTIVE", "SUSPENDED"])
export const accountStatusSchema = z.enum([
  "PENDING_REVIEW",
  "PENDING_APPROVAL",
  "ACTIVE",
  "SUSPENDED",
  "CLOSED",
])
export const verificationStatusSchema = z.enum(["UNVERIFIED", "VERIFIED", "FAILED", "STALE"])
export const quoteRequestStatusSchema = z.enum([
  "DRAFT",
  "SENT",
  "RESPONDED",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
])
export const quoteResponseStatusSchema = z.enum(["SENT", "ACCEPTED", "REJECTED"])
export const emailDispatchStatusSchema = z.enum([
  "QUEUED",
  "SENT",
  "DELIVERED",
  "BOUNCED",
  "COMPLAINED",
])

export const addressSchema = z.object({
  street: z.string(),
  zip: z.string().regex(/^\d{5}$/),
  city: z.string(),
  country: z.literal("DE"),
})

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  issues: z.unknown().optional(),
})

export const backendErrorEnvelopeSchema = z.object({
  error: apiErrorSchema,
})

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  deviceId: z.string().optional(),
  deviceLabel: z.string().optional(),
})

export const refreshSessionInputSchema = z.object({
  refreshToken: nonEmptyString,
})

export const logoutInputSchema = z.object({
  refreshToken: nonEmptyString,
})

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: userRoleSchema,
  tenantId: z.string().nullable().optional(),
  accountStatus: accountStatusSchema.optional(),
  verificationStatus: verificationStatusSchema.optional(),
  userStatus: userStatusSchema.optional(),
})

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.literal("Bearer"),
  expiresInSeconds: z.number(),
  refreshExpiresInSeconds: z.number(),
  user: authUserSchema,
})

export const currentUserSchema = authUserSchema.extend({
  permissions: z.array(z.string()),
})

export const categorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  nameDe: z.string(),
  nameEn: z.string(),
  parentId: z.string().nullable(),
  icon: z.string().nullable(),
  quoteFormSchema: recordSchema,
  isActive: z.boolean(),
})

export const supplierSchema = z.object({
  id: z.string(),
  legalName: nonEmptyString,
  tradingName: z.string().trim(),
  hrCourt: optionalNullableString,
  hrType: optionalNullableString,
  hrNumber: optionalNullableString,
  vatId: optionalNullableString,
  address: addressSchema,
  phone: z.string(),
  contactEmail: z.string().email(),
  publicDescription: z.string().nullable(),
  logoUrl: z.string().nullable(),
  categoryIds: z.array(z.string()),
  regionsServed: z.array(z.string()),
  languages: z.array(z.string()),
  certifications: z.array(z.string()),
  accountStatus: accountStatusSchema,
  subscriptionTier: z.string(),
  billingEmail: z.string().email(),
  createdAt: z.string(),
})

export const supplierItemSchema = z.object({
  id: z.string(),
  supplierId: z.string(),
  categoryId: z.string(),
  sku: z.string(),
  name: z.string(),
  description: z.string(),
  unitPrice: z.number(),
  currency: z.literal("EUR"),
  images: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
})

export const documentAssetSchema = z.object({
  id: z.string(),
  ownerType: z.string(),
  ownerId: z.string(),
  kind: z.string(),
  fileName: z.string(),
  contentType: z.string(),
  storageKey: z.string(),
  url: z.string(),
  byteLength: z.number(),
  checksum: z.string(),
  createdAt: z.string(),
})

export const emailDispatchSchema = z.object({
  id: z.string().optional(),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.string().optional(),
  toAddress: z.string().email().optional(),
  templateId: z.string().optional(),
  providerMessageId: z.string().nullable().optional(),
  status: emailDispatchStatusSchema,
  sentAt: z.string().nullable().optional(),
  deliveredAt: z.string().nullable().optional(),
  lastEventAt: z.string().nullable().optional(),
})

export const quoteRequestSchema = z.object({
  id: z.string(),
  funeralHomeId: z.string(),
  supplierId: z.string(),
  categoryId: z.string(),
  subject: z.string(),
  message: z.string(),
  deadline: z.string(),
  attributes: recordSchema,
  attachments: z.array(documentAssetSchema),
  status: quoteRequestStatusSchema,
  createdAt: z.string(),
  emailDispatch: emailDispatchSchema.nullable().optional(),
  sentAt: z.string().nullable(),
  respondedAt: z.string().nullable(),
})

export const quoteResponseSchema = z.object({
  id: z.string(),
  quoteRequestId: z.string(),
  supplierId: z.string(),
  priceAmount: z.number(),
  priceCurrency: z.literal("EUR"),
  priceIsRange: z.boolean(),
  priceMax: z.number().nullable(),
  validityUntil: z.string(),
  leadTimeDays: z.number(),
  message: z.string(),
  attachments: z.array(documentAssetSchema),
  status: quoteResponseStatusSchema,
  sentAt: z.string(),
})

export const requestTimelineEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string(),
  occurredAt: z.string(),
  status: z.enum(["DONE", "PENDING", "FAILED"]),
  actorRole: timelineActorRoleSchema,
  relatedEntityType: z.string(),
  relatedEntityId: z.string(),
})

export const funeralHomeSignupInputSchema = z.object({
  legalName: z.string(),
  tradingName: z.string(),
  hrCourt: optionalNullableString,
  hrType: optionalNullableString,
  hrNumber: optionalNullableString,
  vatId: optionalNullableString,
  address: addressSchema,
  phone: z.string(),
  contactEmail: z.string().email(),
  billingEmail: z.string().email(),
  password: z.string().min(12),
})

export const funeralHomeSignupResultSchema = z.object({
  accountStatus: accountStatusSchema,
  funeralHomeId: z.string(),
  tradingName: z.string(),
  userStatus: userStatusSchema,
})

const attachmentInputSchema = recordSchema

export const createQuoteRequestInputSchema = z.object({
  supplierId: nonEmptyString,
  categoryId: nonEmptyString,
  subject: nonEmptyString,
  message: nonEmptyString,
  deadline: dateOnlyString,
  attributes: recordSchema.default({}),
  attachments: z.array(attachmentInputSchema).default([]),
})

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

export const createQuoteResponseInputSchema = z
  .object({
    quoteRequestId: nonEmptyString,
    priceAmount: positiveAmount,
    priceIsRange: z.boolean().default(false),
    priceMax: positiveAmount.nullable().default(null),
    validityUntil: isoDateTimeString,
    leadTimeDays: z.number().int().nonnegative(),
    message: nonEmptyString,
    attachments: z.array(attachmentInputSchema).default([]),
  })
  .superRefine((input, context) => {
    if (input.priceIsRange && input.priceMax === null) {
      context.addIssue({
        code: "custom",
        path: ["priceMax"],
        message: "priceMax is required when priceIsRange is true",
      })
    }

    if (input.priceMax !== null && input.priceMax <= input.priceAmount) {
      context.addIssue({
        code: "custom",
        path: ["priceMax"],
        message: "priceMax must be greater than priceAmount",
      })
    }
  })

export const quoteResponseDecisionInputSchema = z.object({
  decision: z.enum(["ACCEPTED", "REJECTED"]),
})

export const pathIdSchema = nonEmptyString

export const quoteRequestListItemSchema = quoteRequestSchema.omit({ attachments: true }).extend({
  attachments: z.array(documentAssetSchema).default([]),
  documents: z.array(documentAssetSchema).default([]),
  timeline: z.array(requestTimelineEventSchema).optional(),
  category: categorySchema.optional(),
  responses: z.array(quoteResponseSchema).optional(),
  supplier: supplierSchema.optional(),
  funeralHome: recordSchema.optional(),
  response: quoteResponseSchema.nullable().optional(),
})

export const logoutResultSchema = z.object({
  revoked: z.literal(true),
})

export const logoutAllResultSchema = z.object({
  revokedCount: z.number(),
})
