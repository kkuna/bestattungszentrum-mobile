# Story 1.3: Typed API DTOs and Normalized API Result Boundary

Status: done

<!-- Completion note: Ultimate context engine analysis completed - comprehensive developer guide created. -->

## Story

As a mobile developer,
I want a typed mobile API boundary with normalized result shapes,
so that authentication and future feature screens can consume backend responses safely without leaking apisauce or backend implementation details.

## Acceptance Criteria

1. Given the mobile API service layer is inspected, when core API types are reviewed, then DTOs exist for mobile auth tokens, current user, category, supplier, supplier item, quote request, quote response, request timeline event, funeral-home signup input, create quote request input, create quote response input, and API error, and DTOs are defined in the mobile repo without importing backend source across repositories.
2. Given API modules return responses to features or hooks, when a success response is mapped, then it returns a normalized success shape such as `{ ok: true, data }`, and screens do not need to inspect raw apisauce response objects.
3. Given API modules encounter backend, network, timeout, validation, auth, or unknown failures, when the failure is mapped, then it returns a normalized failure shape with problem, optional status, localized message key, and optional details, and no final German or English error copy is hard-coded in the API layer.
4. Given backend status and enum values are received, when they are exposed to UI consumers, then raw backend values remain at the API boundary until explicit domain/status mappers convert them, and status display concerns are kept out of route files and basic API functions.
5. Given API fixture tests are run, when representative success and failure fixtures are mapped, then the normalized result shape, DTO mapping, and problem mapping are covered by focused tests.
6. Given future API modules are added, when their implementation is reviewed, then they follow the same normalized result pattern, and endpoint paths, backend parameter naming, DTOs, response mapping, and problem mapping stay owned by API modules.

## Tasks / Subtasks

- [x] Replace Ignite starter API sample types with Bestattungszentrum API boundary types. (AC: 1, 4)
  - [x] Remove RSS feed sample DTOs from `src/services/api/types.ts`.
  - [x] Define `ApiSuccess<T>`, `ApiFailure`, `AppApiResult<T>`, `ApiProblem`, and backend error payload DTOs in `src/services/api/types.ts` or a focused sibling module.
  - [x] Define handwritten DTOs for auth token response, login/refresh/logout inputs, current user, category, supplier, supplier item, quote request, quote response, request timeline event, funeral-home signup input/result, create quote request input, create quote response input, document asset, and API error.
  - [x] Preserve backend field names in DTOs. Do not convert enum/status strings in DTO definitions.
- [x] Add response normalization helpers around apisauce. (AC: 2, 3, 6)
  - [x] Add a shared helper that unwraps backend `{ data: ... }` success envelopes into `{ ok: true, data }`.
  - [x] Map apisauce `CONNECTION_ERROR`, `NETWORK_ERROR`, `TIMEOUT_ERROR`, `SERVER_ERROR`, `CLIENT_ERROR`, `UNKNOWN_ERROR`, and `CANCEL_ERROR` into app `ApiProblem` values.
  - [x] Map backend `{ error: { code, message, issues? } }` payloads into failure details without exposing final display copy.
  - [x] Include localized `messageKey` values typed as `TxKeyPath`; add required German/English API error translation keys if they do not already exist.
  - [x] Treat auth failures defensively: backend may currently return `403 FORBIDDEN` for missing/invalid bearer, not only `401`.
- [x] Introduce runtime validation for critical DTO boundaries. (AC: 1, 3, 5)
  - [x] Add `zod` to the Expo app dependencies if not already present.
  - [x] Use Zod schemas for critical responses and inputs: auth token response, current user, category, supplier, quote request, quote response, timeline event, signup input/result, create quote request input, create quote response input, and backend error payload.
  - [x] Use `safeParse`/equivalent validation for API response data so malformed payloads become normalized `bad-data` failures.
  - [x] Keep `quoteFormSchema` and quote request `attributes` as `Record<string, unknown>` in this story; do not invent a stricter dynamic form schema before the renderer story.
- [x] Add initial domain API modules without implementing session orchestration. (AC: 2, 3, 6)
  - [x] Add `src/services/api/authApi.ts` with typed methods for login, refresh, current user, logout, and logout-all.
  - [x] Add skeleton typed API modules for `categoriesApi`, `suppliersApi`, `quoteRequestsApi`, `quoteResponsesApi`, `timelineApi`, and `signupApi` with endpoint paths, DTO imports, and normalized return types.
  - [x] Keep modules thin and focused on endpoint paths, backend parameter names, validation, response mapping, and problem mapping.
  - [x] Do not implement token storage, refresh-on-401 replay, route gates, TanStack Query hooks, or UI flows in this story.
- [x] Align API client configuration with Bestattungszentrum backend URLs. (AC: 2, 6)
  - [x] Replace RSS starter API URLs in `src/config/config.dev.ts` and `src/config/config.prod.ts` with explicit Bestattungszentrum backend placeholders/config values.
  - [x] Keep runtime API URL access in `src/config`; feature code must not hard-code localhost or production URLs.
  - [x] Document that Android emulator, iOS simulator, and physical devices may need different development API URLs; do not solve physical-device configuration fully unless it stays inside config.
- [x] Add focused fixture-backed tests. (AC: 1, 2, 3, 5, 6)
  - [x] Update/replace `src/services/api/apiProblem.test.ts` for the new normalized failure shape.
  - [x] Add tests for success envelope unwrapping, backend validation error mapping, auth failure mapping, timeout/network mapping, malformed success payload -> `bad-data`, and cancellation handling.
  - [x] Add fixture tests for representative auth token, current user, category, supplier, quote request, quote response, timeline, and signup payloads.
  - [x] Add at least one compile-time/use-site test or type assertion pattern that proves feature consumers receive `AppApiResult<T>` instead of raw apisauce responses.
- [x] Run required quality gates. (AC: 1-6)
  - [x] Run `pnpm compile`.
  - [x] Run focused Jest tests for API DTOs/problem mapping.
  - [x] Run `pnpm test --runInBand`.
  - [x] Run `pnpm lint:check`.
  - [x] Run `pnpm depcruise`.

### Review Findings

- [x] [Review][Patch] 403 bearer failures are mapped as access-denied instead of auth [`src/services/api/apiProblem.ts:50`]
- [x] [Review][Patch] Success normalization accepts non-envelope payloads as valid backend success [`src/services/api/apiResult.ts:11`]
- [x] [Review][Patch] Request list endpoints use the create/detail QuoteRequest DTO for larger list-view contracts [`src/services/api/quoteRequestsApi.ts:26`]
- [x] [Review][Patch] Defaulted schema fields are exposed as required API input types [`src/services/api/types.ts:118`]
- [x] [Review][Patch] Route IDs are interpolated without validation or URL encoding [`src/services/api/quoteResponsesApi.ts:29`]
- [x] [Review][Patch] Critical request schemas allow malformed business values [`src/services/api/schemas.ts:235`]

## Dev Notes

### Current Source State

- `src/services/api/index.ts` currently exposes an `Api` class with a public `apisauce` instance, uses `Config.API_URL`, and has no domain methods. This should remain the low-level client wrapper, but feature code should consume typed API modules rather than `api.apisauce` directly.
- `src/services/api/types.ts` still contains Ignite RSS sample types (`EpisodeItem`, `ApiFeedResponse`). These are obsolete for this product and should be replaced by Bestattungszentrum DTO/result types.
- `src/services/api/apiProblem.ts` maps apisauce problems into starter `GeneralApiProblem` shapes. This should evolve into the normalized app failure model required by this story.
- `src/services/api/apiProblem.test.ts` only covers starter problem mapping. Replace or extend it with tests for backend envelopes, validation errors, status handling, and malformed payloads.
- `src/config/config.dev.ts` and `src/config/config.prod.ts` still point at `https://api.rss2json.com/v1/`. This is starter configuration and must not remain the default API target for future endpoint modules.
- No `src/domain` directory exists yet. Add it only if it contains reusable domain/status/schema helpers used by more than one API or feature. DTOs that are strictly API-boundary types can live under `src/services/api`.
- `zod` is not currently installed in the Expo app. The sibling Next.js backend uses Zod 4.2.1 for validation, and architecture calls for Zod 4 at mobile API/form boundaries.

### What This Story Changes

- Establishes the typed mobile API boundary that later auth/session, role gate, supplier discovery, RFQ, quote response, timeline, and signup stories will build on.
- Adds handwritten mobile DTOs and validation schemas. Do not generate an OpenAPI client and do not import from the sibling Next.js app.
- Adds normalized result helpers that hide apisauce response objects from screens/hooks.
- Adds initial API modules and fixture-backed tests, but it should not build UI, session persistence, refresh-on-401 replay, TanStack Query hooks, or route gates.

### What Must Be Preserved

- Keep Expo Router route files thin and untouched unless a test import requires no production behavior change.
- Do not undo Story 1.1 route groups/placeholders or Story 1.2 German-first theme/i18n work.
- Do not access MMKV session storage, decode tokens, or implement auth boot in this story. Token storage and refresh behavior belong to Stories 1.4 and 1.5.
- Do not log tokens, emails, tenant IDs, backend error payloads containing PII, or request bodies in Reactotron/console. Tests may use fixture data, but production diagnostics must be safe.
- Do not expose checkout/payment/cart/order language. The backend has marketplace endpoints, but MVP mobile must stay RFQ/request oriented.
- Do not edit `ios/` or `android/`.

### Architecture Guardrails

- API boundary lives in `src/services/api`. Feature modules may call typed API functions or future TanStack Query wrappers, but screens must not call apisauce directly.
- API modules own backend-specific endpoint paths, query parameter names, request DTOs, response DTOs, validation schemas, mappers, and problem mapping.
- Backend DTOs use backend field names. App/domain models may be introduced only through explicit mapper functions.
- Backend enum strings remain raw DTO values until explicit status/domain mappers convert them for display. No route file or API method should decide localized status labels.
- Dates crossing the API boundary are ISO strings. Display formatting stays in locale-aware utilities and UI/domain mappers, not in DTO definitions.
- Use the architecture result pattern:

```ts
type ApiSuccess<T> = { ok: true; data: T }
type ApiFailure = {
  ok: false
  problem: ApiProblem
  status?: number
  messageKey: TxKeyPath
  details?: unknown
}
type AppApiResult<T> = ApiSuccess<T> | ApiFailure
```

- Backend normal JSON responses are wrapped as `{ data: ... }`; mobile modules should unwrap before returning app results.
- Backend error responses are `{ error: { code, message, issues? } }`; map `code`/status to `problem` and `messageKey`, keep raw `issues`/safe payload in `details` where useful.

### Backend Contract Snapshot From Sibling Next.js App

Use this as contract evidence only. Do not import any code from `/Users/fariskunic/Documents/personal/bsc/bestattungszentrum-app`.

Auth endpoints:

- `POST /api/mobile/auth/login`: request `{ email, password, deviceId?, deviceLabel? }`; response `data` has `accessToken`, `refreshToken`, `tokenType: "Bearer"`, `expiresInSeconds`, `refreshExpiresInSeconds`, `user { id, email, role, tenantId }`.
- `POST /api/mobile/auth/refresh`: request `{ refreshToken }`; response is same token pair as login.
- `GET /api/mobile/auth/me`: bearer required; response `data` has `id`, `email`, `role`, `tenantId`, `permissions`.
- `POST /api/mobile/auth/logout`: request `{ refreshToken }`; response `data` is `{ revoked: true }`; current backend route does not require bearer.
- `POST /api/mobile/auth/logout-all`: bearer required; response `data` is `{ revokedCount }`.

Core data endpoints:

- `GET /api/mobile/categories`: bearer required; response `data` is active `Category[]`.
- `GET /api/mobile/suppliers`: bearer required; implemented query params are `q`, `categoryId`, `region`, `language`. OpenAPI currently documents `query`, so mobile must use implemented `q` and keep the mismatch isolated in `suppliersApi`.
- `POST /api/mobile/quote-requests`: bearer required; optional `Idempotency-Key` header; request `{ supplierId, categoryId, subject, message, deadline, attributes?, attachments? }`; response `data` is `QuoteRequest`. Backend sets `status: "SENT"` and may add `attributes.requestPdf`.
- `GET /api/mobile/requests`: funeral-home user only; response `data` is quote request fields plus `responses`, `supplier`, `category`, `documents`, and `timeline`.
- `GET /api/mobile/supplier-requests`: supplier user only; response `data` is quote request fields plus `funeralHome`, `category`, `response`, `documents`, and `timeline`.
- `POST /api/mobile/quote-responses`: request `{ quoteRequestId, priceAmount, priceIsRange?, priceMax?, validityUntil, leadTimeDays, message, attachments? }`; response `data` is `QuoteResponse`.
- `POST /api/mobile/quote-responses/:id/decision`: request `{ decision: "ACCEPTED" | "REJECTED" }`; response `data` is updated `QuoteResponse`; backend updates the parent quote request status to the same decision.
- `GET /api/mobile/quote-requests/:id/timeline`: response `data` is `RequestTimelineEvent[]`.
- `GET /api/mobile/quote-requests/:id/pdf`: response is binary `application/pdf`, not `{ data }`. Story 1.3 may define a placeholder/document DTO but should not force this endpoint through the JSON envelope helper.
- `POST /api/public/funeral-home-signups`: public route; request includes company/legal/contact/password fields; response `data` has `accountStatus`, `funeralHomeId`, `tradingName`, `userStatus`.

Contract drift and defensive mapping notes:

- Auth token response `user` does not include `permissions`; `/auth/me` does. Use separate `MobileAuthUserDto` and `MobileCurrentUserDto`.
- Missing/invalid bearer currently maps to `403 FORBIDDEN`, not always `401`; problem mapping should treat both as auth/access failures according to status/code.
- Some handlers return repository objects directly. Supplier responses may include backend/admin fields such as `createdByAdminId`, while OpenAPI omits them. DTO validation should strip or ignore unknown fields before exposing app-safe data.
- Request views may return a larger `funeralHome` object than OpenAPI documents. Prefer narrow mobile DTOs/mappers for UI consumers.

### DTO Field Requirements

Define these mobile DTOs by hand, with literal union types where useful:

- `UserRoleDto`: `"FUNERAL_HOME_USER" | "SUPPLIER_USER" | "ADMIN" | "SUPER_ADMIN" | "SUPPORT" | "OPERATOR"`.
- `UserStatusDto`: `"PENDING" | "ACTIVE" | "SUSPENDED"`.
- `AccountStatusDto`: `"PENDING_REVIEW" | "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED" | "CLOSED"`.
- `QuoteRequestStatusDto`: `"DRAFT" | "SENT" | "RESPONDED" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CANCELLED"`.
- `QuoteResponseStatusDto`: `"SENT" | "ACCEPTED" | "REJECTED"`.
- `EmailDispatchStatusDto`: `"QUEUED" | "SENT" | "DELIVERED" | "BOUNCED" | "COMPLAINED"`.
- `AddressDto`: `street`, `zip`, `city`, `country: "DE"`; backend validation expects 5-digit German ZIP.
- `MobileAuthTokensDto`: `accessToken`, `refreshToken`, `tokenType: "Bearer"`, `expiresInSeconds`, `refreshExpiresInSeconds`, `user`.
- `MobileAuthUserDto`: `id`, `email`, `role`, `tenantId`.
- `MobileCurrentUserDto`: `id`, `email`, `role`, `tenantId`, `permissions`.
- `CategoryDto`: `id`, `slug`, `nameDe`, `nameEn`, `parentId`, `icon`, `quoteFormSchema`, `isActive`.
- `SupplierDto`: `id`, `legalName`, `tradingName`, optional HR/VAT fields if present, `address`, `phone`, `contactEmail`, `publicDescription`, `logoUrl`, `categoryIds`, `regionsServed`, `languages`, `certifications`, `accountStatus`, `subscriptionTier`, `billingEmail`, `createdAt`.
- `SupplierItemDto`: `id`, `supplierId`, `categoryId`, `sku`, `name`, `description`, `unitPrice`, `currency: "EUR"`, `images`, `isActive`, optional `createdAt` because OpenAPI and domain types differ.
- `QuoteRequestDto`: `id`, `funeralHomeId`, `supplierId`, `categoryId`, `subject`, `message`, `deadline`, `attributes`, `attachments`, `status`, `createdAt`, `sentAt`, `respondedAt`.
- `QuoteResponseDto`: `id`, `quoteRequestId`, `supplierId`, `priceAmount`, `priceCurrency: "EUR"`, `priceIsRange`, `priceMax`, `validityUntil`, `leadTimeDays`, `message`, `attachments`, `status`, `sentAt`.
- `DocumentAssetDto`: `id`, `ownerType`, `ownerId`, `kind`, `fileName`, `contentType`, `storageKey`, `url`, `byteLength`, `checksum`, `createdAt`.
- `RequestTimelineEventDto`: `id`, `type`, `title`, `description`, `occurredAt`, `status: "DONE" | "PENDING" | "FAILED"`, `actorRole`, `relatedEntityType`, `relatedEntityId`.
- `EmailDispatchDto`: `id`, `relatedEntityType`, `relatedEntityId`, `toAddress`, `templateId`, `providerMessageId`, `status`, `sentAt`, `deliveredAt`, `lastEventAt`.
- `FuneralHomeSignupInputDto`: `legalName`, `tradingName`, optional `hrCourt`, `hrType`, `hrNumber`, `vatId`, `address`, `phone`, `contactEmail`, `billingEmail`, `password`.
- `FuneralHomeSignupResultDto`: `accountStatus`, `funeralHomeId`, `tradingName`, `userStatus`.
- `CreateQuoteRequestInputDto`: `supplierId`, `categoryId`, `subject`, `message`, `deadline`, optional/default `attributes`, optional/default `attachments`.
- `CreateQuoteResponseInputDto`: `quoteRequestId`, `priceAmount`, optional/default `priceIsRange`, nullable/default `priceMax`, `validityUntil`, `leadTimeDays`, `message`, optional/default `attachments`.
- `QuoteFormSchemaDto` and `QuoteRequestAttributesDto`: `Record<string, unknown>` for now. Seed data is JSON-Schema-like, but backend only guarantees a JSON object today.
- `ApiErrorDto`: at minimum `{ code: string; message: string; issues?: unknown }`.

### Endpoint Module Guidance

Recommended method names:

- `authApi.login`, `authApi.refreshSession`, `authApi.getCurrentUser`, `authApi.logout`, `authApi.logoutAll`.
- `categoriesApi.listCategories`.
- `suppliersApi.listSuppliers` with params `{ q?, categoryId?, region?, language? }`.
- `quoteRequestsApi.createQuoteRequest`, `quoteRequestsApi.listFuneralHomeRequests`.
- `quoteResponsesApi.createQuoteResponse`, `quoteResponsesApi.decideQuoteResponse`.
- `timelineApi.getQuoteRequestTimeline`.
- `signupApi.createFuneralHomeSignup` or `signupApi.submitFuneralHomeApplication`, using the actual public endpoint path.

Every method must return `Promise<AppApiResult<T>>`.

### Latest Technical Context

- Expo app dependencies currently include `apisauce` `3.1.1`, TypeScript `~5.9.2`, React Native `0.83.6`, Expo SDK `55.0.17`, and Jest `~29.7.0`.
- The sibling Next.js app uses `zod` `4.2.1`; mobile architecture calls for Zod 4. Add Zod 4 to the Expo app and use `z.infer`/`safeParse` patterns for schemas.
- Zod 4 docs show `safeParse` returns a success/failure result and can infer TypeScript types from schemas. For this story, prefer `safeParse` in API mappers so malformed backend data becomes an app failure instead of throwing into screens.
- Apisauce docs state responses always resolve to a standardized object with `ok`, `problem`, `status`, `data`, and related metadata. API modules should consume that object internally, then return `AppApiResult<T>` so screens/hooks never inspect apisauce internals.
- Apisauce supports per-request headers and dynamic headers; this story may set method-level headers such as `Idempotency-Key`, but token injection should remain a later session/API-client concern.

### Previous Story Intelligence

- Story 1.1 created the route-group shell and feature placeholders under `src/app/(auth)`, `src/app/(funeral-home)`, `src/app/(supplier)`, `src/app/(shared)`, and `src/features/**`; preserve thin route files.
- Story 1.2 completed German-first theme/i18n work and limited runtime i18n resources to German and English. Add new API error `messageKey` translations to both `src/i18n/de.ts` and `src/i18n/en.ts` if needed.
- Story 1.2 review fixed date-fns named locale loading, dark-mode button contrast, status color contrast coverage, and German/English-only runtime locale support.
- Android Argent verification passed for the current German shell on `emulator-5554`. Story 1.3 is primarily API-boundary logic and does not require Android UI verification unless implementation unexpectedly changes shell behavior.
- Do not claim iOS runtime verification. Earlier iOS dev-client redbox remains a known follow-up from Story 1.1.

### Git Intelligence Summary

- Recent committed history is starter/documentation only:
  - `a71f9f2 docs: refine mobile brand direction`
  - `6800528 docs: add mobile app PRD`
  - `386d806 New Ignite 11.5.0 app`
- Current working tree already contains Story 1.1 and 1.2 uncommitted implementation artifacts and source files. Treat them as current source of truth; do not revert them.
- Because the sibling Next.js app is outside this repo, use it only for contract inspection. Do not add imports, path aliases, workspace links, or shared package assumptions.

### Project Structure Notes

Expected UPDATE files:

```text
package.json
pnpm-lock.yaml
src/config/config.dev.ts
src/config/config.prod.ts
src/i18n/de.ts
src/i18n/en.ts
src/services/api/apiProblem.ts
src/services/api/apiProblem.test.ts
src/services/api/index.ts
src/services/api/types.ts
```

Likely NEW files:

```text
src/services/api/apiResult.ts
src/services/api/apiResult.test.ts
src/services/api/authApi.ts
src/services/api/authApi.test.ts
src/services/api/categoriesApi.ts
src/services/api/categoriesApi.test.ts
src/services/api/suppliersApi.ts
src/services/api/suppliersApi.test.ts
src/services/api/quoteRequestsApi.ts
src/services/api/quoteRequestsApi.test.ts
src/services/api/quoteResponsesApi.ts
src/services/api/quoteResponsesApi.test.ts
src/services/api/timelineApi.ts
src/services/api/timelineApi.test.ts
src/services/api/signupApi.ts
src/services/api/signupApi.test.ts
src/services/api/fixtures/
```

Use fewer files if the implementation stays clearer, but keep DTO/schema/result helpers discoverable and avoid one massive untestable file.

### Testing Requirements

- Required gates: `pnpm compile`, focused Jest tests, `pnpm test --runInBand`, `pnpm lint:check`, `pnpm depcruise`.
- Add tests before or alongside the helper/API module changes.
- Tests must prove:
  - success `{ data }` envelopes normalize to `{ ok: true, data }`;
  - backend domain errors normalize to failure with `problem`, `status`, `messageKey`, and safe `details`;
  - Zod validation errors normalize as validation failures;
  - malformed success data becomes `bad-data`;
  - apisauce network, connection, timeout, server, unknown, and cancel problems map deterministically;
  - representative DTO fixtures parse for auth, current user, category, supplier, quote request, quote response, timeline event, signup result, create quote request input, and create quote response input;
  - endpoint modules expose `AppApiResult<T>` and never return `ApiResponse`.

### References

- Story requirements: `_bmad-output/planning-artifacts/epics.md` - `Story 1.3: Typed API DTOs and Normalized API Result Boundary`.
- PRD: `_bmad-output/planning-artifacts/prd.md` - `FR38`, `FR39`, `NFR10`, `NFR11`, `NFR14`, `NFR15`, `NFR16`, `NFR17`, `NFR18`.
- Architecture: `_bmad-output/planning-artifacts/architecture.md` - `Data Architecture`, `API & Communication Patterns`, `Naming Patterns`, `Format Patterns`, `Architectural Boundaries`, `Integration Points`.
- UX: `_bmad-output/planning-artifacts/ux-design-specification.md` - `Localization & Language Requirements`, `Status Badge`, `Error State Strategy`, `Implementation Guidelines`.
- Previous story: `_bmad-output/implementation-artifacts/1-2-german-first-theme-and-i18n-baseline.md`.
- Current mobile source verified: `src/services/api/index.ts`, `src/services/api/types.ts`, `src/services/api/apiProblem.ts`, `src/services/api/apiProblem.test.ts`, `src/config/config.dev.ts`, `src/config/config.prod.ts`, `src/i18n/de.ts`, `src/i18n/en.ts`.
- Sibling backend contract evidence: `/Users/fariskunic/Documents/personal/bsc/bestattungszentrum-app/app/api/mobile/**`, `/Users/fariskunic/Documents/personal/bsc/bestattungszentrum-app/src/domain/types.ts`, `/Users/fariskunic/Documents/personal/bsc/bestattungszentrum-app/src/server/schemas.ts`, `/Users/fariskunic/Documents/personal/bsc/bestattungszentrum-app/src/server/http.ts`, `/Users/fariskunic/Documents/personal/bsc/bestattungszentrum-app/app/api/docs/openapi/route.ts`.
- Apisauce docs: `/infinitered/apisauce` - response object has `ok`, `problem`, `status`, `data`; requests support method-level axios config/headers.
- Zod docs: `/websites/zod_dev_v4` - Zod 4 schema validation, `safeParse`, `z.infer`, and current string/date validators.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Started Story 1.3 implementation on 2026-05-24.
- Added failing API boundary tests first; initial focused Jest run failed on missing `authApi`, confirming the red phase.
- Added Zod 4.2.1 and implemented DTO schemas, normalized result helpers, problem mapping, endpoint modules, config updates, and API error translation keys.
- Ran validation gates: `pnpm compile`, focused API Jest tests, `pnpm test --runInBand`, `pnpm lint:check`, and `pnpm depcruise`.
- Applied all six code review patches on 2026-05-24 and reran validation gates successfully.

### Completion Notes List

- Replaced Ignite RSS sample API types with Bestattungszentrum DTO/result types and Zod-backed runtime schemas.
- Added normalized apisauce response mapping that unwraps backend `{ data }` envelopes, maps backend/apisauce failures into `AppApiResult<T>`, and converts malformed payloads into `bad-data`.
- Added thin typed API modules for auth, categories, suppliers, quote requests, quote responses, timeline, and signup without token storage, refresh replay, route gates, hooks, or UI flow work.
- Updated API base URL config placeholders and added typed API error translation keys in German/English plus structural fallback keys for the remaining typed locale files.
- Added fixture-backed tests covering DTO parsing, problem mapping, success unwrapping, validation/auth/network/timeout/cancel/bad-data failures, endpoint paths, and compile-time `AppApiResult<T>` return assertions.
- Resolved code review findings by adding protected-endpoint 403 auth handling, strict success-envelope validation, dedicated request-list DTOs, input DTO typing for defaulted fields, encoded path parameters, and stronger request schema constraints.

### File List

- `_bmad-output/implementation-artifacts/1-3-typed-api-dtos-and-normalized-api-result-boundary.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `package.json`
- `pnpm-lock.yaml`
- `src/config/config.dev.ts`
- `src/config/config.prod.ts`
- `src/i18n/ar.ts`
- `src/i18n/de.ts`
- `src/i18n/en.ts`
- `src/i18n/es.ts`
- `src/i18n/fr.ts`
- `src/i18n/hi.ts`
- `src/i18n/ja.ts`
- `src/i18n/ko.ts`
- `src/services/api/apiProblem.test.ts`
- `src/services/api/apiProblem.ts`
- `src/services/api/apiResult.test.ts`
- `src/services/api/apiResult.ts`
- `src/services/api/authApi.ts`
- `src/services/api/categoriesApi.ts`
- `src/services/api/quoteRequestsApi.ts`
- `src/services/api/quoteResponsesApi.ts`
- `src/services/api/schemas.ts`
- `src/services/api/signupApi.ts`
- `src/services/api/suppliersApi.ts`
- `src/services/api/timelineApi.ts`
- `src/services/api/types.ts`

### Change Log

- 2026-05-24: Implemented typed API DTOs, runtime schemas, normalized result/problem boundary, initial endpoint modules, config placeholders, API translations, and fixture-backed tests.
- 2026-05-24: Addressed code review findings and marked Story 1.3 done after passing all validation gates.
