# Story 2.4: Dynamic RFQ Form Renderer

Status: done

<!-- Completion note: Story draft prepared for dev-story execution after Story 2.3 defines the RFQ entry route/context handoff. Do not treat this as implementation evidence. -->

## Story

As a funeral-home user,
I want category-specific RFQ fields to appear as familiar mobile form controls,
so that I can submit complete structured requests without understanding backend schemas.

Out of scope: checkout, payment, order placement, cart, purchase, chat, supplier self-registration, hosted conversation threads, RFQ backend submission, receipt, and request-history timeline behavior.

## Acceptance Criteria

1. Given a user starts an RFQ from a supplier or category, when the RFQ form opens, then it captures universal fields including subject, message, deadline, attachments placeholder, quantity where applicable, supplier context, and category context.
2. Given a category provides `quoteFormSchema`, when the schema is loaded, then supported fields are normalized into mobile controls for text, number, date, select, multi-select, boolean, segmented option, and attachment placeholder, and raw schema concepts are not shown directly to users.
3. Given category and schema API fixtures exist, when valid, empty, unsupported-field, malformed, unauthorized, and network failure fixtures are mapped, then the form renderer consumes normalized field descriptors and localized error keys rather than backend-specific schema details.
4. Given the schema contains an unsupported field type, when the form renderer encounters it, then the app shows a controlled localized unsupported-field message, and the form does not crash.
5. Given required fields are incomplete or invalid, when the user advances steps or submits, then validation appears inline near the field and remains visible until fixed, and entered data is preserved across validation failures.
6. Given the keyboard is open or the user jumps to an error, when form interactions occur, then primary actions remain reachable without overlapping the keyboard, safe areas, or bottom navigation, and scroll-to-error behavior focuses the relevant field where practical.
7. Given tests run, when universal fields, supported schema controls, unsupported fields, validation errors, and preserved form state are exercised, then RFQ renderer behavior is verified.

## Tasks/Subtasks

- [x] Confirm the RFQ entry route contract from Story 2.3 before implementation starts. (AC: 1)
  - [x] Use the Story 2.3 handoff as the source of truth for `supplierId`, `categoryId`, and optional `categorySlug` query params.
  - [x] Expected candidate route: `/funeral-home/quotes/new?supplierId=...&categoryId=...`.
  - [x] If `src/app/(funeral-home)/funeral-home/quotes.tsx` still exists, coordinate route ownership before adding `quotes/new.tsx`; only one implementation story should refactor the Quotes tab into a folder route.
  - [x] Preserve the current protected funeral-home gate in `src/app/(funeral-home)/_layout.tsx`; do not duplicate token/session checks in the route file.
  - [x] Block missing, invalid, inactive, or unauthorized supplier/category context with localized recovery copy instead of opening an incomplete form.

- [x] Add category/schema loading for the RFQ form context. (AC: 1-4)
  - [x] Reuse the existing `categoriesApi.listCategories()` boundary and `useCategoriesQuery()` pattern to resolve the selected category by `categoryId`.
  - [x] Reuse the supplier detail context from Story 2.3 where available; if direct refresh loses supplier data, fetch through the confirmed `suppliersApi.getSupplier()` from Story 2.3.
  - [x] Do not expose `quoteFormSchema`, raw ids, slugs, or backend field names as primary visible copy.
  - [x] Handle category missing/not-found, inactive category, malformed schema, unauthorized/access-denied, network, timeout, and server failures as localized recoverable states.

- [x] Add dynamic schema normalization as a domain boundary. (AC: 2-4, 7)
  - [x] Add a module such as `src/domain/requests/quoteFormSchema.ts` to convert backend `QuoteFormSchemaDto`/`CategoryDto.quoteFormSchema` into app-owned field descriptors.
  - [x] Suggested descriptor fields: stable `id`, user-safe `label`, optional `helper`, `type`, `required`, `defaultValue`, `options`, validation constraints, source path for API attribute mapping, and localized error keys.
  - [x] Supported descriptor types: `text`, `number`, `date`, `select`, `multiSelect`, `boolean`, `segmented`, and `attachmentPlaceholder`.
  - [x] Unsupported or malformed field entries must normalize to either an `unsupported` descriptor or a schema-level localized failure; they must never throw during render.
  - [x] Preserve the raw schema only inside tests/debug-safe data structures. Do not log PII, user-entered RFQ text, supplier contact data, or raw request attributes.
  - [x] Add focused tests for valid schemas, empty schemas, unsupported types, malformed schema objects, missing labels/options, required flags, default values, and validation metadata.

- [x] Introduce the guided RFQ form screen without submitting to the backend. (AC: 1, 5, 6)
  - [x] Add an RFQ creation screen under `src/features/funeral-home/quotes`, for example `RfqFormScreen.tsx`.
  - [x] Add a thin Expo Router file only after the route contract is confirmed, for example `src/app/(funeral-home)/funeral-home/quotes/new.tsx`.
  - [x] Capture universal fields: subject, message, deadline, attachments placeholder, quantity where applicable, supplier context, and category context.
  - [x] Store category-specific answers in an `attributes` object shaped for `CreateQuoteRequestInputDto.attributes`, but do not call `quoteRequestsApi.createQuoteRequest()` in this story.
  - [x] Provide a "continue to review" handoff only as a controlled placeholder or disabled/protected route until Story 2.5 implements review and send.
  - [x] Use request language such as `Angebot anfragen` / `Anfrage vorbereiten`; avoid checkout, cart, order, purchase, payment, booking, chat, or consumer-shopping language.

- [x] Use React Hook Form for form state if it has not already been added. (AC: 5-7)
  - [x] The architecture requires React Hook Form for guided RFQ forms, but `package.json` currently does not include it. Add the dependency only during approved implementation and commit the lockfile.
  - [x] Keep validation behavior app-owned and testable. Zod is already installed and should continue to guard API/form boundaries where useful.
  - [x] Preserve user-entered data across validation failures, step changes, schema-render fallback states, and route param refresh where safe.
  - [x] Do not persist draft RFQs to MMKV in this story unless explicitly approved; draft persistence is not defined in the current acceptance criteria.

- [x] Build reusable form components close to the RFQ feature. (AC: 2, 4-7)
  - [x] Add a `DynamicSchemaField` component under `src/features/funeral-home/quotes/components` or `src/features/requests/components` only if clear reuse with supplier quote-response forms exists.
  - [x] Compose existing Ignite/project primitives first: `Screen`, `Text`, `TextField`, `Button`, `Card`, `Checkbox`, `Switch`, `Radio`, `Icon`, and theme tokens.
  - [x] Add small local controls for segmented options, select, and multi-select only if existing primitives are insufficient; do not add a third-party UI kit.
  - [x] Attachment handling is placeholder-only. Render a disabled or explanatory upload placeholder until the backend upload contract is confirmed.
  - [x] Every input must expose localized labels, helper text where needed, required state, validation error text, and accessibility labels.

- [x] Add German-first and English localization for every visible string. (AC: 1-7)
  - [x] Add `funeralHome.rfq.*` or `requests.rfq.*` keys for route title, context summary, universal fields, dynamic-field labels/fallbacks, unsupported-field messages, validation errors, loading/error/empty states, attachment placeholder, continue/review placeholder, and accessibility labels.
  - [x] Keep German copy calm, operational, and compact enough for small phones.
  - [x] Update non-primary locale forwarding only if TypeScript translation shape requires it.

- [x] Add focused tests and implementation quality gates. (AC: 1-7)
  - [x] Add schema-normalizer unit tests.
  - [x] Add dynamic field component tests for every supported descriptor type and unsupported fallback.
  - [x] Add RFQ form screen tests for context loading, universal fields, dynamic fields, required validation, preserved state, malformed schema, missing category/supplier context, network/API failures, keyboard-safe action area assumptions, and handoff to the Story 2.5 placeholder/review route.
  - [x] Run focused tests, `pnpm compile`, `pnpm test --runInBand`, `pnpm lint:check`, `pnpm depcruise`, and `git diff --check` when implementation is approved.
  - [x] Use Argent simulator/emulator verification during implementation because this story affects runtime behavior, navigation, screens, form input, API-derived schema behavior, and visible UI.

### Review Findings

- [x] [Review][Patch] Missing-context recovery action renders a dead button [src/features/funeral-home/quotes/RfqFormScreen.tsx:70]
- [x] [Review][Patch] Supplier detail can start RFQ without a resolved category id [src/features/funeral-home/discovery/SupplierDetailScreen.tsx:91]
- [x] [Review][Patch] JSON Schema enum fields with `type: "string"` render as free text [src/domain/requests/quoteFormSchema.ts:233]
- [x] [Review][Patch] Malformed primitive field entries are silently dropped [src/domain/requests/quoteFormSchema.ts:104]
- [x] [Review][Patch] Dynamic validation metadata is normalized but not enforced [src/features/funeral-home/quotes/components/DynamicSchemaField.tsx:62]
- [x] [Review][Patch] Required unsupported schema fields can be bypassed [src/features/funeral-home/quotes/components/DynamicSchemaField.tsx:35]
- [x] [Review][Patch] Dynamic localized labels always prefer German [src/domain/requests/quoteFormSchema.ts:309]
- [x] [Review][Patch] Scroll-to-error/focus behavior is not implemented [src/features/funeral-home/quotes/RfqFormScreen.tsx:220]

## Dev Notes

### Current Source State

- Story 2.1 is done and introduced TanStack Query v5, `src/services/query`, `QueryProvider`, `useCategoriesQuery`, `CategoryTile`, and real funeral-home home/category discovery.
- `QueryProvider` clears query cache and remounts children when authenticated user/tenant scope changes. RFQ context queries must use this provider so supplier/category data cannot bleed across tenants.
- `src/services/query/queryKeys.ts` currently only has category keys. RFQ-specific context keys should be added there rather than using ad hoc arrays.
- `src/services/api/categoriesApi.ts` calls `GET /api/mobile/categories` and validates `CategoryDto[]`.
- `src/services/api/schemas.ts` defines `categorySchema.quoteFormSchema` as `z.record(z.string(), z.unknown())`; there is no app-owned normalized schema descriptor yet.
- `src/services/api/types.ts` exports `QuoteFormSchemaDto = Record<string, unknown>` and `QuoteRequestAttributesDto = Record<string, unknown>`.
- `src/services/api/quoteRequestsApi.ts` already has `createQuoteRequest(input, client, idempotencyKey?)`, but Story 2.4 must not submit. Story 2.5 owns review and send.
- `createQuoteRequestInputSchema` requires `supplierId`, `categoryId`, `subject`, `message`, `deadline`, `attributes`, and `attachments`; it currently does not include a top-level `quantity` field. Quantity should map into `attributes` unless the backend contract changes.
- `src/app/(funeral-home)/funeral-home/quotes.tsx` currently renders a placeholder. Adding `/quotes/new` requires converting that route to a folder route unless another story has already done it.
- Story 2.2 drafts supplier discovery and Story 2.3 drafts supplier detail. Story 2.4 execution depends on Story 2.3's RFQ CTA and route/context handoff.
- Story 2.6 may also refactor the Quotes route for history/detail. If 2.4 and 2.6 are executed in parallel, route ownership must be coordinated before code changes.
- `src/app/(funeral-home)/_layout.tsx` already fails closed for signed-out, booting/offline, wrong-role, pending/suspended/unknown, and restricted sessions. Preserve it.
- `src/app/_layout.tsx` already wraps the app in `SafeAreaProvider`, `ThemeProvider`, `KeyboardProvider`, `SessionProvider`, `QueryProvider`, and `SessionGate`.
- `react-native-keyboard-controller` is installed and wraps the app. Use existing `Screen`/keyboard-aware behavior before adding new keyboard dependencies.
- `react-hook-form` is not currently installed in `package.json`, even though the architecture requires it for guided RFQ/signup/response forms.

### Story 2.3 Handoff Assumptions

- Execution recommendation: prepare now, execute after Story 2.3 establishes supplier detail and the RFQ entry context. If Story 2.6 is executed in parallel, assign one owner for the `quotes` route refactor before code changes begin.
- Story 2.3 should create or confirm `suppliersApi.getSupplier(supplierId)`, supplier detail query keys/hooks, and a supplier detail route.
- Story 2.3 should route active/requestable suppliers to the RFQ form with `supplierId` and `categoryId` preserved.
- Preferred handoff route is `/funeral-home/quotes/new?supplierId=...&categoryId=...`, but this is a route ownership decision that must be confirmed before Story 2.4 implementation.
- If Story 2.3 only provides a controlled placeholder because Story 2.4 is not yet implemented, Story 2.4 should replace that placeholder with the form screen and keep the same URL contract.

### Backend/API Contract Assumptions and Blockers

- Blocker: The exact `quoteFormSchema` shape is not documented in source. Implementation must normalize defensively from JSON-like backend data and add fixture coverage before rendering dynamic fields.
- Blocker: Attachment upload contract is not confirmed. This story must render attachment placeholders only; actual upload belongs to a later confirmed contract.
- Blocker: Top-level quantity is mentioned in planning artifacts but not present in `CreateQuoteRequestInputDto`. Treat quantity as a category/universal form value mapped into `attributes` until backend confirms another field.
- Blocker: Backend/category schemas may contain labels, option labels, validation rules, or enum names that are not localized. The app must not show raw backend keys as polished copy; use safe labels, fallbacks, and localization where possible.
- Dependency: Story 2.5 owns review, submission, idempotency, receipt, and backend `quoteRequestsApi.createQuoteRequest()` mutation.
- Dependency: Story 2.7 owns suspended funeral-home read-only mode. This story should still avoid letting any blocked account enter RFQ creation under the current route gate.

### What This Story Changes

- Adds the RFQ creation form renderer entry screen.
- Adds dynamic `quoteFormSchema` normalization into mobile-safe field descriptors.
- Adds universal RFQ form fields and dynamic category-specific controls.
- Adds inline validation and unsupported-field fallback behavior.
- Adds localized form copy and component tests for schema-driven behavior.

### What Must Be Preserved

- Route files stay thin. Business logic belongs in feature modules, hooks, API modules, or domain helpers.
- Protected funeral-home data and business actions remain behind existing role/account/session gates.
- API modules own endpoint paths, DTO validation, backend parameter names, and normalized failures.
- Screens and hooks must not call apisauce directly or inspect raw response objects.
- Session/token material remains behind `src/services/session`; no screen reads MMKV or decodes tokens.
- All visible strings, error messages, helper text, accessibility labels, and button labels come from i18n.
- German is the layout stress case.
- Brand red is for primary decisions/active moments, not generic error/warning/success states.
- No ecommerce, checkout, cart, order, purchase, payment, chat, consumer-family, supplier self-registration, or admin/back-office language.
- Do not edit native `ios/` or `android/` files for this story.
- Do not create hard-coded category-specific RFQ screens.

## Architecture Guardrails

- Use feature-oriented placement:
  - Route: `src/app/(funeral-home)/funeral-home/quotes/new.tsx` only after route ownership is confirmed.
  - Screen: `src/features/funeral-home/quotes/RfqFormScreen.tsx`.
  - Components: `src/features/funeral-home/quotes/components/DynamicSchemaField.tsx`, `GuidedFormStepper.tsx`, and local option controls as needed.
  - Hooks: `src/features/funeral-home/quotes/hooks/useRfqFormContextQuery.ts` or equivalent.
  - Domain: `src/domain/requests/quoteFormSchema.ts` for schema normalization and validation metadata.
  - Query keys: `src/services/query/queryKeys.ts`.
  - API: reuse `categoriesApi`, Story 2.3 `suppliersApi.getSupplier`, and existing `quoteRequestsApi` types without submitting.
- Keep normalized descriptors app-owned. The renderer should not branch directly on arbitrary backend schema objects in JSX.
- Prefer React Hook Form plus existing Ignite controls for guided form state. Add dependency only during approved implementation.
- Use Zod for boundary validation where helpful, but do not force Zod schemas to mirror unknown backend schema internals before the contract is confirmed.
- Keep form layout step-based or sectioned. Avoid a single dense wall of dynamic fields on small phones.
- Primary action stays reachable above keyboard/safe area/bottom tabs. Use the existing `KeyboardProvider`, `Screen` presets, and scroll behavior before adding dependencies.
- Preserve form values on validation failure and while navigating between form sections. Do not persist drafts to storage unless explicitly added to scope.
- Use local display helpers for supplier/category context summaries. Do not show raw supplier/category ids to users.
- Unsupported fields are a controlled UI state, not an exception path.
- Attachment controls are placeholders until upload/document contracts are confirmed.
- Do not introduce Redux/Zustand, a new UI kit, generated OpenAPI clients, or native changes for this story.

## Expected File Changes

Likely NEW files:

```text
src/app/(funeral-home)/funeral-home/quotes/new.tsx
src/features/funeral-home/quotes/RfqFormScreen.tsx
src/features/funeral-home/quotes/RfqFormScreen.test.tsx
src/features/funeral-home/quotes/components/DynamicSchemaField.tsx
src/features/funeral-home/quotes/components/DynamicSchemaField.test.tsx
src/features/funeral-home/quotes/components/GuidedFormStepper.tsx
src/features/funeral-home/quotes/hooks/useRfqFormContextQuery.ts
src/features/funeral-home/quotes/hooks/useRfqFormContextQuery.test.tsx
src/domain/requests/quoteFormSchema.ts
src/domain/requests/quoteFormSchema.test.ts
```

Likely UPDATE files:

```text
src/app/(funeral-home)/funeral-home/quotes.tsx
src/app/(funeral-home)/funeral-home/quotes/index.tsx
src/services/query/queryKeys.ts
src/services/query/queryKeys.test.ts
src/i18n/de.ts
src/i18n/en.ts
src/i18n/ar.ts
src/i18n/es.ts
src/i18n/fr.ts
src/i18n/hi.ts
src/i18n/ja.ts
src/i18n/ko.ts
package.json
pnpm-lock.yaml
```

Conditional UPDATE files depending on Story 2.3 output:

```text
src/services/api/suppliersApi.ts
src/services/api/schemas.ts
src/services/api/types.ts
src/features/funeral-home/discovery/SupplierDetailScreen.tsx
src/features/funeral-home/discovery/hooks/useSupplierDetailQuery.ts
```

Do not update these for Story 2.4 unless a confirmed dependency requires it:

```text
src/services/session/**
src/domain/account/accountAccess.ts
src/services/api/quoteRequestsApi.ts
ios/**
android/**
```

## Test/Argent Verification Expectations

- Unit/domain:
  - Schema normalizer maps valid backend schema fixtures to supported descriptors.
  - Empty schema yields no dynamic fields and the universal form remains usable.
  - Unsupported field types produce controlled unsupported descriptors/messages.
  - Malformed schema objects produce localized failures or unsupported descriptors without throwing.
  - Required/default/options/validation metadata are preserved in app-owned descriptors.

- Component/form:
  - Universal fields render with localized labels, helpers, required states, and validation errors.
  - Text, number, date, select, multi-select, boolean, segmented, and attachment-placeholder descriptors render as familiar mobile controls.
  - Unsupported fields show localized explanatory copy and do not block unrelated supported fields unless required business data cannot be captured.
  - Required/invalid fields show inline errors near the field and keep entered values after failed advance.
  - Supplier/category context summary renders without raw ids.
  - Missing supplier/category, inactive category, malformed schema, auth/access-denied, network/server, and retry states are covered.
  - Continue/review action is disabled or routes only to a controlled Story 2.5 placeholder until review/send exists.

- Quality commands when implemented:
  - `pnpm compile`
  - Focused Jest tests for schema normalizer, dynamic field components, context hook, and RFQ form screen
  - `pnpm test --runInBand`
  - `pnpm lint:check`
  - `pnpm depcruise`
  - `git diff --check`

- Argent runtime verification is required during implementation because this story changes runtime behavior, navigation, forms, API-derived schema behavior, keyboard behavior, and visible UI:
  - Active funeral-home session starts RFQ from the Story 2.3 supplier detail CTA.
  - RFQ form opens with supplier and category context preserved.
  - Universal fields accept input and keep values after validation errors.
  - Supported dynamic field controls render and accept values.
  - Unsupported/malformed schema states show localized fallback and do not crash.
  - Keyboard-open state keeps primary actions reachable without bottom-tab/safe-area overlap.
  - Compact German labels and validation copy do not overlap form controls.
  - Missing/invalid category or supplier context shows safe recovery.
  - No checkout/order/payment/cart/chat/supplier-self-registration language appears.
  - Do not claim simulator/emulator verification unless Argent was actually used in the implementation workflow.

## References

- [Source: `_bmad-output/planning-artifacts/epics.md` - Epic 2, Story 2.4 acceptance criteria]
- [Source: `_bmad-output/planning-artifacts/prd.md` - UJ-3, FR15, FR16, FR17, FR18, FR19, FR37, FR38, FR40, NFR1, NFR7, NFR15, NFR16, NFR20]
- [Source: `_bmad-output/planning-artifacts/architecture.md` - Data Architecture, Frontend Architecture, API & Communication Patterns, Process Patterns, RFQ Creation and History, Pattern Examples]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` - Guided Anfrage, Dynamic Schema Field, Guided Form Stepper, Form Patterns, Accessibility, keyboard/safe-area guidance]
- [Source: `_bmad-output/implementation-artifacts/2-1-funeral-home-home-and-category-discovery-baseline.md` - category/query/session-scope foundation and Argent verification learnings]
- [Source: `_bmad-output/implementation-artifacts/2-2-supplier-search-filters-and-supplier-cards.md` - supplier discovery/category filter handoff assumptions]
- [Source: `_bmad-output/implementation-artifacts/2-3-supplier-detail-and-rfq-entry-points.md` - RFQ CTA and supplier/category context handoff assumptions]
- [Source: `_bmad-output/implementation-artifacts/2-6-outgoing-request-history-detail-and-timeline.md` - Quotes route ownership conflict and history/detail scope boundary]
- [Source: `src/app/(funeral-home)/_layout.tsx` - protected funeral-home route gate]
- [Source: `src/app/(funeral-home)/funeral-home/quotes.tsx` and `src/features/funeral-home/FuneralHomeQuotesPlaceholderScreen.tsx` - current Quotes placeholder route]
- [Source: `src/app/_layout.tsx` - app providers including `KeyboardProvider`, `SessionProvider`, `QueryProvider`, and `SessionGate`]
- [Source: `src/features/funeral-home/FuneralHomeHomeScreen.tsx` and `src/features/funeral-home/hooks/useCategoriesQuery.ts` - category query and navigation patterns]
- [Source: `src/services/api/categoriesApi.ts`, `src/services/api/suppliersApi.ts`, `src/services/api/quoteRequestsApi.ts`, `src/services/api/schemas.ts`, `src/services/api/types.ts`, `src/services/api/apiResult.ts` - API boundaries and DTOs]
- [Source: `src/services/query/QueryProvider.tsx`, `src/services/query/queryKeys.ts` - query provider/session-scope behavior and centralized key pattern]
- [Source: `src/domain/account/accountAccess.ts` - current fail-closed account/role behavior]
- [Source: `src/i18n/de.ts`, `src/i18n/en.ts`, `src/components/TextField.tsx`, `src/components/Button.tsx`, `src/components/Toggle/*`, `src/theme/colors.ts`, `src/theme/spacing.ts` - localization, form primitives, and theme patterns]

## Dev Agent Record

### Implementation Plan

- Confirmed Story 2.3 RFQ handoff and converted the Quotes tab route into a folder route with `/funeral-home/quotes/new`.
- Added an app-owned schema normalization boundary before rendering any backend-provided field definitions.
- Built the guided RFQ form with React Hook Form, existing project primitives, localized copy, guarded context loading, inline validation, and a Story 2.5 review placeholder.
- Covered schema normalization, query context mapping, dynamic field rendering, screen behavior, route tab hiding, and supplier-detail RFQ navigation with focused tests before running full validation.

### Debug Log

- 2026-05-26: Added `react-hook-form` dependency and lockfile update because the story explicitly requires React Hook Form for guided RFQ forms.
- 2026-05-26: Initial folder-route conversion exposed `quotes/new` and `quotes/index` as duplicate bottom tabs in Argent; fixed by configuring the tab as `quotes/index` and hiding `quotes/new`.
- 2026-05-26: Updated `_bmad-output/implementation-artifacts/backend-gaps.md` with implemented Story 2.4 workarounds and verification limits for schema shape, attachments, and quantity.

### Completion Notes

- Implemented `/funeral-home/quotes/new?supplierId=...&categoryId=...` with protected-route ownership preserved in the existing funeral-home layout.
- Added RFQ context loading through `categoriesApi.listCategories()` and `suppliersApi.getSupplier()`, with localized safe states for missing context, missing/inactive category, inactive supplier, context mismatch, malformed schema, and normalized API failures.
- Added `quoteFormSchema` normalization into app-owned descriptors for text, number, date, select, multi-select, boolean, segmented, attachment placeholder, and unsupported fields.
- Added a German-first RFQ form screen that captures subject, message, deadline, optional quantity, supplier/category context, dynamic attributes, attachment placeholder copy, inline validation, preserved form state, and a non-submitting review placeholder.
- Argent verified the active supplier-detail CTA into the RFQ form, context preservation, universal field entry, dynamic field entry, validation persistence, review placeholder, missing-context recovery, fixed tab shape, and German copy without checkout/order/payment/cart/chat language. Live backend data did not include unsupported or malformed schema fields, so those states are verified by focused tests and documented as backend-contract-limited.

### File List

- `_bmad-output/implementation-artifacts/2-4-dynamic-rfq-form-renderer.md`
- `_bmad-output/implementation-artifacts/backend-gaps.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `package.json`
- `pnpm-lock.yaml`
- `src/app/(funeral-home)/funeral-home/quotes.tsx` (deleted)
- `src/app/(funeral-home)/funeral-home/quotes/index.tsx`
- `src/app/(funeral-home)/funeral-home/quotes/new.tsx`
- `src/domain/requests/quoteFormSchema.test.ts`
- `src/domain/requests/quoteFormSchema.ts`
- `src/features/funeral-home/discovery/SupplierDetailScreen.test.tsx`
- `src/features/funeral-home/discovery/SupplierDetailScreen.tsx`
- `src/features/funeral-home/quotes/RfqFormScreen.test.tsx`
- `src/features/funeral-home/quotes/RfqFormScreen.tsx`
- `src/features/funeral-home/quotes/components/DynamicSchemaField.test.tsx`
- `src/features/funeral-home/quotes/components/DynamicSchemaField.tsx`
- `src/features/funeral-home/quotes/hooks/useRfqFormContextQuery.test.tsx`
- `src/features/funeral-home/quotes/hooks/useRfqFormContextQuery.ts`
- `src/i18n/de.ts`
- `src/i18n/en.ts`
- `src/navigation/RoleTabs.tsx`
- `src/navigation/roleTabs.test.tsx`
- `src/services/query/queryKeys.test.ts`
- `src/services/query/queryKeys.ts`

### Change Log

- 2026-05-26: Implemented Story 2.4 dynamic RFQ form renderer, route, schema normalization, localized form UI, tests, and Argent verification; moved story to review.
