# Story 1.6: Role Gate and Account Status Handling

Status: done

<!-- Completion note: Ultimate context engine analysis completed - comprehensive developer guide created. -->

## Story

As a signed-in user,
I want the app to route me according to my role and account status,
so that I only see workflows I am allowed to use and blocked states are explained clearly.

## Acceptance Criteria

1. Given a valid current-user response identifies an active funeral-home user, when session validation completes, then the user lands in the funeral-home workspace, and protected supplier routes remain inaccessible.
2. Given a valid current-user response identifies an active supplier user, when session validation completes, then the user lands in the supplier workspace, and protected funeral-home routes remain inaccessible.
3. Given the account status is pending approval, pending review, suspended, verification failed, or provider unavailable, when the user attempts to open a restricted business route, then the app shows an Account Status Panel with localized status, explanation, restrictions, next step, and optional contact action, and the user is blocked before filling a business form.
4. Given a wrong-role or unavailable route is opened directly, when the role gate evaluates access, then the route fails closed into a shared account/status or safe fallback screen, and no protected data from the wrong tenant or role is rendered.
5. Given account and route status values are rendered, when badges, panel labels, and accessibility labels are displayed, then centralized status mapping provides the localized label key, semantic tone, and accessibility label, and status meaning does not rely on color alone.
6. Given route-gate tests run, when active, pending, suspended, failed, wrong-role, and unknown-status cases are exercised, then the expected destination, status panel, and access decision are verified.

## Tasks / Subtasks

- [x] Extend current-user/session data so the role gate has account-state inputs. (AC: 1, 2, 3, 4, 6)
  - [x] Confirm the backend shape for `/api/mobile/auth/me`; if it still returns only `id`, `email`, `role`, `tenantId`, and `permissions`, add the narrowest mobile DTO fields needed for account gating only when the backend provides them.
  - [x] Extend `src/services/api/schemas.ts` and `src/services/api/types.ts` for user/account status values needed by the gate. Existing enums include `UserStatusDto` and `AccountStatusDto`; add missing app-level states such as provider unavailable or verification failed as mapped mobile domain statuses, not unchecked backend strings.
  - [x] Extend `src/services/session/types.ts`, `src/services/session/sessionStorage.ts`, and `src/services/session/sessionService.ts` so redacted `AuthenticatedSession` contains the role, tenant id, language preference, and safe account/status fields required for routing.
  - [x] Preserve the typed session boundary: route files, screens, and shared components must not read MMKV or token material directly.
  - [x] Do not decode JWT claims. All role, tenant, account, and user status decisions must come from validated login/current-user responses or explicit persisted session fields.
- [x] Add centralized role/account access decisions. (AC: 1, 2, 3, 4, 5, 6)
  - [x] Add a small domain module, preferably `src/domain/account` or `src/services/session/accountAccess.ts` if the project chooses to keep pre-domain account logic inside session for now.
  - [x] Model normalized account access statuses such as `active`, `pendingApproval`, `pendingReview`, `suspended`, `verificationFailed`, `providerUnavailable`, `closed`, `unknown`, and `wrongRole` where applicable.
  - [x] Export pure helpers that answer: workspace path for active role, whether a route group is allowed, whether a business route is blocked, and what panel/status display should be shown.
  - [x] Treat unknown roles, admin/back-office roles, missing tenant id, missing account status, closed/unavailable states, and unexpected backend values as fail-closed.
  - [x] Keep the role helper that currently defaults non-supplier users to `/funeral-home` from silently allowing `ADMIN`, `SUPER_ADMIN`, `SUPPORT`, or `OPERATOR` into funeral-home UI.
- [x] Implement Account Status Panel and status display mapping. (AC: 3, 5)
  - [x] Add `AccountStatusPanel` under `src/features/shared/components` or a similarly scoped shared feature folder. Do not add domain UI to `src/components`, which is reserved for Ignite/base primitives.
  - [x] Compose existing Ignite primitives (`Screen`, `Text`, `Button`, existing theme tokens) and keep the panel calm, precise, and non-judgmental.
  - [x] Include localized status label, explanation, restrictions, next step, and optional contact action. If no contact action exists yet, render a disabled or secondary localized placeholder only if it helps the user.
  - [x] Add a reusable `StatusBadge` only if this story needs status rendering outside the panel. If added, it must use text plus accessibility labels and semantic tone, never color alone.
  - [x] Add German and English i18n keys for every visible panel label, action, status, restriction, and accessibility label. German is the layout stress case.
- [x] Wire role gates into current Expo Router layouts without moving business logic into routes. (AC: 1, 2, 3, 4, 6)
  - [x] Update `src/services/session/sessionProvider.tsx` and `getWorkspacePathForSession` or replace that helper with the centralized access helper.
  - [x] Update `src/app/(auth)/_layout.tsx` so authenticated users route to the active workspace or account-status fallback based on normalized account access.
  - [x] Update `src/app/(funeral-home)/_layout.tsx` and `src/app/(supplier)/_layout.tsx` so wrong-role, restricted, unknown-status, and unavailable states fail closed before rendering protected route content.
  - [x] Add a shared account-status route if needed, for example under `src/app/(shared)/account-status.tsx`, that renders the account status panel without leaking protected role data.
  - [x] Preserve Story 1.5 boot/offline states. The role gate must not replace the explicit boot/refresh/offline screens or reintroduce a protected-screen flash.
  - [x] Use `Redirect` or `router.replace` consistently so blocked users cannot navigate back into protected placeholders after sign-out or access denial.
- [x] Update current placeholder workspaces to respect account restrictions. (AC: 3, 4, 5)
  - [x] Update `src/features/funeral-home/FuneralHomeHomeScreen.tsx` and `src/features/supplier/SupplierHomeScreen.tsx` only as needed to remove "role gates arrive later" copy and to avoid implying business actions are available for blocked users.
  - [x] Keep Story 1.7 tab/settings work out of scope. This story may add a shared status route and minimal placeholders but must not build full role-specific tabs.
  - [x] Do not expose ecommerce, checkout, payment, cart, order, chat, consumer-family, supplier self-registration, or admin back-office language.
- [x] Add focused route-gate and status tests. (AC: 1-6)
  - [x] Extend `src/services/session/sessionProvider.test.tsx` for active funeral-home, active supplier, pending approval, pending review, suspended, verification failed/provider unavailable, unknown status, and unsupported role decisions.
  - [x] Add pure unit tests for the new access/status mapper covering normalized display metadata, semantic tone, label keys, accessibility label keys, and fail-closed behavior.
  - [x] Add layout-level tests for `(auth)`, `(funeral-home)`, `(supplier)`, and shared account-status route behavior. Mock Expo Router redirects if needed; keep assertions on destinations and rendered localized status text.
  - [x] Ensure UI/provider snapshots or logs do not expose access tokens, refresh tokens, email addresses, tenant ids, backend payloads, or request bodies.
- [x] Run quality and runtime verification. (AC: 1-6)
  - [x] Run `pnpm compile`.
  - [x] Run focused Jest tests for session provider, account access/status mapping, and route layouts.
  - [x] Run `pnpm test --runInBand`.
  - [x] Run `pnpm lint:check`.
  - [x] Run `pnpm depcruise`.
  - [x] Because this story affects app runtime behavior, navigation, session flow, and route access, use Argent simulator/emulator verification. Exercise active funeral-home routing, active supplier routing, direct wrong-role route access, restricted account status panel, unknown/unavailable fallback if fixtures allow it, logout/sign-out return to auth, and app restart after an authenticated session.

### Review Findings

- [x] [Review][Patch] Align verification-failed status with the backend mobile contract [`src/services/api/schemas.ts:19`] — Story 1.6 requires a verification-failed blocked state, but the mobile DTO models `VERIFICATION_FAILED` as an `accountStatus` value while the backend `AccountStatus` and OpenAPI mobile contract only expose `PENDING_REVIEW`, `PENDING_APPROVAL`, `ACTIVE`, `SUSPENDED`, and `CLOSED`; backend verification failure is represented separately as `verificationStatus: "FAILED"`. The current tests therefore cover an impossible backend account-status value, and a real failed verification cannot reach the `verificationFailed` panel unless the backend mobile auth/current-user contract is expanded or the mobile mapper accepts and maps backend verification status.

#### Review pass 2026-05-24 (CR: Blind Hunter + Edge Case Hunter + Acceptance Auditor)

- [x] [Review][Patch] Status precedence: `verificationStatus` outranks `userStatus` and `accountStatus` — In `normalizeAccountAccess` the checks run verification → user → account, so a session that is both `verificationStatus: "FAILED"` and `accountStatus: "SUSPENDED"` reports `verificationFailed` (never `suspended`), and `verificationStatus: "UNVERIFIED"` collapses into the same `pendingReview` copy as `accountStatus: "PENDING_REVIEW"`. [`src/domain/account/accountAccess.ts:131-149`] → **Resolved (reviewer discretion):** replace first-match-by-field with explicit severity-priority selection so the most restrictive applicable status wins (`suspended`/`closed` > `verificationFailed` > `providerUnavailable` > `pendingReview` > `pendingApproval`), making the outcome order-independent. Keep `UNVERIFIED → pendingReview` (shared "still under review" semantics).
- [x] [Review][Patch] Inconsistent fail-open vs fail-closed for unrecognized status enum values [`src/domain/account/accountAccess.ts:131-147`] — `accountStatusMap[session.accountStatus] ?? "unknown"` fails closed on an unrecognized value, but `verificationStatusMap[session.verificationStatus]` and `userStatusMap[session.userStatus]` return `undefined` for out-of-enum values and the `if (...)` guards skip them (fail-open past those checks). A persisted/legacy session carrying a corrupt `verificationStatus`/`userStatus` but a valid `ACTIVE` accountStatus would be treated as active. Make all three maps fail closed consistently (treat an unrecognized verification/user status as a blocked `unknown` state).
- [x] [Review][Patch] Role-gate layouts fail open to `<Slot />` for non-authenticated, non-signedOut states [`src/app/(funeral-home)/_layout.tsx:21`, `src/app/(supplier)/_layout.tsx:22`] — The layouts only branch on `signedOut` and `authenticated`; any other `SessionControllerState` (`booting`, `offline`) falls through to `return <Slot />`, rendering protected content. This is safe today only because the global `SessionGate` intercepts `booting`/`offline` before routes render. Defense-in-depth: the gate layout default should be fail-closed (render `null`/redirect) for any status that is not an allowed `authenticated` session.

## Dev Notes

### Current Source State

- Story 1.5 wrapped the app in `SessionProvider` and `SessionGate` from `src/app/_layout.tsx`. Font and i18n preload still happen before session boot; preserve that order.
- `src/services/session/sessionProvider.tsx` currently exposes session statuses `booting`, `signedOut`, `offline`, and `authenticated`, plus `login`, `retryHydration`, and `signOut`.
- `SessionGate` currently renders localized boot and offline placeholder screens and otherwise passes children through. It does not yet evaluate account status.
- `getWorkspacePathForSession` currently returns `/supplier` only for `SUPPLIER_USER` and defaults every other authenticated role to `/funeral-home`. This is not safe for admin/support/operator/unknown-role routing and must be replaced or tightened.
- `src/app/(auth)/_layout.tsx` redirects any authenticated session to `getWorkspacePathForSession(session.session)`.
- `src/app/(funeral-home)/_layout.tsx` redirects signed-out users to `/` and supplier users to `/supplier`, then renders the protected slot.
- `src/app/(supplier)/_layout.tsx` redirects signed-out users to `/` and any non-supplier authenticated role to `/funeral-home`, then renders the protected slot.
- `src/features/funeral-home/FuneralHomeHomeScreen.tsx` and `src/features/supplier/SupplierHomeScreen.tsx` are localized placeholder screens with visible sign-out actions.
- `src/features/shared/PlaceholderScreen.tsx` already composes `Screen`, `Text`, `Button`, theme tokens, safe areas, and localized `tx` keys. It can be reused or split if an account panel needs more semantic structure.
- `src/services/api/authApi.ts` exposes `getCurrentUser()`, which validates with `currentUserSchema`.
- `src/services/api/schemas.ts` currently defines `currentUserSchema` as `authUserSchema.extend({ permissions: z.array(z.string()) })`. `authUserSchema` includes `id`, `email`, `role`, and `tenantId`, but no account status yet.
- `src/services/api/types.ts` already includes `UserRoleDto`, `UserStatusDto`, and `AccountStatusDto`. Current role values include funeral-home, supplier, and back-office roles.
- `src/services/session/sessionStorage.ts` persists token material plus `userId`, `email`, `role`, `tenantId`, and `languagePreference` in a dedicated `MMKV({ id: "session" })` instance.
- German and English translations currently include auth/session boot/offline/logout copy and placeholder funeral-home/supplier shell copy. New account/status copy must be added to both `src/i18n/de.ts` and `src/i18n/en.ts`.
- There is no `src/domain` directory yet. If added, keep it focused on pure domain types/mappers and update dependency-cruiser only if existing rules require it.

### What This Story Changes

- Converts role routing from the current "supplier vs everyone else" helper into an explicit, fail-closed role/account access decision.
- Carries safe account status from the validated auth/current-user boundary into redacted session state where needed.
- Adds a shared Account Status Panel for pending approval, pending review, suspended, verification failed, provider unavailable, wrong-role, closed, unknown, and unavailable states.
- Blocks wrong-role and restricted-account access before protected workspace placeholders or future business forms render.
- Establishes centralized status display metadata for account and route-gate states: raw value, normalized status, localized label key, semantic tone, and accessibility label key.

### What Must Be Preserved

- Do not import backend source directly. Mobile DTOs and schemas remain handwritten in this repo.
- Do not access token material outside `src/services/session` and `src/services/api` integration points.
- Do not log PII, tokens, tenant ids, raw current-user payloads, request bodies, or backend-sensitive account data in console, Reactotron, tests, error copy, or debug output.
- Do not introduce TanStack Query for auth boot or role-gate evaluation. Architecture keeps auth boot/session refresh explicit and outside server-state query.
- Do not build Story 1.7's bottom tabs/settings or later business screens in this story.
- Do not edit `ios/` or `android/` files for this story.
- Do not render protected route children during boot/offline states or before account/role access is known.
- Do not show raw backend enum strings to users. Map all statuses through domain/i18n helpers.

### Architecture Guardrails

- Route files stay thin. Route layouts can call session/access hooks and redirect or render a shared panel, but business/account logic belongs in session/domain helpers and shared feature components.
- Wrong-role, admin/back-office, missing-tenant, unknown-status, closed, provider-unavailable, and unexpected backend values must fail closed.
- Deep links and direct route opens must resolve through auth and role/account gates before protected content renders.
- Account status UI must use semantic tone and text, not color alone. Brand red remains for brand/primary action/active states, not as the generic warning/error color.
- Account Status Panel belongs in `src/features/shared` or a feature-level shared component folder. `src/components` should remain base Ignite primitives.
- Use existing theme tokens and Ignite primitives first. Do not add a third-party UI kit.
- All visible strings, button labels, status text, accessibility labels, and errors must resolve through i18n keys.
- German copy is the layout stress case. Account panels need long-label tolerance on compact phones.

### Expected File Changes

Likely NEW files:

```text
src/domain/account/accountAccess.ts
src/domain/account/accountAccess.test.ts
src/domain/account/accountStatus.ts
src/features/shared/components/AccountStatusPanel.tsx
src/features/shared/components/AccountStatusPanel.test.tsx
src/app/(shared)/account-status.tsx
```

Likely UPDATE files:

```text
src/app/(auth)/_layout.tsx
src/app/(funeral-home)/_layout.tsx
src/app/(supplier)/_layout.tsx
src/features/funeral-home/FuneralHomeHomeScreen.tsx
src/features/supplier/SupplierHomeScreen.tsx
src/i18n/de.ts
src/i18n/en.ts
src/services/api/authApi.ts
src/services/api/schemas.ts
src/services/api/types.ts
src/services/session/index.ts
src/services/session/sessionProvider.test.tsx
src/services/session/sessionProvider.tsx
src/services/session/sessionService.test.ts
src/services/session/sessionService.ts
src/services/session/sessionStorage.test.ts
src/services/session/sessionStorage.ts
src/services/session/types.ts
```

Only add `src/domain` if it remains pure and useful. If dependency-cruiser blocks the new directory, either update the rule deliberately with rationale or keep the pure access helper under `src/services/session` for this story and move to `src/domain` when domain modules are formally introduced.

### Previous Story Intelligence

- Story 1.1 established Expo Router route groups and thin route wrappers. Preserve `src/app` as routing/layout only.
- Story 1.2 established German-first theme/i18n. Every new visible status label, panel body, restriction, next-step, contact action, and accessibility label needs `de` and `en`.
- Story 1.3 established handwritten DTOs, Zod validation, normalized API results, endpoint-owned problem mapping, and fixture-backed tests. Extend those patterns instead of creating a second account/current-user client.
- Story 1.4 established dedicated MMKV session storage, redacted session state, bearer injection, localized login, and safe local clear on logout.
- Story 1.5 established boot hydration, refresh-token rotation, single-flight 401 refresh/replay, `SessionProvider`, `SessionGate`, provider-backed login, and logout placeholders.
- Story 1.5 review fixes matter for this story: provider state must update when API refresh clears session, replay 401 must clear local session, recoverable boot failures should remain retryable, and logout must clear local state before remote revocation completes.
- Story 1.5 Argent verification covered Android cold boot without session, protected deep-link redirect to auth entry, login required-field validation, seeded funeral-home login, authenticated restart hydration, logout navigation, and post-logout restart signed-out state. Story 1.6 should extend this runtime verification to role/account gate cases.

### Git / Risk Intelligence

- Recent commits are:
  - `1873786 docs: add Argent verification rule`
  - `be0fe5b feat: complete mobile foundation stories`
  - `a71f9f2 docs: refine mobile brand direction`
  - `6800528 docs: add mobile app PRD`
  - `386d806 New Ignite 11.5.0 app`
- Repowise retrieval for this exact area was weak and returned theme/component guesses, so do not rely on the index for Story 1.5-era session files. Actual source files listed above are the source of truth.
- This story is security-sensitive because incorrect routing can expose wrong-role screens, leak tenant context, or allow future business forms to render before account restrictions are known.
- Treat route/layout changes as runtime behavior changes requiring Argent verification under the project AGENTS.md rule.

### Latest Technical Context

- Installed dependencies from `package.json`: Expo SDK `55.0.17`, Expo Router `~55.0.4`, React Native `0.83.6`, React `19.2.0`, apisauce `3.1.1`, react-native-mmkv `3.3.3`, Zod `4.2.1`, and TypeScript `~5.9.2`.
- Expo Router current authentication guidance says routes are always defined and access is controlled with runtime logic/protected routes; protected screens redirect when access changes, and auth state is commonly exposed through a React context provider. Source: https://docs.expo.dev/router/advanced/authentication/
- react-native-mmkv v3 supports multiple storage instances, synchronous reads/writes, and custom IDs; the existing dedicated session instance matches this model. It also requires the React Native new architecture for v3, which this repo already uses through the current Ignite/Expo foundation. Source: https://github.com/mrousavy/react-native-mmkv/blob/main/README_V3.md
- apisauce responses consistently expose `ok`, `problem`, `status`, `data`, `headers`, and `config`, and request/response transforms can mutate global request/response handling. Keep this inside `src/services/api`; screens should consume normalized `AppApiResult<T>`. Source: https://www.npmjs.com/package/apisauce
- Zod 4 `z.enum` is the right way to validate fixed string status/role values. For externally declared arrays use `as const` or inline arrays so TypeScript inference remains narrow. Source: https://zod.dev/api

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` - Story 1.6 acceptance criteria and Epic 1 sequencing]
- [Source: `_bmad-output/planning-artifacts/prd.md` - FR6, FR7, FR8, FR9, FR10, NFR6, NFR10, NFR12, NFR13]
- [Source: `_bmad-output/planning-artifacts/architecture.md` - Authentication & Security, Frontend Architecture, Status Mapping Patterns, API/Service Boundaries]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` - Role-Gated App Entry, Account Status Panel, Navigation Patterns, accessibility guidelines]
- [Source: `_bmad-output/implementation-artifacts/1-5-session-boot-refresh-and-logout-handling.md` - previous story source state, review findings, and verification notes]
- [Source: `src/app/_layout.tsx`, `src/app/(auth)/_layout.tsx`, `src/app/(funeral-home)/_layout.tsx`, `src/app/(supplier)/_layout.tsx`]
- [Source: `src/services/session/sessionProvider.tsx`, `src/services/session/sessionService.ts`, `src/services/session/sessionStorage.ts`, `src/services/session/types.ts`]
- [Source: `src/services/api/authApi.ts`, `src/services/api/schemas.ts`, `src/services/api/types.ts`, `src/services/api/index.ts`]
- [Source: `src/features/shared/PlaceholderScreen.tsx`, `src/features/funeral-home/FuneralHomeHomeScreen.tsx`, `src/features/supplier/SupplierHomeScreen.tsx`, `src/i18n/de.ts`, `src/i18n/en.ts`]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-05-24T18:42:27+0200: Story moved to in-progress in sprint tracking.
- 2026-05-24T18:49:00+0200: Red/green focused tests added for API DTO status fields, session persistence, current-user account snapshot hydration, account access decisions, account status panel rendering, and route layout redirects.
- 2026-05-24T18:55:00+0200: Focused Jest suite passed: `pnpm test --runInBand src/domain/account/accountAccess.test.ts src/features/shared/components/AccountStatusPanel.test.tsx src/navigation/routeAccess.test.tsx src/services/session/sessionProvider.test.tsx src/services/session/sessionStorage.test.ts src/services/session/sessionService.test.ts src/services/api/apiResult.test.ts`.
- 2026-05-24T18:58:00+0200: Static checks passed: `pnpm compile`, `pnpm test --runInBand`, `pnpm lint:check`, `pnpm depcruise`.
- 2026-05-24T18:59:00+0200: Argent Android verification found `src/app/routeAccess.test.tsx` was being bundled as an Expo Router route; moved the test to `src/navigation/routeAccess.test.tsx`, then re-ran compile, full Jest, lint, and depcruise successfully.
- 2026-05-24T19:01:00+0200: Argent Android verification on `emulator-5554` with real local backend: signed-out protected deep link redirects to auth entry; seeded funeral-home login succeeds but fails closed to `Status unbekannt` because `/api/mobile/auth/login` and `/api/mobile/auth/me` still omit `accountStatus` and `userStatus`; direct protected supplier/funeral-home deep links remain blocked on account status; app restart preserves account-status fallback; logout returns to auth entry; JS log registry showed no app console logs.
- 2026-05-24T19:21:00+0200: Code review fixes applied: sparse current-user snapshots now preserve previously persisted account/user status, tenantless back-office DTO/session payloads remain parseable so role gates can fail closed, and regression tests were added.
- 2026-05-24T19:24:00+0200: Post-review verification passed: `pnpm compile`, `pnpm test --runInBand`, `pnpm lint:check`, `pnpm depcruise`; Argent Android smoke verified login fail-closed status fallback, blocked supplier deep link, restart persistence, logout to auth, and no app console logs.

### Completion Notes List

- Extended mobile auth/current-user schemas with optional validated `accountStatus` and `userStatus`; malformed/unchecked values are rejected at the API and persisted-session boundaries.
- Extended persisted/redacted sessions with safe account fields and added `updateAccountSnapshot()` so successful `/api/mobile/auth/me` validation refreshes role, tenant, account status, and user status without exposing token material outside the session boundary.
- Preserved previously known account/user status when `/api/mobile/auth/me` omits those optional fields during a gradual backend rollout.
- Allowed tenantless back-office current-user/session payloads through validation so the centralized account access mapper, not DTO parsing, performs the intended fail-closed wrong-role handling.
- Added pure account access helpers under `src/domain/account` for role group mapping, active workspace paths, business-route blocking, fail-closed route decisions, and localized display metadata.
- Added shared `AccountStatusPanel` with German/English copy for active, pending approval, pending review, suspended, verification failed, provider unavailable, closed, unknown, and wrong-role states. Status meaning is shown through text and accessibility labels, not color alone.
- Wired `(auth)`, `(funeral-home)`, `(supplier)`, and `(shared)/account-status` routes to the centralized access decision logic. Active wrong-role protected deep links redirect to the user's safe workspace; restricted, unknown, unsupported, or missing-status sessions redirect to account status.
- Updated non-primary locale catalogs to forward the English account-status namespace so typed i18n remains complete.
- Backend fixture limitation: the running local backend currently returns only `id`, `email`, `role`, `tenantId`, and `permissions` for `/api/mobile/auth/me`, and login user payloads also omit account status fields. Argent therefore verified the real fail-closed fallback; active funeral-home/supplier workspace routing is covered by mapper/layout tests until backend fixtures expose `accountStatus`/`userStatus`.

### File List

- `_bmad-output/implementation-artifacts/1-6-role-gate-and-account-status-handling.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/app/(auth)/_layout.tsx`
- `src/app/(funeral-home)/_layout.tsx`
- `src/app/(shared)/account-status.tsx`
- `src/app/(supplier)/_layout.tsx`
- `src/domain/account/accountAccess.test.ts`
- `src/domain/account/accountAccess.ts`
- `src/features/shared/components/AccountStatusPanel.test.tsx`
- `src/features/shared/components/AccountStatusPanel.tsx`
- `src/i18n/ar.ts`
- `src/i18n/de.ts`
- `src/i18n/en.ts`
- `src/i18n/es.ts`
- `src/i18n/fr.ts`
- `src/i18n/hi.ts`
- `src/i18n/ja.ts`
- `src/i18n/ko.ts`
- `src/navigation/routeAccess.test.tsx`
- `src/services/api/apiResult.test.ts`
- `src/services/api/schemas.ts`
- `src/services/api/types.ts`
- `src/services/session/index.ts`
- `src/services/session/sessionProvider.test.tsx`
- `src/services/session/sessionProvider.tsx`
- `src/services/session/sessionService.test.ts`
- `src/services/session/sessionService.ts`
- `src/services/session/sessionStorage.test.ts`
- `src/services/session/sessionStorage.ts`
- `src/services/session/types.ts`

### Change Log

- 2026-05-24: Implemented role gate and account status handling; story moved to review.
- 2026-05-24: Fixed review findings for sparse current-user status preservation and tenantless back-office fail-closed routing.
