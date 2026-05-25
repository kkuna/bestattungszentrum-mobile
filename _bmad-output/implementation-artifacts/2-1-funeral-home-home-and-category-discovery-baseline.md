# Story 2.1: Funeral-Home Home and Category Discovery Baseline

Status: done

<!-- Completion note: Ultimate context engine analysis completed - comprehensive developer guide created. -->

## Story

As a funeral-home user,
I want a role-specific home screen with supplier categories and request shortcuts,
so that I can start supplier discovery or return to recent request work quickly.

## Acceptance Criteria

1. Given an active funeral-home user opens the app, when the funeral-home home screen renders, then it shows localized category entry points, recent requests or empty-state shortcuts, and clear next actions, and it follows the Quiet OTTO Native shell rhythm with a light canvas, white modules, stable bottom navigation, and restrained brand red.
2. Given categories are available from the backend, when the home screen loads, then category tiles show localized names, loading states, empty states, and retry behavior, and category selection routes the user toward supplier discovery or RFQ start without exposing raw backend schema terms.
3. Given the backend is unavailable or no categories exist, when category loading fails or returns empty, then the user sees a localized practical empty/error state with retry where meaningful, and no full-screen spinner remains after the request settles.
4. Given compact German layouts are tested, when category names, request shortcuts, and primary actions render, then text remains readable without overlap or bottom navigation collisions.
5. Given component tests run, when category loading, empty, error, and selection states are exercised, then the home screen behavior and i18n labels are verified.

## Tasks / Subtasks

- [x] Add the server-state foundation needed for category discovery. (AC: 2, 3, 5)
  - [x] Add `@tanstack/react-query` v5 using `pnpm add @tanstack/react-query`. The latest npm version checked during story creation is `5.100.14`; use the package manager-resolved v5 range in `package.json` and commit the lockfile.
  - [x] Add a small query service layer under `src/services/query`, for example `QueryProvider`, `queryClient`, and `queryKeys`. Keep query keys centralized from the first category query.
  - [x] Wrap the app in `QueryProvider` from `src/app/_layout.tsx` without changing the current `ThemeProvider`, `KeyboardProvider`, `SessionProvider`, or `SessionGate` responsibilities.
  - [x] Do not move auth boot, refresh, logout, or token storage into TanStack Query. Story 1.5 deliberately keeps session startup explicit.
  - [x] Use TanStack Query for the category list through `categoriesApi.listCategories()`. The query function should return category data on `{ ok: true }` and convert normalized API failures into UI-consumable error state; screens must not inspect raw apisauce responses.
- [x] Build the funeral-home home screen from the existing placeholder into the category discovery baseline. (AC: 1-4)
  - [x] Replace the placeholder-only content in `src/features/funeral-home/FuneralHomeHomeScreen.tsx` with a real safe-area-aware screen using existing Ignite primitives and theme tokens.
  - [x] Keep `src/app/(funeral-home)/funeral-home/index.tsx` as a thin route wrapper that only renders `FuneralHomeHomeScreen`.
  - [x] Preserve the existing protected layout at `src/app/(funeral-home)/_layout.tsx`. Do not duplicate role/account-status checks inside the screen.
  - [x] Render a quiet home header or intro module for the funeral-home workspace. Use localized copy and restrained brand red only for primary/active moments.
  - [x] Render a category section with loading placeholders, loaded category tiles, empty state, error state, and retry action.
  - [x] Render a request shortcut section. For this story, an empty-state shortcut to Discover and/or Quotes is enough unless a small recent-request summary can reuse existing `quoteRequestsApi.listFuneralHomeRequests()` without pulling Story 2.6 history/detail scope forward.
  - [x] Do not implement supplier search filters, supplier cards, supplier detail, RFQ creation, request history detail, timeline, attachments, checkout, payment, chat, or supplier self-registration in this story.
- [x] Add a reusable category tile component in the funeral-home feature area. (AC: 1-4)
  - [x] Place domain UI under `src/features/funeral-home` or a nested `components` folder, not under `src/components` unless it becomes a base Ignite primitive.
  - [x] Compose existing primitives (`Card`, `Text`, `Button`, `Icon` where suitable, `Screen`) and theme tokens. Do not add a UI kit.
  - [x] Use `CategoryDto` fields from `src/services/api/types.ts`: `id`, `slug`, `nameDe`, `nameEn`, `parentId`, `icon`, `quoteFormSchema`, and `isActive`.
  - [x] Display localized names from `nameDe` or `nameEn` based on the active app language. Do not display `quoteFormSchema`, raw schema keys, internal ids, or backend taxonomy names as primary user copy.
  - [x] Treat inactive categories as hidden or disabled with localized explanation; do not route users into inactive business actions.
  - [x] Ensure each tile has a minimum 48dp touch target, localized accessibility label, stable dimensions, and German label wrapping/truncation that cannot overlap neighboring tiles.
- [x] Wire category selection to the next discovery step without overbuilding later stories. (AC: 2)
  - [x] On category press, navigate toward the existing funeral-home Discover tab, preferably `/funeral-home/discover` with a stable query parameter such as `categoryId` or `categorySlug` for Story 2.2 to consume.
  - [x] If the Discover screen remains a placeholder, update its localized placeholder copy only if needed to acknowledge category-based discovery is next. Do not implement supplier search/filter UI in this story.
  - [x] Do not start RFQ creation from the home screen unless the story implementation also provides a controlled placeholder route and copy that makes clear RFQ creation is not implemented yet.
- [x] Add German-first and English localization for every new user-facing label. (AC: 1-5)
  - [x] Update `src/i18n/de.ts` and `src/i18n/en.ts` with home title, section headings, category loading labels, empty state, error state, retry action, category tile accessibility labels, request shortcut labels, and navigation/action labels.
  - [x] Keep non-primary locale files typed by forwarding the English namespace if required. `ar`, `es`, `fr`, `hi`, `ja`, and `ko` currently forward `en.funeralHome`, so they should compile after `en` is updated.
  - [x] Use calm operational German copy. Avoid checkout, cart, order, purchase, payment, celebratory, playful, consumer-shopping, chat, supplier self-registration, and admin/back-office language.
- [x] Add focused tests for API, query, and screen behavior. (AC: 2, 3, 5)
  - [x] Add or extend API tests for `categoriesApi.listCategories()` if the query work requires mapper changes. Preserve endpoint ownership at `/api/mobile/categories` and normalized result behavior.
  - [x] Add query key/client tests if a helper layer is introduced.
  - [x] Add `FuneralHomeHomeScreen` component tests for loading, success with active categories, empty categories, normalized API failure, retry, and category press navigation.
  - [x] Assert visible localized labels and accessibility labels from `de`/`en` catalogs rather than implementation details.
  - [x] Use existing test wrapper patterns from `SettingsScreens.test.tsx`, `AuthShell.test.tsx`, and `LoginScreen.test.tsx`: `SafeAreaProvider`, `ThemeProvider`, mocked router, and i18n translation resolution.
  - [x] Do not put tokens, emails, tenant ids, backend payloads, or raw session JSON in snapshots or logs.
- [x] Run quality and runtime verification. (AC: 1-5)
  - [x] Run `pnpm compile`.
  - [x] Run focused Jest tests for categories API/query and `FuneralHomeHomeScreen`.
  - [x] Run `pnpm test --runInBand`.
  - [x] Run `pnpm lint:check`.
  - [x] Run `pnpm depcruise`.
  - [x] Because this story affects app runtime behavior, navigation, screens, API behavior, and visible UI, use Argent simulator/emulator verification. Exercise an active funeral-home session, category loading success, empty state, backend failure/retry, category tile press to Discover, compact German labels, stable bottom navigation, and no visible ecommerce/chat/payment language.
  - [x] If the real backend still omits `accountStatus`/`userStatus` and blocks active workspaces, use or create a documented dev-only active-session fixture for verification. It must be `__DEV__`-gated, never production reachable, and reverted or isolated according to the Epic 1 retrospective action item.

### Review Findings

- [x] [Review][Patch] Clear React Query cache across session changes to avoid cross-session category data reuse [src/services/query/QueryProvider.tsx]
- [x] [Review][Patch] Add a safe fallback for blank localized category names before rendering tiles [src/features/funeral-home/FuneralHomeHomeScreen.tsx]
- [x] [Review][Patch] Do not expose repeated non-interactive loading skeleton tiles as focusable accessibility elements [src/features/funeral-home/FuneralHomeHomeScreen.tsx]

## Dev Notes

### Current Source State

- Epic 1 is complete. The app has a role-aware shell, protected route groups, session boot/refresh/logout, account-status fail-closed logic, role-specific tabs, shared settings placeholders, German-first theme/i18n, typed API DTOs, and normalized API result helpers.
- `src/app/(funeral-home)/_layout.tsx` is the protected funeral-home gate. It redirects signed-out users to `/`, renders nothing while session state is booting/offline, and only renders the protected slot when `getRouteAccessDecision(session.session, "funeralHome")` allows it. Preserve this behavior.
- `src/app/(funeral-home)/funeral-home/_layout.tsx` renders `FuneralHomeTabs` from `src/navigation/RoleTabs.tsx`.
- `src/app/(funeral-home)/funeral-home/index.tsx` is already thin and renders `FuneralHomeHomeScreen`.
- `src/features/funeral-home/FuneralHomeHomeScreen.tsx` currently renders `PlaceholderScreen` with `funeralHome:shell.*` translation keys. This is the primary screen to replace.
- `src/features/funeral-home/FuneralHomeDiscoverPlaceholderScreen.tsx` exists and should remain a placeholder unless category selection needs a small copy update.
- `src/services/api/categoriesApi.ts` already calls `GET /api/mobile/categories`, validates the backend envelope with Zod, and returns `AppApiResult<CategoryDto[]>`.
- `src/services/api/schemas.ts` defines `categorySchema` with `id`, `slug`, `nameDe`, `nameEn`, `parentId`, `icon`, `quoteFormSchema`, and `isActive`.
- `src/services/api/apiResult.ts` owns backend-envelope unwrap, normalized failure mapping, and Zod bad-data failures. Do not bypass it from screens.
- `src/services/api/quoteRequestsApi.ts` already has `listFuneralHomeRequests()`, but Story 2.6 owns outgoing request history/detail. Use it only for a narrow home summary if it stays small and does not pull history scope forward.
- `src/i18n/de.ts` and `src/i18n/en.ts` already contain `funeralHome.tabs`, placeholder `funeralHome.shell`, `funeralHome.discover`, `funeralHome.quotes`, and shared settings/legal copy.
- `src/theme/colors.ts` already defines `primary`, `primaryPressed`, `primaryAccent`, `background`, `surface`, `surfaceWarm`, `border`, text colors, and semantic success/warning/danger/info colors. Use these tokens rather than one-off hex values.
- `src/theme/spacing.ts` uses the 8px rhythm with 4px fine adjustments.
- `package.json` does not currently include `@tanstack/react-query`; adding it is expected if this story follows the architecture's server-state plan.

### What This Story Changes

- Converts the funeral-home home placeholder into a real baseline home screen.
- Introduces category discovery on the home screen using the existing `categoriesApi` boundary.
- Establishes the first TanStack Query provider/query-key pattern if it is not already present when implemented.
- Adds a reusable category tile pattern for later Story 2.2 discovery and Story 2.4 RFQ category selection.
- Adds practical request shortcuts or empty-state modules without implementing the request-history story.
- Adds localized loading, empty, error, retry, category tile, and shortcut copy.

### What Must Be Preserved

- Protected funeral-home access must remain fail-closed through `src/app/(funeral-home)/_layout.tsx` and `src/domain/account/accountAccess.ts`.
- Route files remain thin. Do not put API calls, query logic, token reads, or business logic in `src/app/**` route files.
- Token/session material remains behind `src/services/session`; screens and query functions must not read MMKV or decode JWTs.
- API modules own endpoints, parameter names, DTO validation, problem mapping, and normalized result shapes. Screens must not inspect apisauce internals.
- No hard-coded visible strings in screens/components. Use i18n keys for labels, errors, loading text, accessibility labels, and actions.
- German remains the layout stress case. Long labels should wrap/truncate intentionally without overlap.
- Brand red is for primary actions, selected/active states, and brand moments. Do not use it as the generic error/warning/success color.
- Do not introduce a second design system or third-party UI kit.
- Do not edit native `ios/` or `android/` files for this story.
- Do not implement ecommerce/payment/chat/order language or flows, even if backend endpoints exist.

### Architecture Guardrails

- Use feature-oriented placement:
  - Route: `src/app/(funeral-home)/funeral-home/index.tsx`
  - Screen: `src/features/funeral-home/FuneralHomeHomeScreen.tsx`
  - Category UI: `src/features/funeral-home/components/CategoryTile.tsx` or equivalent
  - Query hook: `src/features/funeral-home/hooks/useCategoriesQuery.ts` or equivalent
  - Query service: `src/services/query/*`
  - API: `src/services/api/categoriesApi.ts`
- Use `AppApiResult<T>` as the API boundary. A TanStack query function can throw the normalized `ApiFailure` or map it into a local UI error object, but it must not leak raw response objects.
- Keep a central query-key module from the first query. Suggested key shape: `queryKeys.categories.list()` returning a stable readonly tuple.
- Query defaults should be conservative for mobile: avoid aggressive polling, avoid unnecessary refetch loops, and keep retry behavior compatible with recoverable UI retry.
- If adding React Query focus/reconnect behavior, use documented React Native manager hooks deliberately and add any required Expo dependency explicitly. Do not add `expo-network` just because docs show it unless this story needs online detection.
- Category display should be domain-safe:
  - Active categories only, or inactive categories disabled with clear copy.
  - Localized display name chosen by current app language.
  - Optional visual from `icon` only if it maps safely to an existing icon/fallback. Do not dynamically import arbitrary icon names.
  - Fallback mark may use an initial from the localized label.
  - `quoteFormSchema` remains hidden on this home screen.
- Category press should produce a stable navigation contract for Story 2.2, such as `/funeral-home/discover?categoryId=cat-1`. Do not invent final supplier search behavior here.
- Loading state should use stable placeholder tiles/modules, not a long-lived full-screen spinner.
- Empty/error state should use practical recovery: retry categories, browse later, open Discover placeholder, or open Quotes placeholder depending on state.

### Expected File Changes

Likely NEW files:

```text
src/services/query/QueryProvider.tsx
src/services/query/queryClient.ts
src/services/query/queryKeys.ts
src/services/query/index.ts
src/features/funeral-home/components/CategoryTile.tsx
src/features/funeral-home/hooks/useCategoriesQuery.ts
src/features/funeral-home/FuneralHomeHomeScreen.test.tsx
```

Likely UPDATE files:

```text
package.json
pnpm-lock.yaml
src/app/_layout.tsx
src/features/funeral-home/FuneralHomeHomeScreen.tsx
src/features/funeral-home/FuneralHomeDiscoverPlaceholderScreen.tsx
src/services/api/apiResult.test.ts
src/i18n/de.ts
src/i18n/en.ts
src/i18n/ar.ts
src/i18n/es.ts
src/i18n/fr.ts
src/i18n/hi.ts
src/i18n/ja.ts
src/i18n/ko.ts
test/setup.ts
```

Only update non-primary locale files if the TypeScript `Translations` shape requires forwarding changed namespaces.

### Previous Story Intelligence

- Story 1.7 established nested route folders so authenticated anchors remain `/funeral-home` and `/supplier`. Keep that route shape.
- Story 1.7 review found shared settings needed stricter restricted-account gating; do not add any new side route that lets restricted/wrong-role users perform business actions.
- Story 1.7 review also verified active tab rendering through a temporary active-session fixture because the backend omitted `accountStatus`/`userStatus`. Story 2.1 should plan for the same backend gap during Argent verification.
- Epic 1 retrospective says the code-review loop caught real security/correctness bugs repeatedly. For this story, self-check fail-closed semantics before review: no protected data before role/account gate, no direct token access, no raw backend failure leakage, no hidden business action for restricted users.
- Epic 1 retrospective says iOS runtime verification was unblocked on 2026-05-25 after clean pod reinstall and fresh build. Story 2.1 should be verified with Argent on at least one simulator/emulator and should not claim iOS/Android coverage unless actually exercised.
- Deferred test-quality debt from Story 1.7 remains: hard-coded brand hex in tab tests, duplicated Jest mocks, and i18n mocks that can mask missing translations. Do not worsen this pattern; prefer theme-token assertions and real catalog lookups where practical.

### Git / Risk Intelligence

- Recent commits:
  - `1f50e42 docs: epic 1 retrospective and iOS redbox resolution`
  - `b021d05 fix: address code review for role gate and tab navigation`
  - `547b7c3 feat: add mobile session and role workspaces`
  - `1873786 docs: add Argent verification rule`
  - `be0fe5b feat: complete mobile foundation stories`
- Recent implementation work concentrated in auth/session/gates/navigation/i18n. Most regressions were around fail-closed access, logout/session behavior, and route-gate assumptions. Treat protected UI and data fetches conservatively.
- Repowise index is stale for the current Epic 1 files and could not find several current source paths. Actual source files listed above are the source of truth.
- Translation files are high blast-radius because `TxKeyPath` typing and `Text`/route labels depend on them. Compile plus focused i18n tests are required after adding keys.

### Latest Technical Context

- Current installed stack from `package.json`: Expo `55.0.17`, Expo Router `~55.0.4`, React Native `0.83.6`, React `19.2.0`, React Navigation bottom tabs `^7.2.0`, apisauce `3.1.1`, Zod `4.2.1`, Jest `~29.7.0`, RNTL `^13.2.0`, TypeScript `~5.9.2`.
- TanStack Query official docs identify Query v5 as the latest React docs line, install with `pnpm add @tanstack/react-query`, and state React Query works with React Native. Source: https://tanstack.com/query/latest/docs/framework/react/installation
- TanStack Query's React Native guide documents optional focus/online integration through `focusManager`/`onlineManager`; the online example can use `expo-network`, but this repo does not currently depend on `expo-network`. Add online/focus managers only if the implementation deliberately adds and tests the needed dependency. Source: https://tanstack.com/query/latest/docs/framework/react/react-native
- Expo Router's JavaScript tabs guide says JavaScript tabs are implemented with React Navigation bottom tabs; this matches the current `src/navigation/RoleTabs.tsx` approach. Source: https://docs.expo.dev/router/advanced/tabs
- Expo SDK 55 also includes native tabs, but Expo docs mark native tabs as alpha/beta/API-subject-to-change depending on the SDK docs path. Do not switch the existing JavaScript tabs to native tabs in this story. Source: https://docs.expo.dev/router/advanced/native-tabs/
- React Native Testing Library render docs include async render APIs for newer versions, but the installed RNTL is `13.2.0`; keep tests compatible with the installed API unless the dependency is deliberately upgraded. Source: https://callstack.github.io/react-native-testing-library/docs/api/render

### Project Structure Notes

- The architecture document's ideal tree shows `src/app/(funeral-home)/index.tsx`, but the actual implemented route shape uses `src/app/(funeral-home)/funeral-home/index.tsx` to preserve `/funeral-home`. Follow the source, not the older ideal tree.
- `src/components` is for base Ignite primitives. `CategoryTile` is domain UI and should live under `src/features/funeral-home` until reused broadly.
- `src/services/api` already owns DTOs and endpoint modules. `src/services/query` is the right place for app-level query client and query-key primitives.
- Use `src/domain` only for cross-feature domain/status/schema logic. Do not promote one-screen display helpers there prematurely.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` - Epic 2, Story 2.1 acceptance criteria, FR11-FR12 coverage]
- [Source: `_bmad-output/planning-artifacts/prd.md` - FR11, FR12, FR20, FR22, FR40, NFR1-NFR7, NFR15-NFR21]
- [Source: `_bmad-output/planning-artifacts/architecture.md` - Data Architecture, API & Communication Patterns, Frontend Architecture, Project Structure & Boundaries]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` - Quiet OTTO Native, Category Tile, Search and Filtering Patterns, Loading/Empty/Error States, Responsive Design & Accessibility]
- [Source: `_bmad-output/implementation-artifacts/1-7-role-specific-tabs-and-shared-settings-placeholders.md` - existing route shape, tab patterns, settings/i18n patterns, review findings]
- [Source: `_bmad-output/implementation-artifacts/epic-1-retro-2026-05-25.md` - active-session backend gap, iOS verification status, Epic 2 preparation]
- [Source: `src/app/(funeral-home)/_layout.tsx`, `src/app/(funeral-home)/funeral-home/_layout.tsx`, `src/app/(funeral-home)/funeral-home/index.tsx`]
- [Source: `src/features/funeral-home/FuneralHomeHomeScreen.tsx`, `src/features/funeral-home/FuneralHomeDiscoverPlaceholderScreen.tsx`, `src/features/shared/PlaceholderScreen.tsx`]
- [Source: `src/services/api/categoriesApi.ts`, `src/services/api/quoteRequestsApi.ts`, `src/services/api/apiResult.ts`, `src/services/api/schemas.ts`, `src/services/api/types.ts`]
- [Source: `src/i18n/de.ts`, `src/i18n/en.ts`, `src/theme/colors.ts`, `src/theme/spacing.ts`, `src/navigation/RoleTabs.tsx`]
- [Source: TanStack Query installation docs: https://tanstack.com/query/latest/docs/framework/react/installation]
- [Source: TanStack Query React Native docs: https://tanstack.com/query/latest/docs/framework/react/react-native]
- [Source: Expo Router JavaScript tabs docs: https://docs.expo.dev/router/advanced/tabs]
- [Source: Expo Router native tabs docs: https://docs.expo.dev/router/advanced/native-tabs/]
- [Source: React Native Testing Library render docs: https://callstack.github.io/react-native-testing-library/docs/api/render]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-05-25: Red phase focused tests initially failed for missing query service/hook/screen implementation.
- 2026-05-25: Focused tests passed: `pnpm test src/services/query/queryKeys.test.ts src/features/funeral-home/hooks/useCategoriesQuery.test.tsx src/features/funeral-home/FuneralHomeHomeScreen.test.tsx --runInBand`.
- 2026-05-25: Full validation passed: `pnpm compile`, `pnpm test --runInBand`, `pnpm lint:check`, `pnpm depcruise`.
- 2026-05-25: Argent iOS simulator verification passed on iPhone 16 Pro. Seeded an active funeral-home runtime session through existing session storage/service, verified backend-unavailable error/retry, patched runtime category success with inactive category hidden, category press to Discover, empty state, compact German labels, stable bottom navigation, and no ecommerce/chat/payment language. Temporary simulator session was cleared afterward.
- 2026-05-25: Code-review patches passed: `pnpm compile`, `pnpm test src/services/query/QueryProvider.test.tsx src/services/query/queryKeys.test.ts src/features/funeral-home/hooks/useCategoriesQuery.test.tsx src/features/funeral-home/FuneralHomeHomeScreen.test.tsx --runInBand`, `pnpm test --runInBand`, `pnpm lint:check`, `pnpm depcruise`, and `git diff --check`.
- 2026-05-25: Follow-up Argent iOS simulator verification caught stale category UI after query cache clearing. Updated `QueryProvider` to remount the query subtree on session-scope changes, then reverified success/fallback/inactive filtering, category navigation to Discover, session-scope category refresh, error/retry recovery, and empty state. Temporary simulator session was cleared afterward.
- 2026-05-25: Additional Argent iOS simulator verification passed with the local Next backend running on `localhost:3000`. Verified active funeral-home workspace hydration, real backend category loading, German category tiles, compact bottom navigation, and category press from `Trauerfloristik` into Discover with the category filter preselected.

### Completion Notes List

- Added TanStack Query v5 and a small `src/services/query` foundation with conservative mobile defaults and centralized category query keys.
- Wrapped the app root with `QueryProvider` while preserving the existing theme, keyboard, session, and gate responsibilities.
- Replaced the funeral-home home placeholder with a safe-area-aware category discovery baseline: localized intro, loading placeholders, active category tiles, empty/error/retry states, and request shortcuts.
- Added a domain `CategoryTile` component that uses localized `CategoryDto` display names, hides inactive categories through the screen filter, keeps schema/internal ids out of visible copy, and routes active category selection to Discover with `categoryId` and `categorySlug`.
- Added German-first and English copy for the new home experience and updated Discover placeholder copy to acknowledge category-based discovery remains next.
- Added focused query and screen tests covering query keys/client defaults, normalized category query success/failure, loading, success, empty, error, retry, localization, inactive category hiding, and category navigation.
- Resolved code-review findings by clearing query cache on observed session-scope changes, remounting the query subtree so active observers cannot retain prior-session results, hiding non-interactive loading skeletons from accessibility, and falling back to localized generic category copy when backend category names are blank.

### File List

- `package.json`
- `pnpm-lock.yaml`
- `src/app/_layout.tsx`
- `src/services/query/QueryProvider.tsx`
- `src/services/query/QueryProvider.test.tsx`
- `src/services/query/index.ts`
- `src/services/query/queryClient.ts`
- `src/services/query/queryKeys.ts`
- `src/services/query/queryKeys.test.ts`
- `src/features/funeral-home/FuneralHomeHomeScreen.tsx`
- `src/features/funeral-home/FuneralHomeHomeScreen.test.tsx`
- `src/features/funeral-home/components/CategoryTile.tsx`
- `src/features/funeral-home/hooks/useCategoriesQuery.ts`
- `src/features/funeral-home/hooks/useCategoriesQuery.test.tsx`
- `src/i18n/de.ts`
- `src/i18n/en.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/2-1-funeral-home-home-and-category-discovery-baseline.md`

### Change Log

- 2026-05-25: Implemented Story 2.1 funeral-home home/category discovery baseline and moved story to review.
- 2026-05-25: Resolved code-review findings and moved Story 2.1 to done.
