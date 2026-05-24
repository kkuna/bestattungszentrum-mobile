# Story 1.4: Session Storage and Auth API Integration

Status: done

<!-- Completion note: Ultimate context engine analysis completed - comprehensive developer guide created. -->

## Story

As a returning user,
I want the app to securely remember my authenticated session,
so that I can resume the correct workspace without repeatedly signing in.

## Acceptance Criteria

1. Given the session service layer is inspected, when token and user session persistence is reviewed, then access token, refresh token, expiry, user id, role, tenant id, and language preference are read and written only through a typed session storage boundary, and screens, route files, and feature components do not access MMKV token data directly.
2. Given a user submits valid login credentials, when the mobile login endpoint succeeds, then the app stores the returned session data through the session storage boundary, and the app exposes a derived authenticated session state without exposing raw tokens to UI components.
3. Given the backend uses opaque access tokens, when session data is processed, then the app does not decode JWT claims, and role, tenant, expiry, and user information come only from trusted backend response fields or current-user calls.
4. Given a user requests logout, when logout succeeds or the backend is unreachable, then local session token material is cleared safely, and the user returns to the unauthenticated entry state.
5. Given a user requests logout-all, when the mobile logout-all endpoint succeeds, then local session token material is cleared, and the UI communicates the signed-out state through localized copy.
6. Given development tooling is active, when login, session persistence, logout, or logout-all events are inspected in Reactotron/logs, then tokens and PII are not logged, and only safe diagnostic metadata is emitted.
7. Given focused session tests run, when session save, load, clear, login success, logout, and logout-all paths are exercised, then typed storage behavior and auth API integration are verified.

## Tasks / Subtasks

- [x] Add the typed session storage boundary under `src/services/session`. (AC: 1, 3, 6, 7)
  - [x] Create `src/services/session/types.ts` with persisted and derived session types. Persisted data must include `accessToken`, `refreshToken`, absolute access-token expiry, absolute refresh-token expiry, `userId`, `email`, `role`, `tenantId`, and `languagePreference`.
  - [x] Create `src/services/session/sessionStorage.ts` as the only module that reads/writes token material to MMKV. It should expose typed `saveSession`, `loadSession`, `clearSession`, and `updateLanguagePreference` functions.
  - [x] Validate persisted JSON before use. Malformed, missing, or type-invalid session payloads must be treated as no session and cleared.
  - [x] Convert backend `expiresInSeconds` and `refreshExpiresInSeconds` from `MobileAuthTokensDto` into absolute timestamps at save time. Do not decode token contents.
  - [x] Keep storage keys private to the session module; do not export token key names.
- [x] Prevent token exposure through existing storage/devtools integration. (AC: 1, 6)
  - [x] Do not store token material in the existing shared `storage` instance if it remains attached to Reactotron through `mmkvPlugin` in `src/devtools/ReactotronConfig.ts`.
  - [x] Either use a separate MMKV instance for session data that is not registered with Reactotron, or update Reactotron/MMKV integration so session keys are never visible in development tools.
  - [x] Do not add `console.log`, `Reactotron.log`, monitors, request transforms, or error details that include tokens, email addresses, raw tenant ids, passwords, or request bodies.
- [x] Add the session service integration layer. (AC: 2, 3, 4, 5, 6, 7)
  - [x] Create `src/services/session/sessionService.ts` with `login`, `logout`, `logoutAll`, `getSessionState`, `getAccessTokenForApi`, and `clearLocalSession` or equivalent focused APIs.
  - [x] `login` must call `authApi.login`, save only validated success data, and return a normalized `AppApiResult`-compatible outcome that UI code can consume without raw tokens.
  - [x] `logout` must call `authApi.logout` with the stored refresh token when available, but clear local token material even if the backend is unreachable, times out, or returns a normalized failure.
  - [x] `logoutAll` must call `authApi.logoutAll`, then clear local token material on success. If implementing failure handling, keep the result explicit and do not leave UI in an ambiguous state.
  - [x] Derived authenticated session state may include `isAuthenticated`, `userId`, `email` if needed for display, `role`, `tenantId`, `languagePreference`, and expiry metadata, but must not expose `accessToken` or `refreshToken` to screens/components.
  - [x] Keep boot hydration, refresh-on-401 replay, concurrent refresh coordination, and protected route gates out of this story except for narrow interfaces that Story 1.5 will consume.
- [x] Wire bearer-token injection through the API client boundary. (AC: 1, 2, 3, 6)
  - [x] Update `src/services/api/index.ts` so authenticated endpoint modules can send `Authorization: Bearer <token>` through a central API-client mechanism.
  - [x] The token provider must read through `sessionService`/`sessionStorage`, not directly from screens, route files, feature components, or endpoint modules.
  - [x] Do not add refresh-on-401 retry/replay here; Story 1.5 owns refresh, replay, boot validation, and failed-session routing.
  - [x] Ensure public/auth calls still work without a stored token. Login and refresh must not require an existing access token.
- [x] Replace the login placeholder with a localized credential form and service call. (AC: 2, 3, 6, 7)
  - [x] Update `src/features/auth/LoginScreen.tsx` to collect email and password using existing Ignite primitives and project theme/i18n patterns.
  - [x] Use `sessionService.login` rather than calling `authApi.login` directly from the screen.
  - [x] Show loading and normalized failure states with i18n keys. Do not hard-code visible German or English copy in JSX.
  - [x] On success, store the session and expose authenticated state. If routing is added, keep it minimal and do not implement full role/account-status gates before Story 1.6.
  - [x] Do not log credentials, token payloads, backend raw errors, or PII while debugging form submission.
- [x] Add logout/logout-all entry points only where the existing shell can support them cleanly. (AC: 4, 5, 6)
  - [x] Prefer service-level coverage if the current shared settings/session-security UI is still a placeholder.
  - [x] If visible controls are added, use localized copy, clear local token material through `sessionService`, and route to the unauthenticated entry state after local clear.
  - [x] Do not create a second settings architecture or broad role-tab work; Story 1.7 owns role-specific tabs and shared settings placeholders.
- [x] Add focused tests for storage, service, API-client injection, and login integration. (AC: 1-7)
  - [x] Add `src/services/session/sessionStorage.test.ts` for save/load/clear, language preference update, malformed persisted data, and no direct token-key export.
  - [x] Add `src/services/session/sessionService.test.ts` for login success, login failure, no persistence on failed login, logout success, logout backend failure with local clear, logout-all success, and redacted derived state.
  - [x] Add or update API tests proving authenticated requests receive a bearer header from the session boundary and public login/refresh paths still work without a stored access token.
  - [x] Add or update `LoginScreen` tests for form submission, loading/disabled state, normalized failure display, and successful session-service call without asserting raw token values.
- [x] Run quality and runtime verification. (AC: 1-7)
  - [x] Run `pnpm compile`.
  - [x] Run focused Jest tests for `src/services/session`, `src/services/api`, and `src/features/auth/LoginScreen`.
  - [x] Run `pnpm test --runInBand`.
  - [x] Run `pnpm lint:check`.
  - [x] Run `pnpm depcruise`.
  - [x] Because this story affects runtime auth behavior and UI, use Argent simulator/emulator verification. Exercise login success/failure if a development backend/test account is available; otherwise verify the form, validation/error states, and document the backend-account blocker explicitly.

### Review Findings

- [x] [Review][Patch] API bearer injection depends on importing the session barrel first [src/services/session/index.ts:5]
- [x] [Review][Patch] Logout does not guarantee local clear on thrown backend failure [src/services/session/sessionService.ts:74]
- [x] [Review][Patch] Login submission can get stuck on rejected service calls or rapid repeat presses [src/features/auth/LoginScreen.tsx:21]
- [x] [Review][Patch] Login loading state is not visibly shown or tested [src/features/auth/LoginScreen.tsx:71]
- [x] [Review][Patch] Login always persists the default locale instead of the active locale [src/features/auth/LoginScreen.tsx:30]
- [x] [Review][Patch] Auth endpoint exclusion uses brittle exact URL matching [src/services/api/index.ts:52]
- [x] [Review][Patch] Storage language update depends on object-bound `this` [src/services/session/sessionStorage.ts:93]

## Dev Notes

### Current Source State

- `src/services/api/authApi.ts` already exists from Story 1.3 and exposes `authApi.login`, `authApi.refreshSession`, `authApi.getCurrentUser`, `authApi.logout`, and `authApi.logoutAll`. Each method returns `Promise<AppApiResult<T>>` and validates input/output through Zod schemas before returning normalized results.
- `src/services/api/index.ts` currently constructs a singleton `Api` with an `apisauce` instance, `Config.API_URL`, a 10 second timeout, and only an `Accept: application/json` header. It has no bearer-token provider or request transform yet.
- `src/services/api/apiResult.ts` currently exposes `ApiClientLike` as `Pick<ApisauceInstance, "get" | "post">`; if token injection needs tests around request config, expand the type carefully without leaking apisauce to screens.
- `src/utils/storage/index.ts` exports the starter shared `storage = new MMKV()` plus generic `load`, `save`, `remove`, and `clear` helpers. This generic storage is currently used by Reactotron and must not become the raw token store unless Reactotron exposure is solved.
- `src/devtools/ReactotronConfig.ts` currently attaches the shared `storage` instance using `mmkvPlugin({ storage })`. Storing tokens in that instance would violate the no-token-in-devtools requirement.
- `src/features/auth/LoginScreen.tsx` is still a placeholder using `PlaceholderScreen` with a disabled primary action. This story is the first place where real login form behavior belongs.
- `src/app/_layout.tsx` initializes fonts, i18n, theme, keyboard provider, and Reactotron. It should remain lightweight; do not bury session business logic directly in this route layout.

### What This Story Changes

- Adds the `src/services/session` boundary that owns token persistence, local session state derivation, login/logout orchestration, and API-token access for the API client.
- Connects the existing typed `authApi` methods to persistent session behavior.
- Introduces central bearer-token injection for authenticated API modules.
- Turns login from a disabled placeholder into a service-backed, localized credential flow.
- Leaves session boot validation, refresh-on-401 replay, concurrent refresh coordination, protected route gates, account-status blocking, and role-specific tab routing for Stories 1.5, 1.6, and 1.7.

### What Must Be Preserved

- Do not import code from the sibling backend repo. Use the Story 1.3 DTOs and schemas already present in `src/services/api`.
- Do not decode JWT claims. Backend access tokens are opaque; role, tenant, user, and expiry data come from auth response fields or `/api/mobile/auth/me`.
- Do not let route files, feature screens, or reusable components read MMKV token data directly.
- Do not expose raw apisauce responses to screens. Preserve the `AppApiResult<T>` boundary.
- Do not log tokens, passwords, raw backend auth payloads, email addresses, tenant IDs, or PII in Reactotron/console/errors.
- Do not edit `ios/` or `android/`.
- Do not add Redux/Zustand or a second UI kit for this story. The architecture calls for a small explicit session module unless real complexity proves otherwise.

### Architecture Guardrails

- Session logic belongs in `src/services/session`; only that module may read or write token material.
- `authApi` owns endpoint calls and response validation. `sessionService` owns orchestration and storage decisions.
- API-client bearer injection must be centralized in `src/services/api/index.ts` or a focused sibling inside `src/services/api`; endpoint modules should not each read tokens.
- UI consumes derived state and service results, not raw tokens.
- Use backend DTO field names at the API boundary. Convert only inside explicit mappers or session derivation helpers.
- Language preference should remain typed to supported app locales. Current runtime support is German and English.
- Token persistence should be designed so storage can later move to encrypted MMKV or SecureStore without touching screens.

### Expected File Changes

Likely NEW files:

```text
src/services/session/index.ts
src/services/session/types.ts
src/services/session/sessionStorage.ts
src/services/session/sessionStorage.test.ts
src/services/session/sessionService.ts
src/services/session/sessionService.test.ts
src/features/auth/LoginScreen.test.tsx
```

Likely UPDATE files:

```text
src/services/api/index.ts
src/services/api/apiResult.ts
src/features/auth/LoginScreen.tsx
src/i18n/de.ts
src/i18n/en.ts
src/devtools/ReactotronConfig.ts
```

Only update `src/utils/storage/index.ts` if there is a deliberate shared-storage abstraction change. Prefer keeping token-specific code out of generic storage helpers.

### Previous Story Intelligence

- Story 1.1 established Expo Router groups and thin route files under `src/app/(auth)`, `src/app/(funeral-home)`, `src/app/(supplier)`, and `src/app/(shared)`. Preserve thin route wrappers.
- Story 1.2 established German-first theme/i18n. Add every new visible label, helper, accessibility label, and error state to both `src/i18n/de.ts` and `src/i18n/en.ts`.
- Story 1.3 added the normalized API result boundary, Zod schemas, auth endpoint module, and fixture-backed API tests. Reuse these; do not create a competing auth client.
- Story 1.3 review fixed endpoint ID validation, stricter request schemas, backend envelope handling, and 403 auth/access mapping. Preserve those fixes when touching API helpers.

### Git / Risk Intelligence

- Recent commits are:
  - `1873786 docs: add Argent verification rule`
  - `be0fe5b feat: complete mobile foundation stories`
  - `a71f9f2 docs: refine mobile brand direction`
  - `6800528 docs: add mobile app PRD`
  - `386d806 New Ignite 11.5.0 app`
- Repowise found `src/utils/storage/index.ts`, `src/services/api/index.ts`, and `src/app/_layout.tsx` are stable but have test gaps. Treat the storage/API changes as security-sensitive because mistakes can leak tokens or break auth globally.
- The Repowise index predates Story 1.3 source additions, so it did not know about `src/services/api/authApi.ts` or `src/features/auth/LoginScreen.tsx`; actual source files are the source of truth.

### Latest Technical Context

- Current app dependencies include `react-native-mmkv` `3.3.3`, `apisauce` `3.1.1`, `zod` `4.2.1`, Expo SDK `55.0.17`, React Native `0.83.6`, React `19.2.0`, and TypeScript `~5.9.2`.
- React Native MMKV v3 supports creating storage instances with an `id` and optional `encryptionKey`. Use a dedicated session instance if needed to keep Reactotron from inspecting token keys. Source: react-native-mmkv v3 README, `https://github.com/mrousavy/react-native-mmkv/blob/main/README_V3.md`.
- Apisauce instances support central headers/request transforms and per-request axios config. Keep this detail inside the API layer; screens must not receive apisauce objects. Source: apisauce type definitions/package docs, `https://www.npmjs.com/package/apisauce`.
- Zod 4 `safeParse` returns a success/failure result without throwing. Continue the Story 1.3 pattern for validating persisted session payloads and service inputs. Source: Zod docs, `https://zod.dev/packages/zod`.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` - Story 1.4 acceptance criteria]
- [Source: `_bmad-output/planning-artifacts/prd.md` - FR3, FR4, NFR10, NFR11, NFR15, NFR16]
- [Source: `_bmad-output/planning-artifacts/architecture.md` - Authentication & Security, Service Boundaries, Requirements to Structure Mapping]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` - first login/session flow and German-first UX constraints]
- [Source: `_bmad-output/implementation-artifacts/1-3-typed-api-dtos-and-normalized-api-result-boundary.md` - previous story API/auth handoff]
- [Source: `src/services/api/authApi.ts`, `src/services/api/index.ts`, `src/services/api/apiResult.ts`, `src/utils/storage/index.ts`, `src/devtools/ReactotronConfig.ts`, `src/features/auth/LoginScreen.tsx`]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `pnpm jest src/services/session/sessionStorage.test.ts src/services/session/sessionService.test.ts src/services/api/apiAuth.test.ts src/features/auth/LoginScreen.test.tsx --runInBand` initially failed before implementation, then passed after implementation.
- `pnpm compile` passed.
- `pnpm lint:check` passed after formatting/import-order fixes.
- `pnpm depcruise` passed.
- `pnpm test --runInBand` passed: 12 suites, 70 tests.
- Android Argent verification used `emulator-5554` with Metro/dev-client. Verified the real login form, required-field validation, localized network failure state, and seeded funeral-home login success against the local Next.js backend.
- Code review follow-up passed `pnpm jest src/services/session/sessionStorage.test.ts src/services/session/sessionService.test.ts src/services/api/apiAuth.test.ts src/features/auth/LoginScreen.test.tsx --runInBand`.
- Code review follow-up passed `pnpm compile`, `pnpm lint:check`, `pnpm depcruise`, and `pnpm test --runInBand`: 12 suites, 76 tests.
- Android Argent re-check on `emulator-5554` verified the patched login form and required-field state. The seeded mobile login endpoint returned HTTP 500 from the local backend during the re-check, confirmed by host `curl`, so the app displayed localized server-error feedback.

### Completion Notes List

- Added a `src/services/session` module with dedicated MMKV-backed session storage, persisted payload validation, absolute token expiry timestamps, private storage keys, and redacted derived session state.
- Added `sessionService` orchestration for login, logout, logout-all, local clear, and API-only access-token retrieval without exposing raw tokens to UI consumers.
- Added central API bearer injection through `Api.setAccessTokenProvider`, with login/refresh/logout excluded from stale bearer headers and refresh-on-401 intentionally left for Story 1.5.
- Replaced the login placeholder with a localized German-first credential form that calls `sessionService.login`, handles required fields, loading state, success, and normalized API failure copy.
- Kept logout/logout-all as service-level behavior because the shared settings/session-security UI is still a placeholder and Story 1.7 owns broader settings/tabs work.
- Used a separate `MMKV({ id: "session" })` instance for session data instead of the shared `storage` instance attached to Reactotron.
- Code review follow-up made singleton API bearer injection independent of session-barrel import order, hardened logout local-clear behavior, guarded login submissions, persisted the active locale, normalized auth endpoint matching, and removed object-bound `this` from session storage.

### File List

- `_bmad-output/implementation-artifacts/1-4-session-storage-and-auth-api-integration.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/features/auth/LoginScreen.test.tsx`
- `src/features/auth/LoginScreen.tsx`
- `src/i18n/de.ts`
- `src/i18n/en.ts`
- `src/services/api/apiAuth.test.ts`
- `src/services/api/index.ts`
- `src/services/session/accessTokenProvider.ts`
- `src/services/session/index.ts`
- `src/services/session/sessionService.test.ts`
- `src/services/session/sessionService.ts`
- `src/services/session/sessionStorage.test.ts`
- `src/services/session/sessionStorage.ts`
- `src/services/session/types.ts`

### Change Log

- 2026-05-24: Implemented session storage/auth API integration story, added tests, completed Android Argent verification, and moved story to review.
- 2026-05-24: Completed code review follow-up patches, reran verification, and moved story to done.
