# Story 2.5: RFQ Review and Send Receipt

Status: done

<!-- Completion note: Ultimate context engine analysis completed - comprehensive developer guide created. -->

## Story

As a funeral-home user,
I want to review my quote request before sending it,
so that I can confirm the recipient, details, and next step before the supplier is notified.

Out of scope: checkout, payment, order placement, cart, purchase, chat, supplier self-registration, hosted conversation threads, request history/detail/timeline implementation, real attachment upload, and supplier quote-response behavior.

## Acceptance Criteria

1. Given the user completes RFQ form steps, when the review screen renders, then it shows a Review Summary Block with supplier, category, universal fields, category-specific details, deadline, attachments placeholder, language/status metadata, and edit links.
2. Given the user chooses to edit a section, when they return from editing, then the review screen reflects updated values, and previously entered valid data remains intact.
3. Given the user submits the RFQ, when the backend quote-request endpoint succeeds, then the app shows a Submission Receipt with reference id when available, timestamp, saved state, email-dispatch explanation, and next actions.
4. Given quote-request API fixtures exist, when success, validation failure, unauthorized, forbidden/suspended, expired category/supplier, dispatch warning, and network failure fixtures are mapped, then `quoteRequestsApi` owns request payload mapping, response DTO mapping, problem mapping, and localized message keys.
5. Given email dispatch status is queued, sent, failed, or unavailable, when the receipt renders, then the dispatch state is communicated with localized text and semantic status, and the app does not imply chat or in-app conversation hosting.
6. Given RFQ submission fails due to validation, network, auth, or backend error, when the failure is mapped, then the user receives recoverable localized feedback, and completed form data remains available for correction or retry.
7. Given tests run, when review, edit, submit success, email-dispatch variants, and submit failures are exercised, then the RFQ send flow and receipt behavior are verified.

## Tasks / Subtasks

- [x] Replace the Story 2.4 review placeholder with a real review step. (AC: 1, 2, 7)
  - [x] Extend the existing RFQ entry route `src/app/(funeral-home)/funeral-home/quotes/new.tsx`; do not create a parallel RFQ route.
  - [x] Keep `src/app/(funeral-home)/funeral-home/quotes/new.tsx` thin. It should continue to read query params and render the feature screen only.
  - [x] Update `src/features/funeral-home/quotes/RfqFormScreen.tsx` or extract a close feature component such as `RfqReviewStep.tsx`; keep the same React Hook Form instance so edits preserve entered values.
  - [x] Replace `reviewReady` and the `reviewPlaceholderTitle` / `reviewPlaceholderBody` notice with an actual review mode after successful validation.
  - [x] Use `form.getValues()` or equivalent React Hook Form state reads for review data; do not duplicate form state into a second source of truth.
  - [x] Add edit links for request basics, category fields, and attachments placeholder that return to the relevant section or form mode without resetting valid data.
  - [x] Show supplier display name, category display name, subject, message, deadline, optional quantity, dynamic attribute labels/values, attachment placeholder state, and language/status metadata.
  - [x] Do not show raw supplier IDs, category IDs, backend schema source paths, raw field keys, or raw enum names as primary user copy.

- [x] Add review and receipt domain UI close to the RFQ feature. (AC: 1, 3, 5, 7)
  - [x] Add `ReviewSummaryBlock` under `src/features/funeral-home/quotes/components` unless immediate reuse with signup or supplier response is implemented in the same change.
  - [x] Add `SubmissionReceipt` under `src/features/requests/components` only if it is deliberately shared with later signup/response receipts; otherwise keep it inside `src/features/funeral-home/quotes/components`.
  - [x] Compose existing Ignite/project primitives first: `Screen`, `Text`, `Button`, `Card`, `ListItem` where suitable, `Icon`, and theme tokens.
  - [x] Use receipt tone, not celebration tone. The receipt should say the request was saved, identify the reference when available, show timestamp, explain email dispatch state, and give next actions.
  - [x] Receipt next actions should be practical: view request history/Quotes tab if available, start another supplier search, or return to Discover. Do not add request detail navigation unless Story 2.6 has implemented the route.
  - [x] Status meaning must include localized text and accessibility labels, not color alone.

- [x] Submit RFQs through the existing API boundary and mutation pattern. (AC: 3, 4, 6, 7)
  - [x] Reuse `quoteRequestsApi.createQuoteRequest()` in `src/services/api/quoteRequestsApi.ts`; screens/components must not call apisauce directly.
  - [x] Build the payload from the validated form and context: `supplierId`, `categoryId`, `subject`, `message`, `deadline`, `attributes`, and `attachments: []`.
  - [x] Submit the UI date value as the backend date-only `YYYY-MM-DD` format after strict calendar-date validation.
  - [x] Keep optional quantity in `attributes.quantity` until the backend confirms a first-class quantity field.
  - [x] Keep real attachments out of scope. Submit an empty attachment array or only the confirmed placeholder-safe shape; do not invent an upload contract.
  - [x] Use a single idempotency key per prepared submission attempt and keep it stable across retry of the same draft. Regenerate only after a successful submit or after the user materially edits the prepared request.
  - [x] Use TanStack Query `useMutation` from a feature hook such as `useCreateQuoteRequestMutation()`. On success, invalidate outgoing request list/history keys through `queryClient.invalidateQueries()` when those keys exist.
  - [x] Disable duplicate sends while pending. Keep the review data visible and editable after failures.

- [x] Tighten quote-request API response and failure mapping for receipt needs. (AC: 3-6, 7)
  - [x] Add focused tests for `quoteRequestsApi.createQuoteRequest()` success, invalid input, validation failure, unauthorized, access-denied/forbidden, not-found/expired supplier or category, network, timeout, server, malformed envelope, and malformed success data.
  - [x] Review the existing `{ forbiddenMeansAuth: true }` option on `createQuoteRequest()`. Story 2.5 needs forbidden/suspended submission failures to remain distinguishable from auth failures, so map 403 to `access-denied` unless backend error code proves the session itself is invalid.
  - [x] If the backend returns email dispatch data with create response, add it to `quoteRequestSchema`/`QuoteRequestDto` through Zod and types. If it does not, the receipt must show dispatch as unavailable/unknown with localized copy rather than faking queued or sent.
  - [x] Map backend email dispatch statuses through a domain helper. Candidate display mapping: `QUEUED` as pending/warning, `SENT` and `DELIVERED` as sent/success, `BOUNCED` and `COMPLAINED` as failed/danger, missing as unavailable/neutral.
  - [x] Keep backend DTO names at the API boundary. Convert only in explicit mappers/helpers if app display models differ.
  - [x] Do not log PII, RFQ message text, supplier contact data, token/session material, or raw request attributes during submission failures.

- [x] Add German-first and English localization for review, send, receipt, and failure states. (AC: 1-7)
  - [x] Add or replace `funeralHome.rfq.review.*`, `funeralHome.rfq.receipt.*`, `funeralHome.rfq.submit.*`, and dispatch/status keys in `src/i18n/de.ts` and `src/i18n/en.ts`.
  - [x] Update non-primary locale forwarding only if the typed translation shape requires it.
  - [x] Keep German copy compact enough for small phones. Use `Anfrage`, `Angebot anfragen`, `Pruefen`, `Senden`, `Gespeichert`, `E-Mail-Benachrichtigung`, and `Verlauf` style language.
  - [x] Avoid checkout, order, cart, purchase, payment, booking, chat, conversation, consumer-family, supplier self-registration, and admin/back-office language.
  - [x] Include accessibility labels for edit actions, send action, pending send state, receipt status, dispatch status, and next actions.

- [x] Preserve route gates, tenant boundaries, and Story 2.4 behavior. (AC: 1-7)
  - [x] Preserve the protected funeral-home route gate in `src/app/(funeral-home)/_layout.tsx`; do not duplicate token/session checks in RFQ components.
  - [x] Preserve `useRfqFormContextQuery()` checks for missing context, inactive category, inactive supplier, and supplier/category mismatch.
  - [x] Preserve required unsupported-field blocking from `DynamicSchemaField`; a required field that cannot be captured must not be bypassed at review/send.
  - [x] Preserve form values across validation errors, review edit loops, submission failures, and retry.
  - [x] Keep Story 2.6 request-history/detail scope out of this story except for optional query invalidation and receipt next-action routing to the Quotes tab.

- [x] Add focused tests and required verification commands. (AC: 1-7)
  - [x] Add or extend `RfqFormScreen.test.tsx` for review summary rendering, edit link return, updated review values, preserved form state, submit pending state, success receipt, duplicate-submit prevention, and recoverable failures.
  - [x] Add component tests for `ReviewSummaryBlock` and `SubmissionReceipt` if extracted.
  - [x] Add API tests for create quote request payload validation, idempotency header, response DTO validation, and failure mapping.
  - [x] Add domain tests for email dispatch display mapping if dispatch helpers are added.
  - [x] Run `pnpm compile`.
  - [x] Run focused Jest tests for RFQ form/review/receipt/API behavior.
  - [x] Run `pnpm test --runInBand`.
  - [x] Run `pnpm lint:check`.
  - [x] Run `pnpm depcruise`.
  - [x] Run `git diff --check`.
  - [x] Use Argent simulator/emulator verification because this story affects runtime behavior, navigation, form state, API submission, receipt UI, and visible localized copy.

### Review Findings

- [x] [Review][Decision] Required Argent success receipt verification is not complete — resolved by aligning mobile to the running backend date-only `YYYY-MM-DD` create contract and verifying a live success receipt in Argent on 2026-05-26.
- [x] [Review][Patch] Invalid calendar dates can be silently normalized before submit [src/features/funeral-home/quotes/RfqFormScreen.tsx:239]
- [x] [Review][Patch] Whitespace-only subject/message can reach review and then fail API validation [src/features/funeral-home/quotes/RfqFormScreen.tsx:203]
- [x] [Review][Patch] Unexpected mutation throws can permanently block retry [src/features/funeral-home/quotes/RfqFormScreen.tsx:160]
- [x] [Review][Patch] Successful saved requests can look failed if email dispatch data is partial or redacted [src/services/api/schemas.ts:162]
- [x] [Review][Patch] Dynamic number fields submit strings instead of numbers [src/features/funeral-home/quotes/components/DynamicSchemaField.tsx:138]
- [x] [Review][Patch] Expired or suspended create failures are under-mapped for 409/410/structured backend codes [src/services/api/quoteRequestsApi.ts:53]
- [x] [Review][Patch] Invalid create input bypasses RFQ-localized failure mapping [src/services/api/quoteRequestsApi.ts:27]
- [x] [Review][Patch] Optional quantity accepts arbitrary text before submission [src/features/funeral-home/quotes/RfqFormScreen.tsx:261]

## Dev Notes

### Current Source State

- Story 2.4 implementation exists in the current working tree. Treat it as the source to extend, not as an idea to recreate.
- `src/app/(funeral-home)/funeral-home/quotes/new.tsx` already reads `supplierId`, `categoryId`, and optional `categorySlug` from `useLocalSearchParams()` and renders `RfqFormScreen`.
- `src/features/funeral-home/quotes/RfqFormScreen.tsx` currently loads supplier/category/schema context, renders universal fields, dynamic schema fields, attachment placeholders, and a controlled review placeholder.
- `RfqFormScreen` uses React Hook Form with values `{ subject, message, deadline, quantity, attributes }`.
- `composePreparedRequestAttributes()` already maps optional `quantity` into `attributes.quantity`. Preserve this until the backend confirms another payload shape.
- `src/features/funeral-home/quotes/components/DynamicSchemaField.tsx` renders normalized descriptors and blocks required unsupported fields by returning a validation error.
- `src/domain/requests/quoteFormSchema.ts` normalizes JSON-like backend `quoteFormSchema` data into app-owned field descriptors. JSX must not branch directly on raw backend schema objects.
- `src/features/funeral-home/quotes/hooks/useRfqFormContextQuery.ts` resolves the category through `categoriesApi.listCategories()`, fetches supplier detail through `suppliersApi.getSupplier()`, checks active/category fit, and blocks invalid context before the form opens.
- `src/services/api/quoteRequestsApi.ts` already exposes `createQuoteRequest(input, client, idempotencyKey?)`, `listFuneralHomeRequests()`, and `listSupplierRequests()`.
- `src/services/api/schemas.ts` has `createQuoteRequestInputSchema`, `quoteRequestSchema`, `documentAssetSchema`, and `emailDispatchSchema`, but `quoteRequestSchema` does not currently include email dispatch data.
- `createQuoteRequestInputSchema.deadline` follows the running backend create contract and requires a strict date-only `YYYY-MM-DD` string.
- `src/services/api/apiResult.ts` unwraps backend `{ data }` envelopes and validates through Zod. Keep this behavior.
- `src/services/api/apiProblem.ts` maps generic API failures to localized `messageKey`s. Story 2.5 may need more specific create-RFQ failure keys for forbidden/suspended/expired cases.
- `src/services/query/queryKeys.ts` currently has category, supplier, and RFQ form-context keys. Add request-history/mutation invalidation keys here rather than local ad hoc arrays.
- `src/i18n/de.ts` and `src/i18n/en.ts` contain Story 2.4 RFQ form and review-placeholder copy. Replace/extend these keys for real review/send/receipt behavior.
- Story 2.6 is already drafted as `ready-for-dev` and owns outgoing request history/detail/timeline. Story 2.5 should route receipt next actions to existing safe screens and avoid implementing history/detail scope.

### Previous Story Intelligence

- Story 2.4 deliberately did not submit to the backend. It prepared form state, schema normalization, dynamic controls, validation, and a review placeholder.
- Review findings in Story 2.4 fixed several traps that Story 2.5 must preserve: missing-context recovery, supplier/category context handoff, enum-to-select normalization, malformed primitive fields, dynamic validation enforcement, required unsupported field blocking, localized dynamic labels, and focus on first validation error.
- React Hook Form is now installed in `package.json` as `^7.76.1`; do not add another form library.
- `react-native-keyboard-controller` is already installed and app-wrapped. Keep using existing `Screen` keyboard/safe-area behavior before adding dependencies.
- Attachment upload remains a backend gap. Keep attachment handling placeholder-only.
- The backend quantity contract remains a gap. Keep quantity under `attributes.quantity`.

### Backend / API Contract Assumptions and Blockers

- `POST /api/mobile/quote-requests` is the confirmed create endpoint in planning artifacts and current `quoteRequestsApi`.
- The running backend accepts RFQ `deadline` as date-only `YYYY-MM-DD`; mobile validates that format before review and submits it unchanged.
- The current create response DTO has request id, supplier/category ids, subject, message, deadline, attributes, attachments, status, createdAt, sentAt, and respondedAt.
- The current create response DTO does not include email dispatch metadata even though the AC requires queued/sent/failed/unavailable receipt messaging. This is now tracked in `backend-gaps.md`. Implement unavailable/unknown dispatch copy unless the backend response is extended and tested.
- `emailDispatchSchema` exists, but no quote-request create/list/detail DTO currently references it. Do not infer dispatch state from request status alone.
- The backend may represent suspended/forbidden/expired supplier or category as 403, 404, 409, 410, 422, or a structured backend error code. Keep mapping inside `quoteRequestsApi`/helpers and tests, not screen conditionals.
- Real attachments are blocked until upload endpoint, ownership, MIME/size rules, and quote-request attachment payload shape are confirmed.
- Request detail/history after receipt belongs to Story 2.6. If that route is not implemented yet, the receipt should use a safe fallback next action.

### Architecture Guardrails

- Route files stay thin. Business logic belongs in feature screens, hooks, API modules, or domain helpers.
- API modules own endpoint paths, backend parameter names, DTO validation, problem mapping, and idempotency headers.
- Screens and hooks consume `AppApiResult<T>` or TanStack Query wrappers; they must not inspect apisauce internals.
- Server writes should use TanStack Query mutations. Invalidate related request list/history queries after success.
- Form state belongs to React Hook Form. Do not duplicate the draft in React context, Zustand, Redux, or MMKV.
- Session/token material stays behind `src/services/session` and the existing API client. Do not read MMKV or decode tokens in the RFQ flow.
- Status and dispatch display mapping should return a localized label key, semantic tone, and accessibility label key. Do not hard-code labels in cards/receipts.
- All visible strings, errors, helper text, status labels, and accessibility labels come from i18n. German is the layout stress case.
- Use existing Ignite/project primitives and theme tokens. Do not add a third-party UI kit.
- Brand red is for primary decisions/active moments, not every status. Use semantic success/warning/danger/neutral treatment for receipt and dispatch states.
- Do not edit native `ios/` or `android/` files for this story.

### Latest Technical Notes

- Local dependency state as of 2026-05-26: Expo `55.0.17`, Expo Router `~55.0.4`, React Native `0.83.6`, React `19.2.0`, TanStack Query `^5.100.14`, React Hook Form `^7.76.1`, and Zod `4.2.1`.
- npm latest check on 2026-05-26 showed newer Expo SDK 56 packages and newer React Native/Zod, while TanStack Query and React Hook Form matched the installed latest versions. Do not upgrade framework versions in this story; stay inside the current Expo SDK 55 dependency set unless a separate dependency-alignment task approves it.
- Expo Router docs support reading query parameters with `useLocalSearchParams()` and imperative navigation with `router.push()`/`router.replace()`. Use absolute route paths for navigation and keep route files thin. Source: https://docs.expo.dev/router/basics/navigation/ and https://docs.expo.dev/router/reference/typed-routes/
- TanStack Query v5 docs recommend invalidating related queries in `useMutation` `onSuccess` with `queryClient.invalidateQueries()`. Apply this after successful RFQ creation for outgoing request list/history keys. Source: https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations
- React Hook Form remains the correct form-state library for this guided RFQ. Use `handleSubmit`, `getValues`, `setFocus`, and controlled components through `Controller` as already established. Source: https://www.react-hook-form.com/
- Zod 4 is stable and the source already uses `safeParse()` for input/response validation. Keep create-response and dispatch DTO validation at the API boundary. Source: https://zod.dev/basics and https://zod.dev/v4

### Expected File Changes

Likely NEW files:

```text
src/features/funeral-home/quotes/components/ReviewSummaryBlock.tsx
src/features/funeral-home/quotes/components/ReviewSummaryBlock.test.tsx
src/features/funeral-home/quotes/components/SubmissionReceipt.tsx
src/features/funeral-home/quotes/components/SubmissionReceipt.test.tsx
src/features/funeral-home/quotes/hooks/useCreateQuoteRequestMutation.ts
src/domain/requests/emailDispatchStatusDisplay.ts
src/domain/requests/emailDispatchStatusDisplay.test.ts
src/services/api/quoteRequestsApi.test.ts
```

Likely UPDATE files:

```text
src/features/funeral-home/quotes/RfqFormScreen.tsx
src/features/funeral-home/quotes/RfqFormScreen.test.tsx
src/features/funeral-home/quotes/components/DynamicSchemaField.tsx
src/services/api/quoteRequestsApi.ts
src/services/api/schemas.ts
src/services/api/types.ts
src/services/query/queryKeys.ts
src/services/query/queryKeys.test.ts
src/i18n/de.ts
src/i18n/en.ts
_bmad-output/implementation-artifacts/backend-gaps.md
```

Conditional UPDATE files:

```text
src/app/(funeral-home)/funeral-home/quotes/index.tsx
src/features/funeral-home/FuneralHomeQuotesPlaceholderScreen.tsx
src/features/funeral-home/FuneralHomeQuotesPlaceholderScreen.test.tsx
src/i18n/ar.ts
src/i18n/es.ts
src/i18n/fr.ts
src/i18n/hi.ts
src/i18n/ja.ts
src/i18n/ko.ts
```

Do not update these for Story 2.5 unless a confirmed dependency requires it:

```text
src/services/session/**
src/domain/account/accountAccess.ts
src/services/api/timelineApi.ts
ios/**
android/**
```

### Test / Argent Verification Expectations

- API/unit:
  - `createQuoteRequest()` validates input before network calls.
  - Valid submission posts to `/api/mobile/quote-requests` with the normalized payload and stable idempotency header.
  - Raw `YYYY-MM-DD` deadlines are converted before API input validation.
  - Validation, auth, access-denied/forbidden, expired supplier/category, network, timeout, server, bad-data, and malformed success responses map to normalized results and localized message keys.
  - Email dispatch display helper maps queued, sent/delivered, bounced/complained, and missing/unavailable states to localized labels, semantic tones, and accessibility keys.

- Component/form:
  - Completed RFQ form advances to review instead of submitting immediately.
  - Review summary shows supplier/category context, universal fields, dynamic attributes by user-safe labels, deadline, quantity when present, attachment placeholder state, and no raw IDs/source paths as primary copy.
  - Edit links return to the form and updated values appear in review.
  - Submit button disables while pending and prevents duplicate sends.
  - Success shows receipt with reference id, timestamp, saved state, dispatch status/unavailable state, and next actions.
  - Failures keep completed form data available for correction/retry.
  - Required unsupported fields still block review/send.
  - German and English copy render without overlap on compact layouts.

- Required command checks:
  - `pnpm compile`
  - Focused Jest tests for RFQ review/receipt/API/dispatch mapping
  - `pnpm test --runInBand`
  - `pnpm lint:check`
  - `pnpm depcruise`
  - `git diff --check`

- Argent runtime verification is required during implementation because this story changes runtime behavior, navigation, form state, API submission, receipt UI, and visible localized copy:
  - Active funeral-home session starts an RFQ from supplier detail.
  - RFQ form preserves supplier/category context and accepts universal/dynamic field input.
  - Continue opens review with correct summary and edit links.
  - Submit success shows receipt with saved/reference/timestamp and dispatch unavailable or real dispatch state.
  - Validation/network/backend failures remain recoverable and keep form data.
  - Duplicate send is blocked while pending.
  - Compact German review and receipt layouts avoid overlap and bottom-tab/safe-area collisions.

## References

- [Source: `_bmad-output/planning-artifacts/epics.md` - Epic 2, Story 2.5 acceptance criteria; FR18, FR19; UX-DR23]
- [Source: `_bmad-output/planning-artifacts/prd.md` - UJ-3, FR15-FR20, FR35, FR37, FR38, FR40, API endpoint inventory, NFR9, NFR14-NFR17]
- [Source: `_bmad-output/planning-artifacts/architecture.md` - Decision Priority Analysis, API & Communication Patterns, Frontend Architecture, State Management, Error Handling, Requirements to Structure Mapping]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` - Guided Anfrage flow, Review Summary Block, Submission Receipt, status/receipt tone, German-first layout constraints]
- [Source: `_bmad-output/implementation-artifacts/2-4-dynamic-rfq-form-renderer.md` - previous story implementation notes, review findings, route/schema/form guardrails]
- [Source: `_bmad-output/implementation-artifacts/2-6-outgoing-request-history-detail-and-timeline.md` - future Quotes history/detail ownership and route conflict notes]
- [Source: `_bmad-output/implementation-artifacts/backend-gaps.md` - RFQ schema, attachment upload, quantity, supplier requestability, and dispatch response gaps]
- [Source: `src/app/(funeral-home)/funeral-home/quotes/new.tsx` - current RFQ route param handoff]
- [Source: `src/features/funeral-home/quotes/RfqFormScreen.tsx` - current form state, placeholder review, dynamic field rendering, prepared attributes helper]
- [Source: `src/features/funeral-home/quotes/components/DynamicSchemaField.tsx` - dynamic descriptor rendering and required unsupported-field blocking]
- [Source: `src/features/funeral-home/quotes/hooks/useRfqFormContextQuery.ts` - supplier/category/schema context loading and blocking rules]
- [Source: `src/domain/requests/quoteFormSchema.ts` - app-owned quote form schema normalization]
- [Source: `src/services/api/quoteRequestsApi.ts` - create/list quote request API boundary]
- [Source: `src/services/api/schemas.ts` and `src/services/api/types.ts` - create input, quote request, document, and email dispatch DTOs]
- [Source: `src/services/api/apiResult.ts` and `src/services/api/apiProblem.ts` - normalized API result and problem mapping]
- [Source: `src/services/query/queryKeys.ts` - central query-key placement]
- [Source: `src/i18n/de.ts` and `src/i18n/en.ts` - current RFQ translation structure]
- [Source: Official Expo Router docs - navigation and route/query parameter guidance: https://docs.expo.dev/router/basics/navigation/ and https://docs.expo.dev/router/reference/typed-routes/]
- [Source: Official TanStack Query v5 docs - invalidations from mutations: https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations]
- [Source: Official React Hook Form docs/home - form API and performance model: https://www.react-hook-form.com/]
- [Source: Official Zod docs - Zod 4 stability and `safeParse()` validation: https://zod.dev/basics and https://zod.dev/v4]
- [Source: Repowise `get_answer` for RFQ review/send returned low confidence on 2026-05-26; actual source files above were used as source of truth.]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `pnpm compile` — passed.
- `pnpm jest src/domain/requests/emailDispatchStatusDisplay.test.ts src/services/api/quoteRequestsApi.test.ts src/features/funeral-home/quotes/RfqFormScreen.test.tsx src/features/funeral-home/quotes/components/ReviewSummaryBlock.test.tsx src/features/funeral-home/quotes/components/SubmissionReceipt.test.tsx src/services/query/queryKeys.test.ts --runInBand` — passed, 36 tests.
- `pnpm test --runInBand` — passed, 39 suites / 249 tests.
- `pnpm lint:check` — passed.
- `pnpm depcruise` — passed, no dependency violations.
- `git diff --check` — passed.
- Argent iOS verification on iPhone 16 Pro — backend running on port `3000`, Metro reloaded, RFQ route opened with seeded active supplier/category, review summary rendered with `2026-06-10`, and live submit succeeded with `POST /api/mobile/quote-requests` 200 and receipt `quote-1`.

### Completion Notes List

- Replaced the Story 2.4 RFQ review placeholder with a real review mode driven by the existing React Hook Form instance.
- Added review summary and receipt components with localized German/English copy, semantic dispatch status messaging, accessibility labels, and practical next actions.
- Added create-RFQ mutation handling with a stable idempotency key per prepared draft, duplicate-send protection, outgoing request-list invalidation, and recoverable failure display.
- Tightened quote-request API behavior for create submissions: localized failure mapping, 403 as access denied, optional `emailDispatch` DTO parsing, and focused API coverage for malformed and failure responses.
- Patched code review findings: backend date-only deadline payload, strict date validation, whitespace text validation, quantity validation, dynamic number normalization, mutation exception retry recovery, partial dispatch parsing, and 409/410/structured expired-context mapping.
- Preserved route/session gates, RFQ context validation, required unsupported-field blocking, attachment placeholder-only behavior, and quantity mapping under `attributes.quantity`.
- Resolved the Story 2.5 deadline date-vs-datetime gap by aligning mobile with the backend date-only format; email dispatch metadata remains a backend gap.

### File List

- `_bmad-output/implementation-artifacts/2-5-rfq-review-and-send-receipt.md`
- `_bmad-output/implementation-artifacts/backend-gaps.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/domain/requests/emailDispatchStatusDisplay.test.ts`
- `src/domain/requests/emailDispatchStatusDisplay.ts`
- `src/features/funeral-home/quotes/RfqFormScreen.test.tsx`
- `src/features/funeral-home/quotes/RfqFormScreen.tsx`
- `src/features/funeral-home/quotes/components/ReviewSummaryBlock.test.tsx`
- `src/features/funeral-home/quotes/components/ReviewSummaryBlock.tsx`
- `src/features/funeral-home/quotes/components/SubmissionReceipt.test.tsx`
- `src/features/funeral-home/quotes/components/SubmissionReceipt.tsx`
- `src/features/funeral-home/quotes/hooks/useCreateQuoteRequestMutation.ts`
- `src/i18n/de.ts`
- `src/i18n/en.ts`
- `src/services/api/apiResult.test.ts`
- `src/services/api/quoteRequestsApi.test.ts`
- `src/services/api/quoteRequestsApi.ts`
- `src/services/api/schemas.ts`
- `src/services/query/queryKeys.test.ts`
- `src/services/query/queryKeys.ts`

### Change Log

- 2026-05-26: Implemented RFQ review, send, receipt UI, API mapping, localization, focused tests, required validation, and Argent verification notes.
- 2026-05-26: Resolved code review findings, aligned create deadline payload to backend `YYYY-MM-DD`, reran full validation, and completed live Argent success receipt verification.
