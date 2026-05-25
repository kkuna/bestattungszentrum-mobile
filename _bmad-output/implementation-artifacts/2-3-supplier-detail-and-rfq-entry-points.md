# Story 2.3: Supplier Detail and RFQ Entry Points

Status: done

<!-- Completion note: Story draft prepared for dev-story execution after Story 2.2. Do not treat this as implementation evidence. -->

## Story

As a funeral-home user,
I want to inspect a supplier before requesting a quote,
so that I can verify category fit, region coverage, contact transparency, and trust signals.

## Acceptance Criteria

1. Given a supplier card is selected, when the supplier detail screen opens, then it shows supplier metadata, category badges, regions, languages, verification state, description, contact transparency, and request CTA, and unavailable or deactivated supplier states are clearly labeled.
2. Given supplier detail API fixtures exist, when success, not-found, unavailable, unauthorized, and network failure fixtures are mapped, then supplier detail screens receive normalized domain data or normalized failures without inspecting raw apisauce responses.
3. Given a supplier is active and requestable, when the user taps the RFQ CTA, then the app starts the RFQ flow with supplier and category context preserved, and the CTA uses request language such as `Angebot anfragen` or localized equivalent, not checkout/order language.
4. Given a supplier is deactivated, unavailable, or the user is suspended, when the detail screen renders, then RFQ creation is blocked before form entry, and the user sees a localized explanation with a safe next action.
5. Given supplier detail data fails to load, when the request fails, then the screen shows a recoverable localized error state with retry, and no stale supplier details are shown as current.
6. Given detail-screen tests run, when active, unavailable, suspended, loading, error, and RFQ entry states are exercised, then supplier detail behavior and navigation are verified.

## Tasks / Subtasks

- [x] Confirm and extend the supplier API boundary for detail reads. (AC: 1, 2, 5)
  - [x] Add or confirm `suppliersApi.getSupplier(supplierId)` in `src/services/api/suppliersApi.ts`.
  - [x] Validate the path id with `pathIdSchema` before URL construction and encode ids with `encodeURIComponent`.
  - [x] Keep response validation on `supplierSchema` and return `AppApiResult<SupplierDto>`.
  - [x] Preserve `suppliersApi.listSuppliers()` ownership of search parameter mapping from Story 2.2; do not move query-param translation into screens.
  - [x] Add fixtures/tests for success, `404` not found, unavailable/deactivated supplier representation, unauthorized/forbidden, network failure, and malformed data.
- [x] Add centralized query keys and a supplier-detail query hook. (AC: 2, 5, 6)
  - [x] Extend `src/services/query/queryKeys.ts` with supplier list/detail keys, reusing the existing central pattern from Story 2.1.
  - [x] Add a feature hook such as `src/features/funeral-home/discovery/hooks/useSupplierDetailQuery.ts`.
  - [x] Throw or surface normalized `ApiFailure` values from the hook; UI must not inspect apisauce responses.
  - [x] Disable detail query execution when the route param is missing or invalid and render a localized not-found/recovery state.
- [x] Add the supplier detail route and keep Expo Router files thin. (AC: 1, 3, 5)
  - [x] Add the actual route under the current implemented route shape, for example `src/app/(funeral-home)/funeral-home/discover/[supplierId].tsx`.
  - [x] The route file should only parse route params enough to pass them to the feature screen.
  - [x] Keep the existing protected funeral-home gate in `src/app/(funeral-home)/_layout.tsx`; do not duplicate token/session checks inside the detail screen.
  - [x] Ensure Story 2.2 supplier cards navigate to `/funeral-home/discover/[supplierId]` and pass the current category context as `categoryId` or another stable query param.
- [x] Build the supplier detail screen and domain components. (AC: 1, 3-5)
  - [x] Place implementation under `src/features/funeral-home/discovery`, for example `SupplierDetailScreen.tsx`, `components/SupplierDetailHeader.tsx`, and local display helpers.
  - [x] Compose existing Ignite/project primitives (`Screen`, `Text`, `Button`, `Card`, `EmptyState`, `Icon`) and existing theme tokens.
  - [x] Show supplier identity from `tradingName` with `legalName` as supporting/legal context where useful.
  - [x] Show logo only when `logoUrl` is safe and available; otherwise render a stable fallback mark.
  - [x] Show address transparency at an appropriate granularity, regions served, categories, languages, certifications, public description, verification/account status, and public contact fields that the backend intentionally exposes.
  - [x] Do not expose `billingEmail`, subscription tier, raw ids, schema JSON, internal backend names, or any field that is not meant as public supplier detail.
  - [x] Map missing optional fields to calm localized fallback copy instead of blank modules.
  - [x] Use localized category display names by joining `SupplierDto.categoryIds` to category data from `categoriesApi.listCategories()` when available; fall back to a localized generic category label if category names cannot be resolved.
- [x] Implement requestability and blocked RFQ entry behavior. (AC: 3, 4)
  - [x] Treat suppliers as requestable only when backend/domain state says they are active and available. Until a dedicated requestability flag exists, use a conservative local check such as `accountStatus === "ACTIVE"` plus any Story 2.2 availability model.
  - [x] If supplier requestability is unknown, block form entry and show a localized explanation rather than allowing a broken RFQ route.
  - [x] Check the current session/account state via existing session/account helpers; suspended, pending, wrong-role, or unknown account states must not enter RFQ creation.
  - [x] For active and requestable suppliers, route to the future RFQ flow with supplier and category context preserved, preferably `/funeral-home/quotes/new?supplierId=...&categoryId=...`.
  - [x] If Story 2.4 has not implemented the RFQ form route yet, route only to a controlled placeholder or disabled state that clearly states request creation is not ready. Do not silently no-op.
  - [x] CTA copy must be `Angebot anfragen` or equivalent request language. Do not use checkout, cart, order, purchase, payment, booking, chat, or consumer-shopping language.
- [x] Add German-first and English localization. (AC: 1, 3-6)
  - [x] Update `src/i18n/de.ts` and `src/i18n/en.ts` for detail title/sections, metadata labels, status labels, loading, empty/not-found, error/retry, blocked CTA explanations, RFQ CTA, and accessibility labels.
  - [x] Keep non-primary locale files compiling by forwarding the English namespace if the current i18n typing requires it.
  - [x] Prefer calm operational German. Compact labels are acceptable when needed to prevent mobile overflow.
- [x] Add focused component, hook, API, and navigation tests. (AC: 1-6)
  - [x] Extend `src/services/api/apiResult.test.ts` or add `suppliersApi.test.ts` for supplier detail endpoint behavior and problem mapping.
  - [x] Add query key/hook tests for supplier detail query success, normalized failure, disabled invalid-id behavior, and retry.
  - [x] Add `SupplierDetailScreen.test.tsx` for loading, active detail, missing optional fields, unavailable/deactivated, suspended/blocked RFQ CTA, API error/retry, not-found, and RFQ-entry navigation.
  - [x] Reuse existing test wrapper patterns from `FuneralHomeHomeScreen.test.tsx`: `SafeAreaProvider`, `ThemeProvider`, mocked router, i18n catalog-backed translation, and React Native module mocks.
  - [x] Assert user-visible copy and accessibility labels from `de`/`en` catalogs. Avoid snapshots containing PII, tokens, tenant ids, or raw backend payloads.
- [x] Run quality and runtime verification when implementation is approved. (AC: 1-6)
  - [x] Run `pnpm compile`.
  - [x] Run focused supplier API/query/screen tests.
  - [x] Run `pnpm test --runInBand`.
  - [x] Run `pnpm lint:check`.
  - [x] Run `pnpm depcruise`.
  - [x] Because this story affects app runtime behavior, navigation, screens, API behavior, and visible UI, use Argent simulator/emulator verification in the implementation workflow.

### Review Findings

- [x] [Review][Patch] Fix backend supplier detail endpoint and re-run active-detail Argent verification — The mobile implementation hard-codes `GET /api/mobile/suppliers/:supplierId`, but Argent verification found that the current local backend returns not-found for supplier IDs returned by the supplier list. This violates the backend-contract blocker and leaves AC1/AC3 dependent on mocked tests instead of a verified runtime contract. User decision: add/fix backend detail support now.
- [x] [Review][Patch] Unvalidated `categoryId` can be forwarded into RFQ context [src/features/funeral-home/discovery/SupplierDetailScreen.tsx:83]
- [x] [Review][Patch] Supplier cards load arbitrary `logoUrl` schemes [src/features/funeral-home/discovery/components/SupplierCard.tsx:41]
- [x] [Review][Patch] Back-to-search actions push duplicate failed/detail routes [src/features/funeral-home/discovery/SupplierDetailScreen.tsx:46]
- [x] [Review][Patch] Nested card and button can trigger duplicate detail navigation [src/features/funeral-home/discovery/components/SupplierCard.tsx:31]
- [x] [Review][Patch] RFQ placeholder accepts invalid supplier context [src/features/funeral-home/FuneralHomeQuotesPlaceholderScreen.tsx:7]
- [x] [Review][Patch] Blank supplier identity can pass schema validation and render empty headings [src/services/api/schemas.ts:113]
- [x] [Review][Patch] Detail screen renders categories as plain text instead of badges [src/features/funeral-home/discovery/SupplierDetailScreen.tsx:126]

## Dev Notes

### Current Source State

- Epic 2 is in progress. Story 2.1 is done and introduced the funeral-home home/category discovery baseline, TanStack Query v5, centralized query keys, `QueryProvider`, category query hook, `CategoryTile`, and German-first home/discover copy.
- `src/services/query/QueryProvider.tsx` clears the query cache and remounts children when the authenticated session scope changes. Preserve this behavior so supplier detail data cannot bleed between users/tenants.
- `src/services/query/queryKeys.ts` currently contains `queryKeys.categories.list()`. Supplier list/detail keys should extend this module rather than define ad hoc arrays in hooks.
- `src/services/api/suppliersApi.ts` currently has `listSuppliers(params)` calling `GET /api/mobile/suppliers` with `q`, `categoryId`, `region`, and `language`, and validates an array with `supplierSchema`.
- `src/services/api/schemas.ts` defines `supplierSchema` with `id`, `legalName`, `tradingName`, HR/VAT fields, `address`, `phone`, `contactEmail`, `publicDescription`, `logoUrl`, `categoryIds`, `regionsServed`, `languages`, `certifications`, `accountStatus`, `subscriptionTier`, `billingEmail`, and `createdAt`.
- `src/services/api/types.ts` exports `SupplierDto`, `CategoryDto`, `ApiFailure`, `AppApiResult<T>`, and `PathIdDto`.
- The actual implemented funeral-home route shape is `src/app/(funeral-home)/funeral-home/*`, so the detail route should live beneath `src/app/(funeral-home)/funeral-home/discover/` even though the architecture artifact shows an older idealized `src/app/(funeral-home)/discover` shape.
- `src/app/(funeral-home)/_layout.tsx` is the protected funeral-home gate and already fails closed for signed-out, booting/offline, wrong-role, and restricted sessions. Do not weaken or bypass it.
- `src/app/(funeral-home)/funeral-home/discover.tsx` currently renders `FuneralHomeDiscoverPlaceholderScreen`. Story 2.2 is expected to replace or extend this into supplier search/filter/card discovery.
- `src/features/funeral-home/FuneralHomeHomeScreen.tsx` routes category selection to `/funeral-home/discover` with `categoryId` and `categorySlug`. Story 2.2 should consume that contract; Story 2.3 should preserve category context from Story 2.2 when entering supplier detail and RFQ start.
- `src/features/funeral-home/FuneralHomeHomeScreen.test.tsx` is the current best local pattern for screen tests with mocked router, SafeArea, theme, i18n translation resolution, and React Native mocks.
- `src/i18n/de.ts` and `src/i18n/en.ts` currently contain `funeralHome.home`, `funeralHome.discover`, `funeralHome.quotes`, and tab/shell copy. Add detail keys under the funeral-home/discovery namespace instead of hard-coding strings.
- `src/theme/colors.ts` has brand and semantic tokens. Brand red is for primary actions and active/selected moments, not general warning/error state.

### Story 2.2 Handoff Assumptions

- Execution recommendation: prepare now, execute after Story 2.2 establishes supplier discovery, card navigation, and any shared discovery components.
- Story 2.2 should create the supplier discovery list/search/filter screen, a `SupplierCard` component, supplier list query keys/hooks, and navigation from each supplier card to a detail route with `supplierId`.
- Story 2.2 should preserve `categoryId` from the home category route when filtering and when opening a supplier detail.
- Story 2.2 should isolate supplier search contract mismatches (`q` versus `query`, unsupported filters) inside `suppliersApi`.
- Story 2.3 may reuse Story 2.2 `SupplierCard` display helpers, filter/category label helpers, and `StatusBadge`/badge components if they exist. Do not duplicate them unless Story 2.2 intentionally keeps them private and reuse would increase coupling.
- Execution of this story should follow Story 2.2 so the list-to-detail navigation contract and discovery folder structure are known.

### Backend / API Contract Assumptions and Blockers

- Blocker: The backend detail endpoint is not confirmed in current source. The likely endpoint is `GET /api/mobile/suppliers/:supplierId`, but implementation must verify the real backend/OpenAPI contract before coding.
- Blocker: The current `supplierSchema` includes fields that may be internal or not ideal for public supplier detail (`billingEmail`, `subscriptionTier`). The app must not render fields unless product/backend confirms they are intended for funeral-home users.
- Blocker: There is no dedicated supplier availability or `isRequestable` flag in the current DTO. Until backend support exists, requestability must be conservative and documented, likely based on `accountStatus === "ACTIVE"` plus any Story 2.2 availability model.
- Blocker: Suspended funeral-home read-only behavior is fully owned by Story 2.7, but this story must still block obvious non-active sessions before RFQ form entry.
- Dependency: RFQ form rendering is Story 2.4. Story 2.3 should only create the entry route contract and context handoff; it must not implement the dynamic RFQ form.
- Dependency: RFQ review/send is Story 2.5 and request history/timeline is Story 2.6. Do not pull those flows into supplier detail.
- Existing backend login/current-user may still omit `accountStatus`/`userStatus`; Argent verification can use the documented dev-only active-session fixture if that gap remains.

### What This Story Changes

- Adds a supplier detail screen reachable from supplier discovery.
- Adds supplier detail API support and query/hook support.
- Adds localized supplier trust/contact/detail presentation.
- Adds a guarded RFQ CTA that preserves supplier and category context for Story 2.4.
- Adds error, not-found, unavailable/deactivated, and blocked-entry states.

### What Must Be Preserved

- Protected route access remains fail-closed through existing route/session/account helpers.
- Route files stay thin; business logic belongs in feature modules, hooks, API modules, or domain helpers.
- Screens/components must not call apisauce directly or inspect raw API responses.
- Token/session material remains behind `src/services/session`; no screen reads MMKV or decodes JWTs.
- Query keys remain centralized in `src/services/query/queryKeys.ts`.
- All user-visible text, accessibility labels, errors, and CTA labels come from i18n.
- German remains the layout stress case. Long labels, supplier names, addresses, categories, and badges must wrap/truncate intentionally without overlap.
- No checkout, payment, order placement, cart, chat, supplier self-registration, or hosted conversation-thread language.
- Do not edit `ios/` or `android/` for this story.

## Architecture Guardrails

- Use feature-oriented placement:
  - Detail route: `src/app/(funeral-home)/funeral-home/discover/[supplierId].tsx`
  - Detail screen: `src/features/funeral-home/discovery/SupplierDetailScreen.tsx`
  - Discovery components/hooks: `src/features/funeral-home/discovery/**`
  - Shared repeated request/status components only when they are reused by more than one feature: `src/features/requests/**` or `src/features/shared/components/**`
  - API: `src/services/api/suppliersApi.ts`, `src/services/api/schemas.ts`, `src/services/api/types.ts`
  - Query: `src/services/query/queryKeys.ts` plus feature hooks
- Keep `SupplierDto` as the API DTO boundary. If display shaping becomes non-trivial, add local display/domain mappers instead of spreading formatting logic across JSX.
- Treat `accountStatus`, verification/requestability, and supplier availability as domain states that need localized labels and semantic tones. Status must never rely on color alone.
- Use existing Ignite primitives and theme tokens before adding new UI components. Do not add a UI kit.
- Use React Query for server state; do not persist query cache yet.
- Use `encodeURIComponent` for route id endpoints and avoid raw ids in visible copy.
- Keep contact transparency explicit but conservative. Show only public supplier contact fields that are appropriate for funeral-home users.
- RFQ entry should be a navigation contract/handoff, not form implementation. Preserve `supplierId` and selected `categoryId` so Story 2.4 can render the right context and `quoteFormSchema`.
- If the user deep-links directly to a supplier detail, the route must still pass through auth/role gates before protected data loads.

## Expected File Changes

Likely NEW files:

```text
src/app/(funeral-home)/funeral-home/discover/[supplierId].tsx
src/features/funeral-home/discovery/SupplierDetailScreen.tsx
src/features/funeral-home/discovery/SupplierDetailScreen.test.tsx
src/features/funeral-home/discovery/hooks/useSupplierDetailQuery.ts
src/features/funeral-home/discovery/hooks/useSupplierDetailQuery.test.tsx
```

Likely UPDATE files:

```text
src/services/api/suppliersApi.ts
src/services/api/apiResult.test.ts
src/services/api/schemas.ts
src/services/api/types.ts
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
```

Possible UPDATE files depending on Story 2.2 output:

```text
src/features/funeral-home/discovery/SupplierCard.tsx
src/features/funeral-home/discovery/SupplierDiscoveryScreen.tsx
src/features/funeral-home/discovery/components/StatusBadge.tsx
src/features/funeral-home/discovery/utils/supplierDisplay.ts
```

Files that should not be touched for this story unless a blocker is explicitly resolved:

```text
src/services/session/**
src/domain/account/accountAccess.ts
ios/**
android/**
package.json
pnpm-lock.yaml
```

## Test / Argent Verification Expectations

- Unit/API:
  - `suppliersApi.getSupplier()` calls the confirmed supplier-detail endpoint with an encoded id.
  - Success envelope maps to `SupplierDto`.
  - `404` maps to `api:error.notFound`/normalized not-found failure.
  - Unauthorized/forbidden maps through existing auth/access-denied behavior.
  - Network/server/bad-data failures remain normalized.
- Query:
  - Supplier detail query key includes the supplier id and does not collide with supplier list/category keys.
  - Missing/invalid id does not fetch and yields a controlled UI path.
  - Query throws or exposes normalized failures only.
- Screen:
  - Active supplier renders identity, categories, regions, languages, certifications, description, public contact transparency, verification/status text, and RFQ CTA.
  - Missing logo and optional description/contact fields render stable fallbacks.
  - Deactivated/unavailable/unknown requestability disables or replaces the RFQ CTA with localized guidance.
  - Suspended/non-active funeral-home session cannot enter RFQ creation.
  - Loading uses stable placeholders; error/not-found states provide retry or safe back/discover action.
  - RFQ CTA navigation preserves `supplierId` and `categoryId`.
  - German and English copy render without ecommerce/chat/payment language.
- Quality commands when implemented:
  - `pnpm compile`
  - focused supplier API/query/screen Jest tests
  - `pnpm test --runInBand`
  - `pnpm lint:check`
  - `pnpm depcruise`
- Argent verification is required because this story affects runtime behavior, navigation, screens, API behavior, and visible UI. Exercise at least:
  - active funeral-home session reaches Discover and opens supplier detail from a Story 2.2 supplier card or fixture path
  - active/requestable supplier shows detail and RFQ CTA
  - RFQ CTA routes to the expected controlled RFQ entry/placeholder with supplier/category context
  - unavailable/deactivated supplier blocks RFQ entry
  - backend failure/error retry and not-found recovery
  - compact German text has no overlap with bottom tabs, safe areas, or CTA area
  - no checkout/order/payment/cart/chat/supplier-self-registration language
- Do not claim Argent verification unless Argent was actually used during implementation.

## References

- [Source: `_bmad-output/planning-artifacts/epics.md` - Epic 2, Story 2.3 acceptance criteria]
- [Source: `_bmad-output/planning-artifacts/prd.md` - UJ-2, FR12, FR13, FR14, FR15, FR33]
- [Source: `_bmad-output/planning-artifacts/architecture.md` - Data Architecture, API & Communication Patterns, Frontend Architecture, Project Structure & Boundaries, Supplier Discovery, RFQ Creation and History]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` - Supplier Card, Status Badge, Category Tile, Navigation Patterns, Search and Filtering Patterns, Loading/Empty/Error States, Localization & Accessibility]
- [Source: `_bmad-output/implementation-artifacts/2-1-funeral-home-home-and-category-discovery-baseline.md` - Story 2.1 completion notes, route/query/category patterns, Argent verification learnings]
- [Source: `_bmad-output/implementation-artifacts/epic-1-retro-2026-05-25.md` - backend account-status gap, dev-only active-session fixture, iOS verification status]
- [Source: `_bmad-output/implementation-artifacts/deferred-work.md` - i18n/test-quality debt to avoid worsening]
- [Source: `src/app/(funeral-home)/_layout.tsx`, `src/app/(funeral-home)/funeral-home/_layout.tsx`, `src/app/(funeral-home)/funeral-home/discover.tsx`]
- [Source: `src/features/funeral-home/FuneralHomeHomeScreen.tsx`, `src/features/funeral-home/FuneralHomeHomeScreen.test.tsx`, `src/features/funeral-home/components/CategoryTile.tsx`, `src/features/funeral-home/hooks/useCategoriesQuery.ts`]
- [Source: `src/services/api/suppliersApi.ts`, `src/services/api/categoriesApi.ts`, `src/services/api/schemas.ts`, `src/services/api/types.ts`, `src/services/api/apiResult.ts`]
- [Source: `src/services/query/QueryProvider.tsx`, `src/services/query/queryKeys.ts`]
- [Source: `src/i18n/de.ts`, `src/i18n/en.ts`, `src/theme/colors.ts`, `src/theme/spacing.ts`]

## Dev Agent Record

### Implementation Plan

- Extended the supplier API boundary first so screens and hooks consume normalized `AppApiResult` values only.
- Added centralized supplier detail query keys and a React Query hook that fails closed when route ids are missing or invalid.
- Added the nested supplier detail route by moving discover to an index route and keeping the detail route param-only.
- Built the supplier detail screen with public supplier metadata, category label resolution, fallback copy, blocked-entry states, and controlled RFQ placeholder handoff.

### Debug Log

- `pnpm test src/services/api/suppliersApi.test.ts --runInBand` initially failed because `suppliersApi.getSupplier` did not exist.
- `pnpm test src/services/api/suppliersApi.test.ts --runInBand` passes after adding `getSupplier`.
- `pnpm test src/services/query/queryKeys.test.ts src/features/funeral-home/discovery/hooks/useSupplierDetailQuery.test.tsx --runInBand` initially failed because the supplier detail key and hook did not exist.
- `pnpm test src/services/query/queryKeys.test.ts src/features/funeral-home/discovery/hooks/useSupplierDetailQuery.test.tsx --runInBand` passes after adding the centralized key and hook.
- `pnpm test src/features/funeral-home/discovery/FuneralHomeDiscoverScreen.test.tsx --runInBand` initially failed after changing the expected card navigation contract, then passed after wiring card selection to detail.
- `pnpm test src/features/funeral-home/discovery/SupplierDetailScreen.test.tsx --runInBand` initially failed because `SupplierDetailScreen` did not exist, then passed after adding the screen and states.
- `pnpm compile` initially failed on supplier query data narrowing in the RFQ callback, then passed after using an explicit loaded supplier value.
- Focused Story 2.3 suite passed: 7 suites, 27 tests.
- `pnpm compile` passed.
- `pnpm test --runInBand` passed: 31 suites, 190 tests.
- `pnpm lint:check` passed.
- `pnpm depcruise` passed: no dependency violations found.
- Argent iOS simulator verification found and fixed an intermediate nested-route tab regression by adding `discover/_layout.tsx`.
- Argent iOS simulator verification passed for the five-tab layout, German supplier discovery layout, supplier-card detail navigation to the recoverable not-found state, safe back-to-search recovery, and German RFQ placeholder copy with supplier/category context preserved.
- Argent could not verify an active supplier-detail payload because the local backend currently returns not-found for `GET /api/mobile/suppliers/:supplierId`; active, unavailable, suspended, loading, error, and RFQ behavior are covered by focused automated tests.
- 2026-05-25 code-review patches passed: backend `npx vitest run tests/services.test.ts`, backend targeted `eslint`, backend `npm run build`, mobile `pnpm compile`, focused mobile tests, full mobile `pnpm test --runInBand`, mobile `pnpm lint:check`, and mobile `pnpm depcruise`.
- Backend `npm test` executed all 108 tests successfully but exited non-zero on the existing 100% branch coverage threshold, reporting unrelated uncovered branch coverage in `src/server/prisma-commands.ts:71`; `npx vitest run --coverage.enabled false` passed all 108 tests.
- Backend repo-wide `npm run lint` remains blocked by an unrelated existing `@next/next/no-html-link-for-pages` violation in `app/page.tsx:24`; targeted lint for changed backend files passed.
- Backend full `npx tsc --noEmit --ignoreDeprecations 6.0` remains blocked by unrelated existing test type errors; backend `npm run build` passed and compiled `/api/mobile/suppliers/[id]`.
- 2026-05-25 Argent iOS simulator verification passed after backend detail support landed: real supplier list opened, active supplier detail loaded from the backend, category badges rendered, and `Angebot anfragen` opened the controlled RFQ placeholder with supplier/category context.

### Completion Notes

- Added `suppliersApi.getSupplier()` with `pathIdSchema` validation, encoded URL construction, `supplierSchema` response validation, and normalized failure handling.
- Added supplier detail API fixtures/tests for success, not found, auth/forbidden, network, malformed data, and unavailable supplier representation.
- Added `queryKeys.suppliers.detail()` and `useSupplierDetailQuery()` with normalized failure propagation and disabled execution for invalid ids.
- Added supplier detail route and screen with public metadata, localized status/contact/coverage sections, category label resolution, loading/not-found/error states, and RFQ entry handoff.
- Updated supplier cards to open detail instead of directly starting a placeholder RFQ.
- Added German and English copy for detail sections, statuses, fallback states, blocked explanations, and accessibility labels.
- Added a controlled request-creation placeholder for the preserved RFQ context until Story 2.4 implements the actual form.
- Added a nested discover stack layout so the supplier detail route does not appear as a bottom tab.
- Resolved all code-review patch findings by adding the backend mobile supplier detail route, validating RFQ category/supplier context, restricting logo URLs to HTTP(S), replacing recovery navigation, removing the nested card/button pressable, requiring non-blank legal supplier identity, and rendering detail categories as badges.
- Verified the active-detail runtime path through Argent against the local Next backend.

### File List

- `src/app/(funeral-home)/funeral-home/discover.tsx` (deleted; moved to index route)
- `src/app/(funeral-home)/funeral-home/discover/_layout.tsx`
- `src/app/(funeral-home)/funeral-home/discover/index.tsx`
- `src/app/(funeral-home)/funeral-home/discover/[supplierId].tsx`
- `src/features/funeral-home/FuneralHomeQuotesPlaceholderScreen.tsx`
- `src/features/funeral-home/FuneralHomeQuotesPlaceholderScreen.test.tsx`
- `src/features/funeral-home/discovery/FuneralHomeDiscoverScreen.tsx`
- `src/features/funeral-home/discovery/FuneralHomeDiscoverScreen.test.tsx`
- `src/features/funeral-home/discovery/SupplierDetailScreen.tsx`
- `src/features/funeral-home/discovery/SupplierDetailScreen.test.tsx`
- `src/features/funeral-home/discovery/components/SupplierCard.tsx`
- `src/features/funeral-home/discovery/components/SupplierCard.test.tsx`
- `src/services/api/suppliersApi.ts`
- `src/services/api/suppliersApi.test.ts`
- `src/services/query/queryKeys.ts`
- `src/services/query/queryKeys.test.ts`
- `src/features/funeral-home/discovery/hooks/useSupplierDetailQuery.ts`
- `src/features/funeral-home/discovery/hooks/useSupplierDetailQuery.test.tsx`
- `src/i18n/de.ts`
- `src/i18n/en.ts`
- `/Users/fariskunic/Documents/personal/bsc/bestattungszentrum-app/app/api/mobile/suppliers/[id]/route.ts`
- `/Users/fariskunic/Documents/personal/bsc/bestattungszentrum-app/app/api/docs/openapi/route.ts`
- `/Users/fariskunic/Documents/personal/bsc/bestattungszentrum-app/src/server/services.ts`
- `/Users/fariskunic/Documents/personal/bsc/bestattungszentrum-app/tests/services.test.ts`

## Change Log

- 2026-05-25: Added supplier detail API boundary and focused tests.
- 2026-05-25: Added supplier detail query key/hook and focused tests.
- 2026-05-25: Added supplier detail route, screen, RFQ entry handoff, localization, and focused screen/navigation tests.
- 2026-05-25: Completed quality checks and Argent runtime verification; documented backend detail-endpoint runtime gap.
- 2026-05-25: Applied code-review patches, added backend supplier detail support, reverified active-detail runtime behavior with Argent, and moved story to done.
