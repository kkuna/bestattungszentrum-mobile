# Story 1.5: Session Boot, Refresh, and Logout Handling

Status: done

<!-- Completion note: Ultimate context engine analysis completed - comprehensive developer guide created. -->

## Story

As an authenticated user,
I want the app to validate and recover my session automatically,
so that temporary token expiry does not interrupt my work and failed sessions return me to a clear signed-out state.

## Acceptance Criteria

1. Given stored session data exists when the app starts, when boot hydration runs, then the app shows an explicit boot/refresh state instead of briefly rendering the wrong role workspace, and the session is validated before protected routes are shown.
2. Given stored session data is missing, expired beyond recovery, or malformed, when boot hydration completes, then token material is cleared, and the user is routed to the unauthenticated entry state with localized copy where visible.
3. Given an authenticated API request receives a 401 response, when a refresh token is available, then the API layer attempts exactly one refresh, and if refresh succeeds, it stores rotated token data atomically where practical and replays the original request once.
4. Given an authenticated API request receives a 401 response, when refresh fails or the replay also fails, then the app clears local session token material and routes the user to a safe signed-out or account-recovery state without retry loops.
5. Given multiple authenticated requests encounter 401 near the same time, when refresh handling runs, then the app avoids multiple competing refresh writes where practical, and all waiting requests resolve using the final refreshed or signed-out state.
6. Given the app is offline or the backend is unavailable during boot or refresh, when session validation cannot complete, then the user sees a localized recoverable offline/retry state where appropriate, and token and PII details are not exposed.
7. Given focused tests run, when boot hydration, refresh success, refresh failure, replay success, replay failure, malformed storage, and concurrent 401 cases are exercised, then session state transitions and storage mutations are verified.

## Tasks / Subtasks

- [x] Extend session storage/service for refresh and boot validation. (AC: 1, 2, 3, 4, 5, 7)
  - [x] Add a focused `refreshSession` path to `src/services/session/sessionService.ts` that loads the persisted refresh token, calls `authApi.refreshSession`, persists rotated token data through `sessionStorage.saveSession`, and returns a redacted `SessionState`/normalized result without exposing tokens.
  - [x] Preserve the persisted `languagePreference` during refresh-token rotation; do not overwrite it with a default locale.
  - [x] Add expiry helpers that compare `accessTokenExpiresAt` and `refreshTokenExpiresAt` against the current time. Treat missing, malformed, or refresh-expired state as unauthenticated and clear storage.
  - [x] Add a boot validation API such as `hydrateSession` or `validateStoredSession` that returns explicit states for loading/valid/authenticated, signed out, expired, recoverable network failure, and unrecoverable bad data.
  - [x] Validate boot with `authApi.getCurrentUser` only after a stored session passes local schema and refresh-expiry checks. Use the current user response to confirm the token is still accepted; do not decode JWT claims.
- [x] Add single-flight refresh coordination for 401 handling. (AC: 3, 4, 5, 6, 7)
  - [x] Ensure concurrent 401 responses share one in-flight refresh promise instead of each writing new token data.
  - [x] Requests waiting on refresh must resume with the final outcome: replay once after success, or resolve as auth failure after signed-out state.
  - [x] Clear local token material on refresh failure, rejected refresh call, refresh response validation failure, or replay auth failure.
  - [x] Prevent infinite loops with an explicit per-request replay marker such as `__isRetryRequest`, `skipAuthRefresh`, or a local wrapper-level equivalent that is not sent to the backend.
- [x] Implement API-level 401 refresh and replay inside the API boundary. (AC: 3, 4, 5, 6, 7)
  - [x] Update `src/services/api/index.ts` or a focused sibling under `src/services/api` so authenticated requests that receive HTTP 401 can trigger the session refresh service exactly once and replay the original axios request once.
  - [x] Keep refresh handling out of screens, feature components, and route files. Endpoint modules should continue returning normalized `AppApiResult<T>` through `normalizeApiResponse`.
  - [x] Do not attach bearer tokens to auth-optional endpoints: login, refresh, logout, and logout-all must remain able to run with no or stale access token.
  - [x] Replayed requests must use the newly persisted access token from the session boundary, not a token captured before refresh.
  - [x] Preserve existing API problem mapping in `src/services/api/apiProblem.ts`; if replay ultimately fails, endpoint callers should receive a normalized auth/network/server failure, not a raw axios or apisauce object.
- [x] Add app-level session boot state and safe routing. (AC: 1, 2, 4, 6)
  - [x] Add a small session provider or hook under `src/services/session` or `src/features/auth` that exposes boot status, redacted session state, refresh/retry action, and sign-out action to route layouts.
  - [x] Wrap the app in this provider from `src/app/_layout.tsx` after i18n is initialized and before protected route groups render.
  - [x] Show a localized, explicit boot/refresh/loading state while session validation is pending. Do not render funeral-home or supplier placeholder screens until validation completes.
  - [x] Route missing, malformed, refresh-expired, or failed-refresh sessions to the unauthenticated entry route. Use `router.replace`/Expo Router protected-route patterns so the user cannot navigate back into protected placeholders after sign-out.
  - [x] Add a recoverable offline/retry state for boot validation network failures where the stored refresh token is still valid. Do not display raw status codes, tokens, refresh token expiry, email, tenant id, backend payloads, or request bodies.
  - [x] Keep role/account-status branching minimal. This story may route an authenticated session to the current placeholder workspace by role, but Story 1.6 owns full account-status gates, wrong-role blocking, and tenant/account status panels.
- [x] Wire visible logout/sign-out behavior where the current shell can support it cleanly. (AC: 2, 4, 6)
  - [x] If a visible logout control is added, place it in an existing auth/session placeholder or minimal shell area without creating the full shared settings architecture reserved for Story 1.7.
  - [x] Use `sessionService.logout`/provider sign-out only; never clear storage directly from UI components.
  - [x] After logout or logout-all clears local session data, replace navigation with the unauthenticated entry state.
  - [x] Add German and English i18n keys for all visible loading, signed-out, retry, and logout labels.
- [x] Add focused tests. (AC: 1-7)
  - [x] Extend `src/services/session/sessionStorage.test.ts` or add helper tests for expiry behavior, malformed storage cleanup, and refresh-token rotation preserving language.
  - [x] Extend `src/services/session/sessionService.test.ts` for boot hydration with no session, malformed session, access token still valid, access token expired but refresh valid, refresh expired, current-user auth failure, current-user network failure, refresh success, refresh failure, and rejected backend calls.
  - [x] Add API refresh/replay tests proving one refresh attempt, one replay, no refresh for auth-optional endpoints, no infinite retry after replay 401, local clear on refresh failure, and single-flight behavior for concurrent 401s.
  - [x] Add provider/route-level tests for boot loading state, signed-out redirect, authenticated role redirect to existing placeholder workspace, offline retry copy, and logout navigation replacement.
  - [x] Keep assertions redacted: tests may assert token headers where needed inside API boundary tests, but UI/provider snapshots must not expose token values.
- [x] Run quality and runtime verification. (AC: 1-7)
  - [x] Run `pnpm compile`.
  - [x] Run focused Jest tests for `src/services/session`, `src/services/api`, and affected auth route/provider tests.
  - [x] Run `pnpm test --runInBand`.
  - [x] Run `pnpm lint:check`.
- [x] Run `pnpm depcruise`.
- [x] Because this story affects app runtime behavior, navigation, storage/session flow, and API behavior, use Argent simulator/emulator verification. Exercise cold boot with no session, login then app restart/boot validation, expired/forced 401 refresh success if backend/test hooks allow it, refresh failure/sign-out, offline boot or backend-unavailable retry state, and logout navigation. If backend fixture support is unavailable, document the exact blocker and still verify the reachable UI/state transitions in Argent.

### Review Findings

- [x] [Review][Patch] API-triggered refresh failure clears storage without updating provider state [src/services/session/sessionService.ts:222]
- [x] [Review][Patch] Replayed 401 response does not clear local session or force sign-out [src/services/api/index.ts:142]
- [x] [Review][Patch] Recoverable refresh failures during boot can sign the user out instead of showing offline retry [src/services/session/sessionService.ts:127]
- [x] [Review][Patch] Provider logout waits for remote revocation before local signed-out state [src/services/session/sessionProvider.tsx:118]
- [x] [Review][Patch] Login locale persistence falls back for regional language tags [src/features/auth/LoginScreen.tsx:105]
- [x] [Review][Patch] API response transform can reject on refresh/replay exceptions instead of returning a normalized response [src/services/api/index.ts:123]
- [x] [Review][Patch] logoutAll does not clear local token material when remote revocation fails [src/services/session/sessionService.ts:209]

## Dev Notes

### Current Source State

- Story 1.4 created `src/services/session` with a dedicated `MMKV({ id: "session" })` store, persisted session validation, redacted derived session state, login/logout/logout-all service methods, and `getAccessTokenForApi`.
- `src/services/session/sessionStorage.ts` stores `accessToken`, `refreshToken`, absolute `accessTokenExpiresAt`, absolute `refreshTokenExpiresAt`, `userId`, `email`, `role`, `tenantId`, and `languagePreference`. It already clears malformed persisted JSON during `loadSession`.
- `src/services/session/sessionService.ts` currently supports `login`, `getSessionState`, `getAccessTokenForApi`, `clearLocalSession`, `logout`, and `logoutAll`. It does not yet support boot hydration, refresh rotation, current-user validation, or refresh concurrency.
- `src/services/api/authApi.ts` already exposes `authApi.refreshSession({ refreshToken })` and `authApi.getCurrentUser()`, both returning normalized `AppApiResult<T>` through Zod validation.
- `src/services/api/index.ts` currently injects a bearer token through an apisauce request transform and skips stale bearer injection for login, refresh, and logout. It does not yet include logout-all in the auth-optional endpoint set and does not yet handle response-level refresh/replay.
- `src/services/api/apiResult.ts` normalizes apisauce responses into `AppApiResult<T>`, and `apiProblem.ts` maps 401/403 into `auth` or `access-denied` depending on endpoint options. Preserve this boundary.
- `src/app/_layout.tsx` initializes fonts, i18n, date-fns locale loading, theme, keyboard provider, and Reactotron. It currently renders `<Slot />` once fonts/i18n are ready and has no session boot gate.
- `src/app/(auth)`, `src/app/(funeral-home)`, and `src/app/(supplier)` are thin Expo Router groups. Keep route files thin and put session logic in a provider/service.
- `src/features/auth/LoginScreen.tsx` is a real localized credential form that calls `sessionService.login`, blocks duplicate submissions, handles rejected service calls, and persists the active locale.
- German and English translations currently include auth login, placeholders, API errors, funeral-home/supplier placeholder copy, and legal placeholders. New boot/refresh/logout copy must be added to both `src/i18n/de.ts` and `src/i18n/en.ts`.

### What This Story Changes

- Adds explicit boot session hydration so protected placeholders do not flash before auth state is known.
- Adds refresh-token rotation through `authApi.refreshSession`, preserving the session storage boundary and language preference.
- Adds authenticated API 401 recovery: one refresh attempt, one replay, then signed-out fallback if either refresh or replay fails.
- Adds concurrent 401 coordination so multiple requests do not race refresh writes.
- Adds safe navigation replacement to unauthenticated entry after missing, malformed, expired, failed-refresh, or logout states.
- Adds recoverable localized offline/retry boot state when validation cannot complete but the stored refresh token has not expired.

### What Must Be Preserved

- Do not import backend source directly. Use the existing mobile DTOs, schemas, and normalized API layer.
- Do not decode JWT claims. Backend auth uses opaque access tokens; role, tenant, user id, email, and expiry come from auth/current-user responses and persisted session fields only.
- Do not let screens, route files, feature components, Reactotron, or generic storage helpers read token material directly.
- Do not log tokens, passwords, refresh tokens, raw auth payloads, email addresses, tenant ids, request bodies, or backend PII in console, Reactotron, monitors, test output, or error copy.
- Do not introduce TanStack Query for auth boot/refresh. Architecture explicitly keeps auth boot/session refresh outside query so startup remains explicit and predictable.
- Do not implement the full Story 1.6 role/account-status gate in this story. Use only the existing role fields needed to avoid rendering the wrong placeholder workspace after session validation.
- Do not build full Story 1.7 role-specific tabs/settings. Logout controls may be minimal and scoped if needed for verification.
- Do not edit native `ios/` or `android/` files for this story.

### Architecture Guardrails

- Session orchestration belongs in `src/services/session`; API retry/replay belongs in `src/services/api`; route layouts consume provider state and redirect, they do not own token logic.
- The API client may use apisauce/axios config internally, but screens and endpoint modules must keep seeing normalized app results.
- Refresh and replay must be implemented with an explicit loop guard. A replayed request receiving 401 must not attempt refresh again.
- Auth-optional endpoint detection must include `"/api/mobile/auth/logout-all"` in addition to login, refresh, and logout.
- Refresh-token rotation should be as atomic as the current MMKV string write permits: only replace persisted session after the refresh response validates successfully.
- A refresh failure should clear local storage and notify session state subscribers so protected layouts redirect immediately.
- Boot loading and offline states must use localized text and stable layout. Avoid blank screen after splash hide except for the existing font/i18n preload phase.

### Expected File Changes

Likely NEW files:

```text
src/services/session/sessionProvider.tsx
src/services/session/sessionRefreshCoordinator.ts
src/services/session/sessionRefreshCoordinator.test.ts
src/services/session/sessionProvider.test.tsx
src/services/api/apiRefreshReplay.test.ts
```

Likely UPDATE files:

```text
src/app/_layout.tsx
src/app/(auth)/_layout.tsx
src/app/(funeral-home)/_layout.tsx
src/app/(supplier)/_layout.tsx
src/features/auth/LoginScreen.tsx
src/i18n/de.ts
src/i18n/en.ts
src/services/api/index.ts
src/services/api/apiResult.ts
src/services/session/index.ts
src/services/session/sessionService.ts
src/services/session/sessionService.test.ts
src/services/session/sessionStorage.ts
src/services/session/sessionStorage.test.ts
src/services/session/types.ts
```

Only add route-level UI files if needed for a visible boot/offline/logout screen. Prefer a small reusable session status component over duplicating route copy.

### Previous Story Intelligence

- Story 1.1 established route groups and thin route wrappers. Preserve `src/app` as routing only.
- Story 1.2 established German-first theme/i18n. Every new visible string, accessibility label, retry action, and logout label needs `de` and `en` entries.
- Story 1.3 established `authApi`, Zod DTO validation, normalized API results, endpoint-owned problem mapping, and fixture-backed tests. Extend these patterns; do not create a second auth client.
- Story 1.4 established dedicated session MMKV storage, redacted session state, bearer injection, localized login, and safe local clear on logout. Build on these modules rather than replacing them.
- Story 1.4 review specifically fixed brittle auth endpoint matching and singleton bearer injection import-order risk. Preserve those fixes when adding refresh/replay.
- Story 1.4 runtime verification found the local backend may return HTTP 500 for seeded login in some conditions. For this story, distinguish app refresh/logout bugs from backend fixture instability and document backend blockers explicitly.

### Git / Risk Intelligence

- Recent commits are:
  - `1873786 docs: add Argent verification rule`
  - `be0fe5b feat: complete mobile foundation stories`
  - `a71f9f2 docs: refine mobile brand direction`
  - `6800528 docs: add mobile app PRD`
  - `386d806 New Ignite 11.5.0 app`
- Repowise retrieval is stale for the newly added session files because the index predates Story 1.4 source additions. Actual source files are the source of truth.
- Repowise risk flags `src/services/api/index.ts`, `src/utils/storage/index.ts`, and `src/app/_layout.tsx` as stable but test-gapped, with single-owner history. Treat this as security-sensitive because a bad change can leak tokens, block startup, or affect every authenticated request.
- The current worktree already contains Story 1.4 implementation files and sprint-status updates. Do not revert or rewrite unrelated untracked `.agents`, `.codex`, `_bmad-output/research`, or previous-story files.

### Latest Technical Context

- Current installed dependencies include Expo SDK `55.0.17`, Expo Router `~55.0.4`, React Native `0.83.6`, React `19.2.0`, apisauce `3.1.1`, react-native-mmkv `3.3.3`, Zod `4.2.1`, and TypeScript `~5.9.2`.
- Expo Router current auth guidance says routes are always defined and access should be controlled with runtime logic/protected routes, using an auth context/provider and a loading state while session state resolves. Source: https://docs.expo.dev/router/advanced/authentication/
- react-native-mmkv v3 supports multiple storage instances with custom IDs and synchronous JSON string storage; the existing dedicated `MMKV({ id: "session" })` fits this model and keeps token material separate from the Reactotron-attached shared store. Source: https://github.com/mrousavy/react-native-mmkv/blob/main/README_V3.md
- apisauce supports request and async response transforms and returns promise-resolved response objects with `ok`, `problem`, `status`, `data`, and `config`. Use this inside the API boundary only; do not leak apisauce/axios config to screens. Source: https://www.npmjs.com/package/apisauce
- Zod `safeParse` remains the validation pattern for persisted storage, API DTOs, and input DTOs. Continue returning normalized app failures rather than throwing validation errors into UI.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` - Story 1.5 acceptance criteria]
- [Source: `_bmad-output/planning-artifacts/prd.md` - FR5, FR6, NFR10, NFR11, NFR12, NFR13, NFR15, NFR16]
- [Source: `_bmad-output/planning-artifacts/architecture.md` - Authentication & Security, API & Communication Patterns, Service Boundaries, Process Patterns]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` - Role-Gated App Entry, loading/error states, German-first localization and accessibility rules]
- [Source: `_bmad-output/implementation-artifacts/1-4-session-storage-and-auth-api-integration.md` - previous story source state, review findings, and verification notes]
- [Source: `src/services/session/sessionService.ts`, `src/services/session/sessionStorage.ts`, `src/services/session/types.ts`, `src/services/session/accessTokenProvider.ts`]
- [Source: `src/services/api/index.ts`, `src/services/api/authApi.ts`, `src/services/api/apiResult.ts`, `src/services/api/apiProblem.ts`, `src/services/api/schemas.ts`, `src/services/api/types.ts`]
- [Source: `src/app/_layout.tsx`, `src/app/(auth)/_layout.tsx`, `src/app/(funeral-home)/_layout.tsx`, `src/app/(supplier)/_layout.tsx`, `src/features/auth/LoginScreen.tsx`, `src/i18n/de.ts`, `src/i18n/en.ts`]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `pnpm jest src/services/session/sessionService.test.ts src/services/session/sessionProvider.test.tsx src/services/api/apiAuth.test.ts src/services/api/apiRefreshReplay.test.ts src/features/auth/LoginScreen.test.tsx --runInBand`
- `pnpm compile`
- `pnpm lint:check`
- `pnpm depcruise`
- `pnpm test --runInBand`
- Android Argent verification on `emulator-5554`: cold boot without session, protected deep-link redirect to auth entry, login required-field validation, seeded funeral-home login, authenticated app restart hydration, logout navigation, and post-logout restart signed-out state.

### Completion Notes List

- Implemented session boot hydration with explicit boot, authenticated, signed-out, and recoverable offline states.
- Added refresh-token rotation, current-user validation, refresh-expiry handling, single-flight 401 refresh coordination, and one-time request replay inside the API boundary.
- Added app-level `SessionProvider`/`SessionGate`, role-aware route redirects, provider-backed login, and visible logout controls for the current placeholder workspaces.
- Added localized German and English boot/offline/retry/logout copy.
- Added focused session service, provider, API refresh/replay, and login screen tests; full suite passes.
- Code review fixes added session state notifications, replay-401 local clear, recoverable refresh-offline paths, optimistic local logout, logout-all local clear on failure, and API transform exception guards.

### File List

- `_bmad-output/implementation-artifacts/1-5-session-boot-refresh-and-logout-handling.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/app/_layout.tsx`
- `src/app/(auth)/_layout.tsx`
- `src/app/(funeral-home)/_layout.tsx`
- `src/app/(supplier)/_layout.tsx`
- `src/features/auth/LoginScreen.test.tsx`
- `src/features/auth/LoginScreen.tsx`
- `src/features/funeral-home/FuneralHomeHomeScreen.tsx`
- `src/features/supplier/SupplierHomeScreen.tsx`
- `src/i18n/de.ts`
- `src/i18n/en.ts`
- `src/services/api/apiRefreshReplay.test.ts`
- `src/services/api/index.ts`
- `src/services/session/index.ts`
- `src/services/session/sessionProvider.test.tsx`
- `src/services/session/sessionProvider.tsx`
- `src/services/session/sessionService.test.ts`
- `src/services/session/sessionService.ts`
- `src/services/session/types.ts`

## Change Log

- 2026-05-24: Implemented session boot hydration, refresh/replay recovery, route gating, and logout handling; added focused tests and Android Argent verification.
- 2026-05-24: Applied BMad code review fixes for session notification, replay failure cleanup, recoverable refresh failure handling, and local logout safety; re-verified tests and Android runtime flow.
