# Story 2.2: Supplier Search, Filters, and Supplier Cards

Status: done

<!-- Completion note: Story draft prepared for dev-story execution. Do not treat this as implementation evidence. -->

## Story

As a funeral-home user,
I want to search and filter verified suppliers,
so that I can find relevant suppliers by category, region, language, certification, and text.

## Acceptance Criteria

1. Given the Discover screen is opened, when supplier discovery renders, then it provides a localized App Search Header, reversible filters, selected-filter states, and individual or grouped clear affordances, and the UI avoids ecommerce shopping or product-purchase language.
2. Given the user enters search text or filters, when suppliers are requested from the backend, then the API module maps mobile query inputs to the backend implementation parameter names, and supplier search contract mismatches such as `q` versus `query` are isolated inside the API module.
3. Given supplier results are returned, when the list renders, then Supplier Cards show logo or fallback mark, name, categories, regions, short description, verification status, language indicators, and RFQ CTA, and status badges include localized labels and accessibility text.
4. Given supplier search API fixtures exist, when success, empty, validation failure, unauthorized, and network failure fixtures are mapped, then `suppliersApi` owns request parameter mapping, response DTO mapping, problem mapping, and localized message keys.
5. Given no suppliers match the current search, when the empty state renders, then it suggests clearing filters, browsing categories, or adjusting region/category criteria, and the empty copy is calm and operational.
6. Given loading and error states occur, when supplier results are pending or fail, then stable skeletons/placeholders or recoverable error states are shown instead of layout-shifting spinners.
7. Given tests run, when search, filter selection, filter clearing, loading, empty, error, and supplier-card states are exercised, then the user-visible behavior and API query mapping are verified.

## Tasks/Subtasks

- [x] Replace the Discover placeholder with the supplier discovery screen. (AC: 1, 5, 6, 7)
  - [x] Keep `src/app/(funeral-home)/funeral-home/discover.tsx` as a thin route wrapper.
  - [x] Add `src/features/funeral-home/discovery/FuneralHomeDiscoverScreen.tsx` or equivalent and render it from the route.
  - [x] Read `categoryId` and `categorySlug` from Expo Router search params so Story 2.1 category tiles preselect the category filter.
  - [x] Preserve the protected funeral-home route gate in `src/app/(funeral-home)/_layout.tsx`; do not duplicate role/account checks inside the screen.
  - [x] Do not implement supplier detail, RFQ form rendering, RFQ submission, request history, checkout, payment, order, cart, chat, supplier self-registration, or back-office supplier management in this story.
- [x] Build the search and filter UI. (AC: 1, 5, 7)
  - [x] Add an App Search Header for supplier discovery using existing primitives such as `TextField`, `Button`, `Text`, and theme tokens.
  - [x] Use localized German-first labels, placeholders, clear buttons, accessibility labels, and selected-filter announcements.
  - [x] Provide reversible filters for category, region, and language using compact chips or bottom-sheet/section controls consistent with the UX spec.
  - [x] Provide individual clear affordances for each selected filter and a grouped clear action when any filter or search text is active.
  - [x] Treat certification carefully: supplier cards may display `SupplierDto.certifications`, but a certification search filter must be hidden, disabled with localized pending copy, or implemented only if the backend contract supports it. Current mobile API code does not expose a certification query param.
  - [x] Avoid retail language such as checkout, cart, order, purchase, payment, buy, shop, deal, or marketplace urgency.
- [x] Extend supplier query support through the existing server-state layer. (AC: 2, 4, 6, 7)
  - [x] Extend `src/services/query/queryKeys.ts` with a stable supplier-list key that includes normalized query params.
  - [x] Add `src/features/funeral-home/discovery/hooks/useSuppliersQuery.ts` or equivalent using TanStack Query v5 and `suppliersApi.listSuppliers()`.
  - [x] Keep query behavior conservative for mobile: no polling, no aggressive refetch loops, explicit retry UI for recoverable failures, and stable placeholder cards during loading.
  - [x] Ensure query params are normalized before keying/requesting so empty strings and unset filters do not create noisy cache keys.
  - [x] Preserve the Story 2.1 `QueryProvider` session-scope clearing behavior so supplier data cannot leak between users or tenants.
- [x] Harden `suppliersApi` ownership of the backend search contract. (AC: 2, 4, 7)
  - [x] Keep endpoint ownership in `src/services/api/suppliersApi.ts` for `GET /api/mobile/suppliers`.
  - [x] Use a mobile-facing input type such as `SupplierSearchParams` with `query`, `categoryId`, `region`, and `language`, then map `query` to backend `q` inside `suppliersApi`.
  - [x] Keep the known OpenAPI/implementation mismatch (`query` vs `q`) isolated in `suppliersApi`; screens and hooks should not know the backend param name.
  - [x] Continue returning `AppApiResult<SupplierDto[]>`; screens and hooks must not inspect raw apisauce responses.
  - [x] Add focused `suppliersApi` tests for success, empty array, validation failure, unauthorized/403 mapped with `forbiddenMeansAuth`, network failure, bad data, and the exact query-param mapping.
- [x] Add Supplier Card UI for search results. (AC: 3, 6, 7)
  - [x] Place domain UI under `src/features/funeral-home/discovery/components/SupplierCard.tsx` unless a broader reuse boundary becomes clearly necessary later.
  - [x] Render `logoUrl` through a safe image/fallback mark path; do not let broken or missing logos collapse the card.
  - [x] Render `tradingName` as the primary name, falling back to `legalName` if needed.
  - [x] Resolve category labels from the category list using `SupplierDto.categoryIds`; never display raw ids as user-facing labels.
  - [x] Render `regionsServed`, `languages`, `certifications`, and `publicDescription` with truncation/wrapping that remains stable on compact German layouts.
  - [x] Derive a supplier requestability/verification display from the available DTO fields. Current `SupplierDto` has `accountStatus` but no supplier `verificationStatus`; treat this as a contract gap and avoid claiming verified status unless backend exposes a reliable field.
  - [x] Add localized status badge labels and accessibility labels. Do not rely on color alone.
  - [x] Include an RFQ CTA using request language such as `Angebot anfragen`; for this story, the CTA should route only to a safe placeholder/disabled path or be prepared for Story 2.3/2.4 context without starting an unimplemented RFQ form.
- [x] Add empty, loading, and error states. (AC: 5, 6, 7)
  - [x] Use stable skeleton supplier cards or placeholder rows while supplier results load.
  - [x] Show a practical no-results state with clear filters, browse categories, and adjust region/category suggestions.
  - [x] Show recoverable localized API failures with retry where meaningful.
  - [x] Distinguish auth/account failures from ordinary network/server failures; protected route/account failures should continue through existing route/session gates.
- [x] Add German-first and English localization. (AC: 1, 3, 5, 6, 7)
  - [x] Update `src/i18n/de.ts` and `src/i18n/en.ts` with all visible discovery, search, filter, status badge, supplier-card, empty, loading, error, retry, clear, and CTA copy.
  - [x] Check non-primary locale forwarding (`ar`, `es`, `fr`, `hi`, `ja`, `ko`) only if TypeScript requires namespace shape updates.
  - [x] Keep copy calm, operational, and B2B procurement-oriented.
- [x] Add focused tests. (AC: 1-7)
  - [x] Add `src/services/api/suppliersApi.test.ts` or extend the current API test suite with supplier-specific request mapping and failure cases.
  - [x] Add `useSuppliersQuery` tests for success/failure handling and query-key normalization.
  - [x] Add `FuneralHomeDiscoverScreen` tests for initial category preselection from route params, search input, filter selection, individual clear, clear all, loading placeholders, empty state, retry, result rendering, and supplier-card interactions.
  - [x] Add `SupplierCard` tests for missing logo fallback, category label resolution, status badge accessibility text, long German content, inactive/unrequestable supplier display, and RFQ CTA behavior.
  - [x] Use existing test wrapper patterns from Story 2.1: `SafeAreaProvider`, `ThemeProvider`, router mocks, i18n catalog lookups, and query hook/API mocks.
- [x] Run quality and runtime verification. (AC: 1-7)
  - [x] Run `pnpm compile`.
  - [x] Run focused Jest tests for `suppliersApi`, query hook, Discover screen, and Supplier Card.
  - [x] Run `pnpm test --runInBand`.
  - [x] Run `pnpm lint:check`.
  - [x] Run `pnpm depcruise`.
  - [x] Run Argent simulator/emulator verification because this story changes runtime UI, navigation, query/API behavior, and visible app state.

## Dev Notes

### Current Source State

- Story 2.1 is done and code-reviewed. It added TanStack Query v5, `src/services/query`, `QueryProvider`, `useCategoriesQuery`, `CategoryTile`, a real `FuneralHomeHomeScreen`, and category navigation into `/funeral-home/discover` with `categoryId` and `categorySlug` params.
- `src/app/(funeral-home)/funeral-home/discover.tsx` currently only renders `FuneralHomeDiscoverPlaceholderScreen`. Story 2.2 should replace that feature screen while keeping the route file thin.
- `src/features/funeral-home/FuneralHomeDiscoverPlaceholderScreen.tsx` is placeholder-only and uses `funeralHome:discover.*` translation keys.
- `src/app/(funeral-home)/_layout.tsx` is the protected funeral-home gate. It must remain the boundary that blocks signed-out, wrong-role, pending, suspended, failed, unavailable, and unknown-account states before protected business content renders.
- `src/services/api/suppliersApi.ts` currently exposes `ListSuppliersParams` with backend-shaped `q`, `categoryId`, `region`, and `language`, then calls `GET /api/mobile/suppliers`.
- `src/services/api/schemas.ts` defines `supplierSchema` with `id`, `legalName`, `tradingName`, HR/VAT/contact fields, `address`, `phone`, `contactEmail`, `publicDescription`, `logoUrl`, `categoryIds`, `regionsServed`, `languages`, `certifications`, `accountStatus`, `subscriptionTier`, `billingEmail`, and `createdAt`.
- `SupplierDto` currently does not include an explicit supplier `verificationStatus`. The story acceptance criteria require verification display, so implementation must either derive only safe requestability from `accountStatus` or wait for/confirm a backend verification field before showing verified claims.
- `src/services/api/apiResult.ts` already owns normalized API result mapping. Do not bypass it for supplier search.
- `src/services/query/queryKeys.ts` currently only has `categories.list()`.
- `src/i18n/de.ts` and `src/i18n/en.ts` contain placeholder `funeralHome.discover` copy and Story 2.1 `funeralHome.home` keys.
- Repowise could not find several current files because its index predates recent Story 2.1 work. Actual source files are the source of truth for implementation.

### Dependency Assumptions and Blockers

- Execution recommendation: Story 2.2 is the next safe Epic 2 implementation story.
- Backend supplier search is assumed to be `GET /api/mobile/suppliers` with implemented query params `q`, `categoryId`, `region`, and `language`.
- OpenAPI/planning notes still mention a `query` vs `q` mismatch. Mobile UI should use a domain-friendly `query` field and let `suppliersApi` map it to `q`.
- Certification filtering is a backend/API contract blocker unless the endpoint accepts a certification parameter. Displaying supplier certifications from returned DTOs is in scope; filtering by certification should be hidden/disabled or explicitly marked pending until contract support exists.
- Supplier verification display is a backend/API contract blocker unless backend exposes a reliable supplier verification/status field. `accountStatus: ACTIVE` can support requestability copy, but it is not the same as supplier verification.
- Supplier detail/RFQ entry is Story 2.3. The Supplier Card can expose prepared navigation/CTA affordance, but it must not create RFQ state or render an RFQ form in Story 2.2.
- Story 2.6 owns outgoing request history. Do not pull request list/detail/timeline scope into this story.
- Real backend active-session fixtures may still omit `accountStatus`/`userStatus` for auth/current-user in some local paths. Argent verification may require the same documented dev-only active-session approach used in Story 2.1 if real seeded users still fail closed.

### What This Story Changes

- Converts the funeral-home Discover tab from placeholder to supplier search/list UI.
- Adds supplier-list server-state usage on top of the existing TanStack Query foundation.
- Moves supplier search request mapping and fixture coverage into `suppliersApi`.
- Adds domain supplier discovery UI: App Search Header, filter chips/controls, selected-filter state, no-results/error/loading states, and Supplier Cards.
- Adds localized supplier discovery copy.

### What Must Be Preserved

- Route files stay thin wrappers around feature screens.
- Protected data remains behind the funeral-home route/account gate.
- API modules own endpoint paths, DTO validation, request parameter mapping, and normalized problem mapping.
- Screens and hooks consume `AppApiResult`/query state, not apisauce internals.
- Session/token data remains behind `src/services/session`; do not read MMKV or decode tokens in discovery UI.
- German remains the layout stress case.
- Brand red is reserved for primary actions, selected filters, active navigation, and key brand moments.
- No ecommerce, checkout, cart, order, purchase, payment, escrow, chat, consumer-family, supplier self-registration, or admin back-office language.
- Do not edit native `ios/` or `android/` files for this story.

## Architecture Guardrails

- Use feature-oriented placement:
  - Route: `src/app/(funeral-home)/funeral-home/discover.tsx`
  - Screen: `src/features/funeral-home/discovery/FuneralHomeDiscoverScreen.tsx`
  - Components: `src/features/funeral-home/discovery/components/AppSearchHeader.tsx`, `SupplierCard.tsx`, and filter/status helpers as needed
  - Hooks: `src/features/funeral-home/discovery/hooks/useSuppliersQuery.ts`
  - API: `src/services/api/suppliersApi.ts`
  - Query keys: `src/services/query/queryKeys.ts`
- Prefer domain-local components under `src/features/funeral-home/discovery` until reuse across roles is proven.
- `SupplierCard` should receive display-ready props or a small view model, especially for category names and status badge copy, so rendering does not leak raw backend ids.
- If adding status mapping helpers, keep them local unless they become shared across supplier detail/history stories.
- Use `CategoryDto` from the existing categories query to resolve supplier `categoryIds` to localized labels.
- Normalize user-entered search text before triggering the supplier query. Consider a small debounce if tests can cover it clearly; avoid complex async behavior if it does not materially improve the first slice.
- Keep selected filters in route/search params only where it improves navigation continuity. At minimum, consume Story 2.1 `categoryId`/`categorySlug` params on first render.
- Avoid arbitrary dynamic icon loading from backend category or supplier data. Use safe known icons or fallback initials/marks.
- Keep skeletons non-focusable for accessibility, following the Story 2.1 review patch pattern.
- Do not add a new UI kit or styling system.

## Expected file changes

Likely NEW files:

```text
src/features/funeral-home/discovery/FuneralHomeDiscoverScreen.tsx
src/features/funeral-home/discovery/FuneralHomeDiscoverScreen.test.tsx
src/features/funeral-home/discovery/components/AppSearchHeader.tsx
src/features/funeral-home/discovery/components/AppSearchHeader.test.tsx
src/features/funeral-home/discovery/components/SupplierCard.tsx
src/features/funeral-home/discovery/components/SupplierCard.test.tsx
src/features/funeral-home/discovery/hooks/useSuppliersQuery.ts
src/features/funeral-home/discovery/hooks/useSuppliersQuery.test.tsx
src/services/api/suppliersApi.test.ts
```

Likely UPDATE files:

```text
src/app/(funeral-home)/funeral-home/discover.tsx
src/services/api/suppliersApi.ts
src/services/query/queryKeys.ts
src/i18n/de.ts
src/i18n/en.ts
src/i18n/ar.ts
src/i18n/es.ts
src/i18n/fr.ts
src/i18n/hi.ts
src/i18n/ja.ts
src/i18n/ko.ts
```

Only update non-primary locale files if TypeScript namespace forwarding requires it.

## Test/Argent verification expectations

- Unit/API checks:
  - `pnpm test src/services/api/suppliersApi.test.ts --runInBand`
  - Focused tests for supplier query hook, Discover screen, App Search Header, and Supplier Card.
- Full quality checks:
  - `pnpm compile`
  - `pnpm test --runInBand`
  - `pnpm lint:check`
  - `pnpm depcruise`
  - `git diff --check`
- Argent runtime verification is required for implementation because this story affects app runtime behavior, navigation, screens, and API behavior.
- Argent scenarios to exercise:
  - Active funeral-home session opens Discover from the tab.
  - Category selection from Story 2.1 preselects the Discover category filter.
  - Search text updates supplier results through the API/query boundary.
  - Category, region, and language filters can be selected and cleared individually and together.
  - Certification filter is hidden/disabled or works only if backend support is confirmed.
  - Supplier result cards show logo fallback, name, categories, regions, description, language indicators, certification display, status badge text, and RFQ CTA.
  - Loading placeholders are stable and not focusable as real results.
  - Empty state suggests clearing filters/browsing categories/adjusting criteria.
  - Network/server failure shows localized retry and recovers after retry where fixture support allows.
  - Compact German labels do not overlap the bottom tab bar or card controls.
  - No checkout/cart/order/purchase/payment/chat/supplier self-registration language appears.
- If backend fixtures cannot return active accounts, supplier results, certification-filter support, or verification status, document the exact blocker and verify reachable UI using a dev-only fixture or mocked API path without claiming real backend coverage.

## References

- `_bmad-output/planning-artifacts/epics.md` - Epic 2, Story 2.2 acceptance criteria, FR12-FR13 coverage.
- `_bmad-output/planning-artifacts/prd.md` - UJ-2, FR12, FR13, FR40, NFR12-NFR13, design guardrails, endpoint notes.
- `_bmad-output/planning-artifacts/architecture.md` - Supplier Discovery module, API communication patterns, TanStack Query plan, project structure, naming conventions.
- `_bmad-output/planning-artifacts/ux-design-specification.md` - App Search Header, Supplier Card, search/filter, loading/empty/error, accessibility, and Quiet OTTO Native guidance.
- `_bmad-output/implementation-artifacts/2-1-funeral-home-home-and-category-discovery-baseline.md` - completed category discovery baseline, query provider, category navigation contract, Argent verification notes.
- `_bmad-output/implementation-artifacts/1-3-typed-api-dtos-and-normalized-api-result-boundary.md` - mobile DTO/API module expectations and supplier endpoint notes.
- `_bmad-output/implementation-artifacts/1-6-role-gate-and-account-status-handling.md` - protected route/account gate behavior and backend account-status gap.
- `_bmad-output/implementation-artifacts/1-7-role-specific-tabs-and-shared-settings-placeholders.md` - route/tab structure, active-session fixture notes, compact German tab verification.
- `src/app/(funeral-home)/funeral-home/discover.tsx` - current thin Discover route.
- `src/features/funeral-home/FuneralHomeDiscoverPlaceholderScreen.tsx` - current placeholder to replace.
- `src/features/funeral-home/FuneralHomeHomeScreen.tsx` - Story 2.1 category navigation into Discover.
- `src/features/funeral-home/components/CategoryTile.tsx` - category tile pattern and accessibility baseline.
- `src/features/funeral-home/hooks/useCategoriesQuery.ts` - existing category query hook pattern.
- `src/services/query/QueryProvider.tsx` and `src/services/query/queryKeys.ts` - existing TanStack Query session-scope and key foundation.
- `src/services/api/suppliersApi.ts`, `src/services/api/schemas.ts`, `src/services/api/types.ts`, `src/services/api/apiResult.ts` - supplier API boundary and DTOs.
- `src/i18n/de.ts`, `src/i18n/en.ts`, `src/theme/colors.ts`, `src/theme/spacing.ts`, `src/navigation/RoleTabs.tsx` - localization, theme, and tab patterns.
- Repowise risk check for likely Story 2.2 files - `src/i18n/en.ts` has coupling risk and non-primary locale files are downstream of i18n shape changes; current Story 2.1 source paths were partly missing from the index, so source inspection above is authoritative.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-05-25: Red phase focused tests initially failed for missing supplier discovery components/hooks and for existing `suppliersApi` leaking backend-shaped query params.
- 2026-05-25: Focused tests passed: `pnpm test src/services/api/suppliersApi.test.ts src/features/funeral-home/discovery/hooks/useSuppliersQuery.test.tsx src/features/funeral-home/discovery/components/SupplierCard.test.tsx src/features/funeral-home/discovery/components/AppSearchHeader.test.tsx src/features/funeral-home/discovery/FuneralHomeDiscoverScreen.test.tsx --runInBand`.
- 2026-05-25: Full validation passed: `pnpm compile`, focused Jest suite, `pnpm test --runInBand`, `pnpm lint:check`, `pnpm depcruise`, and `git diff --check`.
- 2026-05-25: Argent Android runtime verification passed with a Metro debugger runtime-only fixture because `localhost:3000` backend was not running and the Android dev API URL was unreachable. Verified active funeral-home Discover access, category preselection from Home, search result count changes, category/region/language filter controls, grouped clear, certification-filter pending copy, supplier card fallback logo/name/category/regions/languages/certifications/status/RFQ CTA, empty state, recoverable network error plus retry recovery, compact German layout, and no visible checkout/cart/order/purchase/payment/chat/supplier self-registration language. Fixture session and patched API methods were restored/cleared afterward. JS log registry reported zero entries.
- 2026-05-25: Additional live-backend verification found parent category filters returning zero suppliers because seeded suppliers are assigned to active child categories. Patched the Next backend mobile supplier service to include active descendant categories for parent `categoryId` filters and added focused backend coverage in `tests/services.test.ts`; `pnpm exec vitest run tests/services.test.ts` and backend lint passed.
- 2026-05-25: Argent iOS simulator verification passed with the local Next backend running on `localhost:3000`. Verified real supplier API results, Story 2.1 category preselection into Discover, top-level `Trauerfloristik` returning `Rheinblume Trauerfloristik`, search for `Rheinblume`, empty state with `xyzleer`, grouped clear, certification-filter pending copy, Supplier Card fallback logo/category/regions/languages/certification/status/RFQ CTA, compact German layout, bottom navigation stability, and zero JS log entries.
- 2026-05-25: Code-review patches passed: `pnpm test src/features/funeral-home/discovery/FuneralHomeDiscoverScreen.test.tsx src/features/funeral-home/discovery/components/AppSearchHeader.test.tsx --runInBand`, nearby focused Jest suites, `pnpm compile`, `pnpm lint`, `git diff --check`, backend `pnpm exec vitest run tests/services.test.ts`, and Argent iOS runtime verification with the local Next backend.

### Completion Notes List

- Replaced the Discover route placeholder with a thin route wrapper that renders `FuneralHomeDiscoverScreen`.
- Added supplier discovery UI with localized App Search Header, category/region/language chips, selected search state, individual clear actions, grouped clear, certification pending panel, loading placeholders, no-results state, recoverable error state, and Supplier Cards.
- Added `SupplierSearchParams` and normalized supplier query ownership in `suppliersApi`, mapping mobile `query` to backend `q` internally while preserving `AppApiResult<SupplierDto[]>`.
- Added `useSuppliersQuery` and supplier query keys with normalized params on the existing TanStack Query foundation.
- Added Supplier Card rendering for fallback logo mark, display name fallback, localized category labels, regions, languages, certifications, public description, safe requestability status from `accountStatus`, accessibility text, and RFQ CTA without starting an RFQ form.
- Added German-first and English discovery copy; non-primary locales continue forwarding the English namespace shape and did not require direct edits.
- Initial backend runtime coverage blocker was resolved by running the local Next backend on `localhost:3000`; follow-up iOS verification now covers real login/session, category, and supplier API paths.
- Resolved code-review findings by syncing category route params on mounted Discover screens, aligning region chips to backend/live supplier regions, routing the RFQ CTA to the prepared Quotes placeholder, making empty-state category browsing return to Home categories, and localizing search accessibility labels.

### File List

- `src/app/(funeral-home)/funeral-home/discover.tsx`
- `src/features/funeral-home/FuneralHomeDiscoverPlaceholderScreen.tsx`
- `src/features/funeral-home/discovery/FuneralHomeDiscoverScreen.tsx`
- `src/features/funeral-home/discovery/FuneralHomeDiscoverScreen.test.tsx`
- `src/features/funeral-home/discovery/components/AppSearchHeader.tsx`
- `src/features/funeral-home/discovery/components/AppSearchHeader.test.tsx`
- `src/features/funeral-home/discovery/components/SupplierCard.tsx`
- `src/features/funeral-home/discovery/components/SupplierCard.test.tsx`
- `src/features/funeral-home/discovery/hooks/useSuppliersQuery.ts`
- `src/features/funeral-home/discovery/hooks/useSuppliersQuery.test.tsx`
- `src/i18n/de.ts`
- `src/i18n/en.ts`
- `src/services/api/suppliersApi.ts`
- `src/services/api/suppliersApi.test.ts`
- `src/services/query/queryKeys.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/2-2-supplier-search-filters-and-supplier-cards.md`
- `/Users/fariskunic/Documents/personal/bsc/bestattungszentrum-app/src/server/services.ts`
- `/Users/fariskunic/Documents/personal/bsc/bestattungszentrum-app/tests/services.test.ts`

### Change Log

- 2026-05-25: Implemented Story 2.2 supplier search, filters, supplier cards, tests, quality checks, and Argent runtime verification; moved story to review.
- 2026-05-25: Resolved code-review findings and moved Story 2.2 to done.
