# Story 1.7: Role-Specific Tabs and Shared Settings Placeholders

Status: review

<!-- Completion note: Ultimate context engine analysis completed - comprehensive developer guide created. -->

## Story

As a signed-in user,
I want role-specific navigation plus shared account and legal screens,
so that I can move through the correct workspace and manage basic app preferences.

## Acceptance Criteria

1. Given an active funeral-home user is signed in, when the app renders the main workspace, then the bottom tabs show localized Home, Discover, Quotes, Profile, and Settings labels, and active navigation uses the brand red active state without relying on color alone.
2. Given an active supplier user is signed in, when the app renders the main workspace, then the bottom tabs show localized Home, Requests, Catalog, Profile, and Settings labels, and funeral-home discovery or RFQ actions are not exposed in supplier navigation.
3. Given shared settings screens are opened, when language, session/security, notifications/preferences placeholder, legal links, error, empty, and offline/retry placeholders render, then each screen uses localized copy, Ignite primitives, safe-area-aware layout, and 48dp touch targets.
4. Given the language switcher is used, when the user selects German or English, then the language preference is persisted through the preferences/session boundary, and navigation labels and placeholder copy update consistently.
5. Given compact phone layouts are tested, when German tab labels, buttons, and placeholders render, then text wraps or truncates intentionally without overlap, clipped controls, or bottom navigation collisions.
6. Given navigation and settings tests run, when role tabs, shared placeholders, language selection, and legal links are exercised, then role-specific navigation and shared-screen behavior are verified.

## Tasks / Subtasks

- [x] Establish role-specific tab route structure without weakening Story 1.6 gates. (AC: 1, 2, 6)
  - [x] Preserve `src/app/(funeral-home)/_layout.tsx` and `src/app/(supplier)/_layout.tsx` as protected role/account gate layouts. They should keep using `getRouteAccessDecision` and must not render protected content for signed-out, restricted, unknown-status, or wrong-role sessions.
  - [x] Convert the current single route files into nested workspace route folders so existing workspace paths continue to work: move or replace `src/app/(funeral-home)/funeral-home.tsx` with `src/app/(funeral-home)/funeral-home/index.tsx`, and `src/app/(supplier)/supplier.tsx` with `src/app/(supplier)/supplier/index.tsx`.
  - [x] Add nested tab layouts at `src/app/(funeral-home)/funeral-home/_layout.tsx` and `src/app/(supplier)/supplier/_layout.tsx` using `Tabs` from `expo-router`.
  - [x] Configure funeral-home tabs: `index`, `discover`, `quotes`, `profile`, `settings`. Keep non-home business tabs as placeholders in this story.
  - [x] Configure supplier tabs: `index`, `requests`, `catalog`, `profile`, `settings`. Supplier navigation must not show funeral-home discover/RFQ labels or actions.
  - [x] Keep route files thin: route files render feature screens/placeholders or tab layouts only. No session token reads, API calls, account-status mapping, or copy literals in route files.
  - [x] Use stable `Tabs.Screen` options with localized `title`/`tabBarLabel` and localized accessibility labels. Use `href: null` only for helper routes that should exist but not appear in tabs.
- [x] Add role workspace placeholder screens and reusable settings primitives. (AC: 1, 2, 3, 5)
  - [x] Keep `FuneralHomeHomeScreen` and `SupplierHomeScreen` as role home screens, but update copy if needed so they match the new tabs and do not imply unavailable business actions are live.
  - [x] Add focused placeholder screens under role feature folders for funeral-home Discover, Quotes, Profile, and Settings, plus supplier Requests, Catalog, Profile, and Settings. Prefer small feature exports over duplicating `PlaceholderScreen` props in routes.
  - [x] Add shared settings UI under `src/features/shared`, for example `SettingsListScreen`, `LanguageSettingsScreen`, `SessionSecurityScreen`, and generic placeholder wrappers if the existing `PlaceholderScreen` is insufficient.
  - [x] Reuse existing Ignite primitives (`Screen`, `Text`, `Button`, existing list/header primitives where suitable) and theme tokens. Do not add a third-party UI kit or new design system.
  - [x] Ensure all actionable rows/buttons have at least 48dp touch targets, localized accessibility labels, and clear pressed/disabled states.
  - [x] Design German labels against compact phones. Long labels must wrap or intentionally truncate; they must not overlap icons, tab items, safe areas, or bottom navigation.
- [x] Implement shared settings and legal placeholder routes. (AC: 3, 4, 6)
  - [x] Keep existing legal routes under `src/app/(shared)/legal/*` and `LegalScreen`; settings should link to these instead of duplicating legal placeholder copy.
  - [x] Add authenticated shared settings routes under `src/app/(shared)/settings/` for language, session/security, notifications/preferences, offline/retry, empty state, and error state placeholders.
  - [x] Do not make `src/app/(shared)/_layout.tsx` globally auth-protected, because public legal routes are also in this group. Settings routes that require sign-in should guard themselves through a shared authenticated-settings component or route-level helper.
  - [x] If a settings route is opened while signed out, redirect to `/`. If a restricted signed-in account opens a settings route, allow language/legal/session management only where safe and avoid rendering role workspace data.
  - [x] Provide visible links from both role-specific Settings tabs to language, session/security, notification/preferences placeholders, and legal placeholders.
  - [x] Session/security settings should expose the existing `signOut` action through `useSession`; do not clear MMKV directly from UI.
- [x] Persist and apply language preference consistently. (AC: 4, 6)
  - [x] Use the existing session storage boundary: `src/services/session/sessionStorage.ts` already exposes `updateLanguagePreference(languagePreference)`.
  - [x] Add a provider/service method such as `updateLanguagePreference` or `changeLanguagePreference` in `src/services/session/sessionProvider.tsx` / `sessionService.ts` so UI does not import `sessionStorage` directly.
  - [x] Call `i18n.changeLanguage("de" | "en")` from the settings flow after persistence succeeds, then update provider session state so tab labels and placeholders refresh without app restart.
  - [x] On boot, honor a persisted authenticated-session `languagePreference` when initializing or hydrating the session. Preserve the existing German default for first launch and signed-out users.
  - [x] Handle persistence failure with localized recoverable copy. Do not log email, tenant id, tokens, or raw session payloads.
  - [x] Keep language support scoped to German and English for this story. Non-primary locale files (`ar`, `es`, `fr`, `hi`, `ja`, `ko`) currently forward English namespaces in places; update them only as needed to keep typed i18n complete.
- [x] Add tab and settings localization. (AC: 1, 2, 3, 4, 5)
  - [x] Add German and English keys for funeral-home tab labels, supplier tab labels, tab accessibility labels, settings section titles, settings row labels, language options, session/security copy, notification placeholder copy, empty/error/offline placeholders, and legal link labels.
  - [x] No visible strings may be hard-coded in JSX. This includes tab labels, route titles, accessibility labels, placeholder body copy, language option labels, sign-out labels, and error/retry text.
  - [x] Use calm, operational German-first copy. Avoid ecommerce, checkout, payment, cart, order, consumer-shopping, chat, supplier self-registration, or admin/back-office language.
  - [x] Keep brand red for active tabs and selected/primary actions only; do not use it as a generic alert color.
- [x] Add focused tests for navigation, settings, and language switching. (AC: 1-6)
  - [x] Extend `src/navigation/routeAccess.test.tsx` or add adjacent route-layout tests for both nested tab layouts. Verify signed-out redirects, role-specific allowed tabs, wrong-role redirects, and restricted account status fallback.
  - [x] Add component tests for the role settings screens and shared settings routes. Assert localized labels and links rather than implementation details.
  - [x] Add language-switch tests proving `de` and `en` update `i18n`, persist through the session/preference boundary, and refresh visible tab/settings copy.
  - [x] Add compact-layout oriented tests where possible using RNTL assertions for long German labels and accessibility labels. Visual overlap still requires Argent verification.
  - [x] Ensure snapshots/logs do not include tokens, emails, tenant ids, backend payloads, request bodies, or raw session JSON.
- [x] Run quality and runtime verification. (AC: 1-6)
  - [x] Run `pnpm compile`.
  - [x] Run focused Jest tests for route layouts, tabs, settings components, language switching, and session preference persistence.
  - [x] Run `pnpm test --runInBand`.
  - [x] Run `pnpm lint:check`.
  - [x] Run `pnpm depcruise`.
  - [x] Because this story affects app runtime behavior, navigation, screens, storage/session flow, and settings UI, use Argent simulator/emulator verification. Exercise active funeral-home tabs, active supplier tabs, wrong-role direct route access, restricted account-status fallback, settings links, legal links, language switch German to English and back, logout from session/security, app restart with persisted language, compact phone German labels, and no console-log leakage.

### Review Findings

- [x] [Review][Patch] Keep logout-all authenticated through the backend contract — the mobile API must send the bearer token to `/api/mobile/auth/logout-all` and `sessionService.logoutAll()` must preserve local token material until the backend call has been attempted, because the backend endpoint authenticates the current user from the access token rather than a refresh-token request body.

## Dev Notes

### Current Source State

- Story 1.6 is in `review` and has already added `src/domain/account/accountAccess.ts`, `AccountStatusPanel`, a shared account-status route, and protected role layouts.
- `src/app/(auth)/_layout.tsx` redirects authenticated sessions through `getWorkspacePathForSession(session.session)`. Current workspace paths are `/funeral-home` and `/supplier`; preserve those paths unless the account access helper is deliberately updated with matching tests.
- `src/app/(funeral-home)/_layout.tsx` and `src/app/(supplier)/_layout.tsx` currently render `Slot` after role/account checks. They are the gate layer and should remain above any nested tab layout.
- Current role workspace routes are single files: `src/app/(funeral-home)/funeral-home.tsx` renders `FuneralHomeHomeScreen`, and `src/app/(supplier)/supplier.tsx` renders `SupplierHomeScreen`.
- Because Expo Router route groups do not add URL segments, adding `src/app/(funeral-home)/index.tsx` would conflict conceptually with the existing unauthenticated root route. Use nested path folders (`funeral-home/` and `supplier/`) for tabbed workspaces so `/funeral-home` and `/supplier` remain the authenticated anchors.
- `src/app/(shared)/_layout.tsx` currently only renders `Slot`. It must stay compatible with public legal routes under `src/app/(shared)/legal/*`.
- `src/app/(shared)/account-status.tsx` handles its own session decision and renders `AccountStatusPanel` for restricted sessions.
- `src/features/shared/PlaceholderScreen.tsx` composes `Screen`, `Text`, `Button`, theme tokens, safe area edges, and localized `tx` keys. Reuse it for placeholders unless settings rows need a more specific layout.
- `src/features/shared/LegalScreen.tsx` already centralizes impressum, privacy, and terms placeholders.
- `src/features/funeral-home/FuneralHomeHomeScreen.tsx` and `src/features/supplier/SupplierHomeScreen.tsx` are localized placeholder screens with visible sign-out actions.
- `src/services/session/sessionProvider.tsx` exposes `session`, `login`, `retryHydration`, and `signOut`, but not a public language/preference update method yet.
- `src/services/session/sessionStorage.ts` stores `languagePreference` and already has `updateLanguagePreference(languagePreference)`, but UI must not import storage directly.
- `src/i18n/index.ts` currently chooses the initial locale with `getInitialLocale(systemLocales)` and defaults to German. It does not yet receive a persisted session language on app boot.
- `src/i18n/de.ts` and `src/i18n/en.ts` already contain auth, role shell, account-status, and legal copy. New tab/settings copy belongs there first.
- Theme tokens already define `colors.primary`, `colors.primaryPressed`, `colors.primaryAccent`, `colors.tint`, `colors.tintInactive`, `colors.background`, `colors.surface`, and semantic status colors. Use these instead of adding one-off colors.

### What This Story Changes

- Replaces each single protected role placeholder route with a role-specific bottom tab workspace while preserving the current `/funeral-home` and `/supplier` anchors.
- Adds localized tabs for funeral-home users: Home, Discover, Quotes, Profile, Settings.
- Adds localized tabs for supplier users: Home, Requests, Catalog, Profile, Settings.
- Adds shared settings placeholders for language, session/security, notification/preferences, legal links, empty, error, and offline/retry states.
- Makes language switching a real user action that persists through the existing session/preference boundary and refreshes visible tab/settings copy.
- Establishes settings navigation patterns that future Epic 2 and Epic 3 screens can extend without changing auth/session gates.

### What Must Be Preserved

- Do not loosen Story 1.6 fail-closed behavior. Wrong-role, restricted, unknown-status, missing tenant, unsupported role, and signed-out access must still block before protected tab content renders.
- Do not render funeral-home discovery/RFQ actions in supplier navigation. Do not render supplier request/catalog actions in funeral-home navigation.
- Do not access MMKV/session token material directly from screens, route files, or settings components.
- Do not decode JWTs. Role, account, tenant, and language decisions must come from validated session/current-user state or the existing session preference boundary.
- Do not add TanStack Query for tab placeholders or language settings. This story is navigation/settings shell work, not fetched server state.
- Do not build real supplier discovery, RFQ creation, supplier inbox, quote response, catalog management, signup submission, payments, chat, ecommerce, or admin workflows.
- Do not edit native `ios/` or `android/` files for this story.
- Do not hard-code final German or English copy in components.

### Architecture Guardrails

- Use Expo Router JavaScript tabs (`Tabs` from `expo-router`) because the installed stack uses Expo Router `~55.0.4` and React Navigation bottom tabs `^7.2.0`, and the product needs localized/custom tab behavior.
- Keep protected route gates above tab navigators: `src/app/(funeral-home)/_layout.tsx` and `src/app/(supplier)/_layout.tsx` should gate, while nested `funeral-home/_layout.tsx` and `supplier/_layout.tsx` should own tabs.
- Use `screenOptions` for shared tab styling: active tint from `theme.colors.tint`/brand red, inactive tint from `theme.colors.tintInactive`, hidden headers where placeholders own their headers, stable tab bar height/padding, and safe area behavior that avoids bottom collisions.
- If icons are added, use an installed/vector icon source already available through the Expo/Ignite stack. Do not manually draw SVG icons and do not add an icon dependency unless the repo lacks a usable one.
- Route files stay Expo Router conventions: `_layout.tsx`, `index.tsx`, `[id].tsx`, and descriptive route filenames. Business logic belongs in feature screens/hooks/domain/session helpers.
- Shared authenticated settings routes should use a small guard/helper instead of globally protecting `(shared)` and breaking public legal routes.
- Language preference behavior belongs behind session/service APIs. If it grows beyond session-scoped preference, introduce `src/services/preferences` deliberately and wire it through tests.
- Settings screens should follow Quiet Ledger/Warm Institutional patterns: calm rows, clear status text, direct next actions, no marketing language.

### Expected File Changes

Likely NEW files:

```text
src/app/(funeral-home)/funeral-home/_layout.tsx
src/app/(funeral-home)/funeral-home/index.tsx
src/app/(funeral-home)/funeral-home/discover.tsx
src/app/(funeral-home)/funeral-home/quotes.tsx
src/app/(funeral-home)/funeral-home/profile.tsx
src/app/(funeral-home)/funeral-home/settings.tsx
src/app/(supplier)/supplier/_layout.tsx
src/app/(supplier)/supplier/index.tsx
src/app/(supplier)/supplier/requests.tsx
src/app/(supplier)/supplier/catalog.tsx
src/app/(supplier)/supplier/profile.tsx
src/app/(supplier)/supplier/settings.tsx
src/app/(shared)/settings/language.tsx
src/app/(shared)/settings/session-security.tsx
src/app/(shared)/settings/notifications.tsx
src/app/(shared)/settings/offline.tsx
src/app/(shared)/settings/empty.tsx
src/app/(shared)/settings/error.tsx
src/features/funeral-home/FuneralHomeDiscoverPlaceholderScreen.tsx
src/features/funeral-home/FuneralHomeQuotesPlaceholderScreen.tsx
src/features/funeral-home/FuneralHomeProfilePlaceholderScreen.tsx
src/features/funeral-home/FuneralHomeSettingsScreen.tsx
src/features/supplier/SupplierRequestsPlaceholderScreen.tsx
src/features/supplier/SupplierCatalogPlaceholderScreen.tsx
src/features/supplier/SupplierProfilePlaceholderScreen.tsx
src/features/supplier/SupplierSettingsScreen.tsx
src/features/shared/LanguageSettingsScreen.tsx
src/features/shared/SessionSecurityScreen.tsx
src/features/shared/SettingsPlaceholderScreen.tsx
```

Likely UPDATE files:

```text
src/app/(funeral-home)/funeral-home.tsx
src/app/(supplier)/supplier.tsx
src/app/(shared)/_layout.tsx
src/features/funeral-home/FuneralHomeHomeScreen.tsx
src/features/supplier/SupplierHomeScreen.tsx
src/features/shared/PlaceholderScreen.tsx
src/i18n/de.ts
src/i18n/en.ts
src/i18n/ar.ts
src/i18n/es.ts
src/i18n/fr.ts
src/i18n/hi.ts
src/i18n/ja.ts
src/i18n/ko.ts
src/i18n/index.ts
src/services/session/index.ts
src/services/session/sessionProvider.tsx
src/services/session/sessionProvider.test.tsx
src/services/session/sessionService.ts
src/services/session/sessionService.test.ts
src/services/session/sessionStorage.test.ts
src/navigation/routeAccess.test.tsx
```

Use judgment when replacing `funeral-home.tsx` and `supplier.tsx`: it is acceptable to delete or turn them into redirects if the nested folder route owns `/funeral-home` and `/supplier`, but preserve tests for the existing workspace paths.

### Previous Story Intelligence

- Story 1.1 established Expo Router route groups and thin route wrappers. Preserve `src/app` as routing/layout only.
- Story 1.2 established German-first theme/i18n. Every tab label, settings row, language option, accessibility label, empty/error/offline message, and legal link label needs `de` and `en`.
- Story 1.3 established handwritten DTOs, Zod validation, normalized API results, endpoint-owned problem mapping, and fixture-backed tests. This story should not touch API contracts except where settings/session tests need existing types.
- Story 1.4 established dedicated MMKV session storage, redacted session state, bearer injection, localized login, and safe local clear on logout.
- Story 1.5 established boot hydration, refresh-token rotation, single-flight 401 refresh/replay, `SessionProvider`, `SessionGate`, provider-backed login, and logout placeholders.
- Story 1.5 review fixes matter here: provider state must update when session data changes, logout clears local state before remote revocation completes, and recoverable boot failures remain retryable.
- Story 1.6 established centralized account access decisions and account status UI. Do not reimplement role/account status logic inside tab layouts or settings screens.
- Story 1.6 Argent verification found the local backend still omitted account status fields, causing real seeded login to fail closed to `Status unbekannt`. For Story 1.7 Argent verification, active role tabs may require seeded backend fixtures that return `accountStatus: ACTIVE` and `userStatus: ACTIVE`; if fixtures still omit those fields, document the backend blocker and verify fail-closed behavior plus route/unit tests for active tabs.

### Git / Risk Intelligence

- Recent commits are:
  - `1873786 docs: add Argent verification rule`
  - `be0fe5b feat: complete mobile foundation stories`
  - `a71f9f2 docs: refine mobile brand direction`
  - `6800528 docs: add mobile app PRD`
  - `386d806 New Ignite 11.5.0 app`
- Repowise risk analysis is partly stale for Story 1.5/1.6-era files, so actual source is the source of truth.
- Repowise flagged translation changes as high blast radius because `src/i18n/en.ts` feeds `src/i18n/index.ts`, `Text`, route screens, and non-primary locale forwarding files. Add translation tests or typed compile coverage for every new key.
- Repowise flagged missing tests around `src/features/funeral-home/FuneralHomeHomeScreen.tsx`, `src/features/supplier/SupplierHomeScreen.tsx`, and non-primary i18n files. Story 1.7 should add focused tests for role placeholder/settings rendering and i18n completeness.
- The worktree already contains user changes from Stories 1.4-1.6. Do not revert unrelated `.agents`, `.codex`, `_bmad-output/research`, source, or sprint-status changes.

### Latest Technical Context

- Installed dependencies from `package.json`: Expo SDK `55.0.17`, Expo Router `~55.0.4`, React Navigation bottom tabs `^7.2.0`, React Native `0.83.6`, React `19.2.0`, react-native-mmkv `3.3.3`, i18next `^23.14.0`, react-i18next `^15.0.1`, and TypeScript `~5.9.2`.
- Expo Router JavaScript tabs are implemented with React Navigation bottom tabs and are configured in a layout file with `Tabs` and `Tabs.Screen`. Source: https://docs.expo.dev/router/advanced/tabs/
- Expo Router's protected-route guidance says inaccessible screens redirect when a guard becomes false, and each screen should exist in only one active route group. This supports keeping gate logic centralized rather than duplicating protected screens across groups. Source: https://docs.expo.dev/router/advanced/protected/
- React Navigation bottom tabs support bottom tab positioning, custom tab bar options, lazy rendering by default, `headerShown`, tab press behavior, and accessibility-related options exposed through screen config. Source: https://reactnavigation.org/docs/bottom-tab-navigator/
- Expo Router native tabs are beta in SDK 55 and API-subject-to-change; do not switch to `expo-router/unstable-native-tabs` for this story unless the team explicitly chooses native-system tabs and accepts the beta risk. Source: https://docs.expo.dev/versions/latest/sdk/router-native-tabs/

### Project Structure Notes

- The architecture document's ideal tree shows `(funeral-home)/index.tsx`, but the actual source uses explicit path segments `funeral-home.tsx` and `supplier.tsx` so authenticated anchors are `/funeral-home` and `/supplier` without colliding with the auth root. Follow the actual source and preserve route behavior.
- `src/components` is for Ignite/base primitives. Domain UI and settings screens belong in `src/features/**` or `src/features/shared`.
- `src/domain/account` already owns account status and route access decisions. Do not create a second navigation access module.
- `src/services/session` owns session and language preference persistence for authenticated users. If a new `src/services/preferences` module is introduced, it must wrap existing MMKV/session behavior and come with tests.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` - Epic 1 sequencing and Story 1.7 acceptance criteria]
- [Source: `_bmad-output/planning-artifacts/prd.md` - FR8, FR9, FR33, NFR1-NFR7, NFR10-NFR14, NFR17-NFR21]
- [Source: `_bmad-output/planning-artifacts/architecture.md` - Authentication & Security, Frontend Architecture, Project Structure & Boundaries, Status Mapping Patterns, Process Patterns]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` - Navigation Patterns, Accessibility and Localization Rules, Responsive Design, Settings/account-state guidance]
- [Source: `_bmad-output/implementation-artifacts/1-6-role-gate-and-account-status-handling.md` - previous story source state, review verification, account access files, and backend fixture limitation]
- [Source: `src/app/(auth)/_layout.tsx`, `src/app/(funeral-home)/_layout.tsx`, `src/app/(supplier)/_layout.tsx`, `src/app/(shared)/account-status.tsx`]
- [Source: `src/app/(funeral-home)/funeral-home.tsx`, `src/app/(supplier)/supplier.tsx`]
- [Source: `src/domain/account/accountAccess.ts`, `src/features/shared/PlaceholderScreen.tsx`, `src/features/shared/LegalScreen.tsx`]
- [Source: `src/services/session/sessionProvider.tsx`, `src/services/session/sessionService.ts`, `src/services/session/sessionStorage.ts`, `src/services/session/types.ts`]
- [Source: `src/i18n/index.ts`, `src/i18n/locale.ts`, `src/i18n/de.ts`, `src/i18n/en.ts`, `src/theme/colors.ts`, `src/theme/typography.ts`]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-05-24T19:40:00+0200: Red-phase focused Jest run failed as expected for missing tab/settings modules and missing language preference service/provider methods.
- 2026-05-24T19:45:00+0200: Focused Jest passed for role tabs, shared settings screens, session service language preference updates, and provider hydration/language behavior.
- 2026-05-24T19:47:00+0200: `pnpm compile` passed after route typing and test mock fixes.
- 2026-05-24T19:48:00+0200: `pnpm lint:check` passed after formatting/display-name fixes.
- 2026-05-24T19:49:00+0200: `pnpm test --runInBand` passed: 19 suites, 142 tests.
- 2026-05-24T19:49:00+0200: `pnpm depcruise` passed: no dependency violations across 201 modules and 522 dependencies.
- 2026-05-24T19:54:00+0200: Android Argent verification on `emulator-5554` with Metro/dev-client and local backend. Verified signed-out entry, seeded funeral-home login fail-closed to `Status unbekannt`, authenticated restricted language settings direct route, German to English and English to German language switching, persisted German after app restart, signed-out settings deep-link redirect, session/security logout, public legal route, and empty JS log registry. Active role tabs remain blocked by the known backend fixture limitation: mobile login/current-user payloads omit `accountStatus` and `userStatus`.
- 2026-05-24T19:55:00+0200: Post-Argent verification re-ran `pnpm compile`, `pnpm test --runInBand`, `pnpm lint:check`, and `pnpm depcruise`; all passed.

### Completion Notes List

- Added nested Expo Router tab workspaces under `/funeral-home` and `/supplier` while preserving the parent role/account gate layouts from Story 1.6.
- Added localized funeral-home tabs (`Start`, `Entdecken`, `Anfragen`, `Profil`, `Einstellungen`) and supplier tabs (`Start`, `Anfragen`, `Katalog`, `Profil`, `Einstellungen`) with role-specific route sets and accessibility labels.
- Added role placeholder feature screens plus shared settings list, language settings, session/security, notification, empty, error, and offline/retry placeholders using existing Ignite primitives and safe-area-aware layouts.
- Added route-level authenticated settings guarding so public legal routes stay public while signed-out settings links redirect to `/`.
- Added session service/provider language preference updates through the existing session storage boundary, and applied persisted language on hydration/restart.
- Added German and English localization for tabs, settings, language options, placeholders, accessibility labels, and legal settings links.
- Added focused tests for role tab layout behavior, settings links, language switching, provider/session service preference persistence, and existing route access gates.
- Argent found and the implementation fixed an Android visual issue where the selected language button could render as a red control without visible text; selected language now uses the existing filled preset.
- Backend fixture limitation remains: active funeral-home/supplier tabs cannot be reached through live login until `/api/mobile/auth/login` and `/api/mobile/auth/me` include active account/user status fields. Unit and route-layout tests cover active tab behavior; Argent verified the real fail-closed runtime path.

### File List

- `_bmad-output/implementation-artifacts/1-7-role-specific-tabs-and-shared-settings-placeholders.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/app/(funeral-home)/funeral-home/_layout.tsx`
- `src/app/(funeral-home)/funeral-home/index.tsx`
- `src/app/(funeral-home)/funeral-home/discover.tsx`
- `src/app/(funeral-home)/funeral-home/quotes.tsx`
- `src/app/(funeral-home)/funeral-home/profile.tsx`
- `src/app/(funeral-home)/funeral-home/settings.tsx`
- `src/app/(funeral-home)/funeral-home.tsx`
- `src/app/(shared)/settings/language.tsx`
- `src/app/(shared)/settings/session-security.tsx`
- `src/app/(shared)/settings/notifications.tsx`
- `src/app/(shared)/settings/offline.tsx`
- `src/app/(shared)/settings/empty.tsx`
- `src/app/(shared)/settings/error.tsx`
- `src/app/(supplier)/supplier/_layout.tsx`
- `src/app/(supplier)/supplier/index.tsx`
- `src/app/(supplier)/supplier/requests.tsx`
- `src/app/(supplier)/supplier/catalog.tsx`
- `src/app/(supplier)/supplier/profile.tsx`
- `src/app/(supplier)/supplier/settings.tsx`
- `src/app/(supplier)/supplier.tsx`
- `src/features/funeral-home/FuneralHomeHomeScreen.tsx`
- `src/features/funeral-home/FuneralHomeDiscoverPlaceholderScreen.tsx`
- `src/features/funeral-home/FuneralHomeQuotesPlaceholderScreen.tsx`
- `src/features/funeral-home/FuneralHomeProfilePlaceholderScreen.tsx`
- `src/features/funeral-home/FuneralHomeSettingsScreen.tsx`
- `src/features/shared/AuthenticatedSettingsRoute.tsx`
- `src/features/shared/LanguageSettingsScreen.tsx`
- `src/features/shared/SessionSecurityScreen.tsx`
- `src/features/shared/SettingsListScreen.tsx`
- `src/features/shared/SettingsPlaceholderScreen.tsx`
- `src/features/shared/SettingsScreens.test.tsx`
- `src/features/supplier/SupplierHomeScreen.tsx`
- `src/features/supplier/SupplierRequestsPlaceholderScreen.tsx`
- `src/features/supplier/SupplierCatalogPlaceholderScreen.tsx`
- `src/features/supplier/SupplierProfilePlaceholderScreen.tsx`
- `src/features/supplier/SupplierSettingsScreen.tsx`
- `src/i18n/de.ts`
- `src/i18n/en.ts`
- `src/navigation/RoleTabs.tsx`
- `src/navigation/roleTabs.test.tsx`
- `src/navigation/routeAccess.test.tsx`
- `src/services/session/sessionProvider.tsx`
- `src/services/session/sessionProvider.test.tsx`
- `src/services/session/sessionService.ts`
- `src/services/session/sessionService.test.ts`
- `src/services/session/types.ts`
- `test/setup.ts`

### Change Log

- 2026-05-24T19:55:19+0200: Implemented role-specific tabs, shared settings placeholders, session-backed language preference updates, localization, focused tests, and Android Argent verification for Story 1.7.
