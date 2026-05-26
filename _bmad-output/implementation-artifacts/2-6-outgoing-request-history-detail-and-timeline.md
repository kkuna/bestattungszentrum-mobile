# Story 2.6: Outgoing Request History, Detail, and Timeline

Status: done

<!-- Completion note: Ultimate context engine analysis completed - comprehensive developer guide refreshed against the Story 2.5 working tree. Do not treat this as implementation evidence. -->

## Story

As a funeral-home user,
I want to view my sent quote requests and their history,
so that I can track status, supplier responses, timeline events, and documents.

## Acceptance Criteria

1. Given a funeral-home user opens Quotes, when outgoing requests load, then RFQ Cards show subject, supplier, category, status badge, deadline or timestamp, response metadata, and email-dispatch metadata where available.
2. Given the user has no requests, when the request list renders, then a localized empty state explains that no requests exist yet and offers a practical path back to discovery.
3. Given a request is selected, when the request detail opens, then it shows request details, timeline access, response summary, email-dispatch traces, and PDF/document links where backend support exists.
4. Given an email deep link targets an outgoing request or supplier response detail, when the link opens from unauthenticated, authenticated correct-role, authenticated wrong-role, pending/suspended, missing-target, unavailable-target, and backend/network failure states, then the app resolves the link through auth, role, account-status, and tenant gates before rendering protected detail, and routes to the correct detail, account-status panel, sign-in flow, not-found state, or recoverable error state without exposing protected data.
5. Given timeline events are available, when the timeline renders, then Timeline Items show localized event labels, timestamps, actor/system source, optional details, and completed/pending/failed/informational states.
6. Given PDF or related document links are unavailable, when the detail screen renders, then the app shows a graceful placeholder or hides the unavailable action and does not present broken links.
7. Given tests run, when outgoing list, empty state, detail, timeline, response summary, PDF availability, and error states are exercised, then request-history behavior is verified.

## Tasks / Subtasks

- [x] Replace the funeral-home Quotes placeholder with an outgoing request history screen. (AC: 1, 2, 7)
  - [x] Replace the current placeholder route at `src/app/(funeral-home)/funeral-home/quotes/index.tsx`; `quotes.tsx` has already been removed in the Story 2.5 branch state.
  - [x] Add `src/app/(funeral-home)/funeral-home/quotes/[requestId].tsx` only when the detail screen has a confirmed safe data source.
  - [x] Keep route files thin. They should render feature screens only; no API calls, DTO mapping, token/session reads, or status-label logic in route files.
  - [x] Build `FuneralHomeQuotesScreen` or equivalent under `src/features/funeral-home/quotes`, using `Screen`, `Text`, `Button`, `Card`/domain cards, theme tokens, and the established safe-area/bottom-tab spacing.
  - [x] Fetch outgoing requests through a feature hook backed by TanStack Query and `quoteRequestsApi.listFuneralHomeRequests()`.
  - [x] Reuse `queryKeys.requests.funeralHomeList()` for outgoing history; add centralized detail and timeline keys before implementing detail/timeline queries. Preserve existing category, supplier, RFQ form-context, and supplier request keys.
  - [x] Render stable card skeletons/placeholders while loading; do not use a layout-shifting full-screen spinner as the only loading state.
  - [x] Render a localized empty state with a practical action to `/funeral-home/discover`.

- [x] Add reusable request-history domain UI close to the feature. (AC: 1, 3, 5, 6)
  - [x] Add an `RfqCard`/`QuoteRequestCard` component for outgoing history under `src/features/funeral-home/quotes/components` or `src/features/requests/components` if it is deliberately shared with supplier inbox later.
  - [x] Add a `StatusBadge` helper/component or request/status-display mapper. Existing `src/domain/requests/emailDispatchStatusDisplay.ts` covers Story 2.5 receipt dispatch only; do not stretch its `funeralHome.rfq.receipt.*` keys into request-history cards.
  - [x] Add a `TimelineItem` component under `src/features/requests/components` if shared with future supplier request timelines; otherwise keep it under the funeral-home feature until reuse is real.
  - [x] Show subject, supplier display name, category display name, status label, deadline/sent timestamp, response count/latest response summary, email-dispatch metadata where present, and document/PDF availability without exposing raw enum names or internal IDs as primary copy.
  - [x] Use `formatDate()` or a locale-aware formatter; do not hand-format ISO date strings in components.
  - [x] Ensure status badges and timeline states include localized text and accessibility labels, not color alone.

- [x] Implement request detail and timeline access. (AC: 3, 5, 6, 7)
  - [x] Add a protected outgoing request detail route that remains inside the funeral-home route group and inherits `src/app/(funeral-home)/_layout.tsx` role/account gating.
  - [x] Use list-item data for detail only if the backend contract intentionally returns full detail in `GET /api/mobile/requests`. Otherwise add a typed API method for a confirmed request-detail endpoint before building the detail UI.
  - [x] Call `timelineApi.getQuoteRequestTimeline(requestId)` for timeline data and handle success, empty timeline, normalized failures, and retry.
  - [x] Show request details: subject, message, supplier, category, status, deadline, created/sent/responded timestamps, attributes summary if available, attachments/documents placeholder, response summary, and timeline.
  - [x] For `documents` or PDF links, only render an action when a valid URL/contract exists. If PDF support is endpoint-based (`GET /api/mobile/quote-requests/:id/pdf`), add the API method and tests before exposing the action.
  - [x] Do not implement chat, checkout, payment, order placement, supplier self-registration, or hosted conversation behavior.

- [x] Add email deep-link resolution for protected outgoing request targets if app-link/deep-link infrastructure is available in this branch. (AC: 4)
  - [x] Confirm current Expo Router linking/app scheme configuration before adding new deep-link paths.
  - [x] Route unauthenticated users through the sign-in/session flow and then to protected detail only after `SessionGate` and the funeral-home route gate allow access.
  - [x] Route wrong-role, pending, suspended, closed, verification-failed, tenantless, or unknown account states through the existing account-status path/panel rather than rendering protected request data.
  - [x] Handle missing-target, unavailable-target, 404, access-denied, auth, network, timeout, and bad-data failures with localized recoverable states.
  - [x] If deep-link infrastructure is not ready, implement the protected detail route and document deep-link handling as a blocked subtask rather than adding an unsafe partial link resolver.

- [x] Extend API DTOs and backend-contract tests only as needed. (AC: 1, 3, 5, 6, 7)
  - [x] Keep `src/services/api/quoteRequestsApi.ts` as the owner of quote-request endpoint paths and DTO mapping.
  - [x] Keep `src/services/api/timelineApi.ts` as the owner of request timeline endpoint paths and path segment encoding.
  - [x] Add a `getFuneralHomeRequestDetail()` method only after confirming the backend endpoint and response shape. Candidate endpoint must not be guessed in production code.
  - [x] Add `getQuoteRequestPdf()` or document-link handling only after confirming whether the backend returns a direct PDF URL, binary response, signed URL, or app-openable document link.
  - [x] If email-dispatch metadata is available on list/detail responses, consume the existing optional `quoteRequestSchema.emailDispatch` field and map it behind API/domain helpers. Do not hard-code dispatch state from timeline titles.
  - [x] Preserve `AppApiResult<T>` normalized success/failure behavior and fixture-backed tests for success, empty, validation/bad-data, unauthorized, access denied, not found, timeout/network, and server failures.

- [x] Add German-first and English localization for all new copy. (AC: 1-7)
  - [x] Add `funeralHome.quotes.*` keys for list title, loading, empty, error, retry, card labels, detail labels, response summary, document/PDF states, timeline section, and deep-link failure states.
  - [x] Add status-label keys for quote request statuses, quote response statuses, email dispatch states, and timeline event states through centralized mapping helpers.
  - [x] Keep German copy calm and operational. Use request/history language such as `Anfragen`, `Verlauf`, `Status`, `Antwort`, and `Dokument`, not checkout/order/cart/payment/chat language.
  - [x] Update English to mirror the German structure. Update non-primary locale forwarding only if the typed translation shape requires it.

- [x] Add focused tests and required runtime verification. (AC: 1-7)
  - [x] Add API tests for new or extended `quoteRequestsApi`/`timelineApi` behavior and path encoding.
  - [x] Add query-key/hook tests for list/detail/timeline query behavior, normalized failure mapping, and session-scope cache behavior where relevant.
  - [x] Add component tests for outgoing list success, loading skeletons, empty state with Discover action, normalized error retry, card metadata, detail success, missing documents/PDF, response summary, timeline success/empty/error, and localized status labels.
  - [x] Add route/deep-link tests for unauthenticated, wrong-role, suspended/pending, correct-role, not-found, and backend failure states if deep-link infrastructure is implemented.
  - [x] Run `pnpm compile`, focused Jest tests, `pnpm test --runInBand`, `pnpm lint:check`, `pnpm depcruise`, and `git diff --check`.
  - [x] Because this story affects app runtime behavior, navigation, screens, API behavior, and protected data, verify with Argent on at least one simulator/emulator. Do not claim simulator/emulator verification unless Argent was actually used.

### Review Findings

- [x] [Review][Patch] Protected app-relative document URLs were opened in the external browser and protocol-relative URLs were accepted [`src/features/funeral-home/quotes/FuneralHomeQuoteRequestDetailScreen.tsx`] — fixed by hiding relative/protocol-relative document URLs, opening only absolute HTTP(S) URLs, and documenting the authenticated PDF contract gap.
- [x] [Review][Patch] Timeline rendering could crash on malformed event timestamps [`src/features/requests/components/TimelineItem.tsx`] — fixed with safe timeline date formatting and fallback copy.
- [x] [Review][Patch] Singular `response` data was ignored when `responses` existed as an empty array [`src/features/funeral-home/quotes/components/QuoteRequestCard.tsx`] — fixed by normalizing response arrays in card and detail summaries.
- [x] [Review][Patch] Request detail omitted the created timestamp when `sentAt` existed [`src/features/funeral-home/quotes/FuneralHomeQuoteRequestDetailScreen.tsx`] — fixed by rendering created and sent timestamps separately.
- [x] [Review][Patch] Missing-target detail could fetch timeline data for an ID not present in the funeral-home request list [`src/features/funeral-home/quotes/FuneralHomeQuoteRequestDetailScreen.tsx`] — fixed by enabling the timeline query only after the request is found and keeping a loading state while a cached-miss list refetch is in flight.
- [x] [Review][Patch] Detail attributes exposed raw backend keys as user-facing copy [`src/features/funeral-home/quotes/FuneralHomeQuoteRequestDetailScreen.tsx`] — fixed by mapping known quantity copy and using localized generic labels for unknown primitive attributes.
- [x] [Review][Defer] Dedicated mobile request-detail endpoint and full deep-link target matrix remain unconfirmed — deferred to backend/API contract and route-infrastructure follow-up; current implementation uses the protected list response and keeps the known backend gap documented.
- [x] [Review][Defer] Supplier response detail deep links are not implemented — deferred because no confirmed response-detail route/contract exists in this story branch.
- [x] [Review][Defer] Informational timeline state is not represented in the DTO — deferred until backend confirms whether informational events are modeled by event type, status, or another field.

### Review Findings (2026-05-26 rerun)

- [x] [Review][Patch] Stale protected detail can render before the list refetch confirms access [`src/features/funeral-home/quotes/FuneralHomeQuoteRequestDetailScreen.tsx:35`]
- [x] [Review][Patch] Quote request and timeline 403 responses are normalized as auth failures instead of access-denied [`src/services/api/quoteRequestsApi.ts:41`]
- [x] [Review][Patch] Latest-response sorting mutates React Query cached response arrays during render [`src/features/funeral-home/quotes/FuneralHomeQuoteRequestDetailScreen.tsx:258`]
- [x] [Review][Patch] Detail response price formatting can throw on invalid backend currency values [`src/features/funeral-home/quotes/FuneralHomeQuoteRequestDetailScreen.tsx:378`]
- [x] [Review][Patch] Direct-entry detail back action can leave or no-op instead of returning to quote history [`src/features/funeral-home/quotes/FuneralHomeQuoteRequestDetailScreen.tsx:105`]
- [x] [Review][Patch] Document availability and actions accept cleartext HTTP URLs [`src/features/funeral-home/quotes/FuneralHomeQuoteRequestDetailScreen.tsx:385`]
- [x] [Review][Patch] Date-only deadlines use the generic ISO datetime formatter despite the date-only backend contract [`src/features/funeral-home/quotes/FuneralHomeQuoteRequestDetailScreen.tsx:125`]
- [x] [Review][Patch] Hidden-tab tests assert test-mock internals instead of the `href: null` contract [`src/navigation/roleTabs.test.tsx:1`]
- [x] [Review][Defer] Dedicated mobile request-detail endpoint and full protected deep-link/auth-state matrix remain unconfirmed [`_bmad-output/implementation-artifacts/backend-gaps.md`] — deferred, pre-existing
- [x] [Review][Defer] Supplier response detail deep links are not implemented because no response-detail route/contract exists in this story branch [`_bmad-output/implementation-artifacts/backend-gaps.md`] — deferred, pre-existing
- [x] [Review][Defer] Informational timeline state is not represented in the current DTO [`src/services/api/schemas.ts:219`] — deferred, pre-existing

## Dev Notes

### Current Source State

- `src/app/(funeral-home)/funeral-home/quotes/index.tsx` currently renders `FuneralHomeQuotesPlaceholderScreen`; this is the main route to replace for outgoing history.
- `src/app/(funeral-home)/funeral-home/quotes/new.tsx` is the Story 2.5 RFQ creation route and renders `RfqFormScreen` from `src/features/funeral-home/quotes/RfqFormScreen.tsx`. Preserve this route and keep it hidden from tabs through `RoleTabs`.
- `src/features/funeral-home/FuneralHomeQuotesPlaceholderScreen.tsx` is only placeholder content and should be deleted or left unused after the real history screen replaces `quotes/index.tsx`.
- `src/app/(funeral-home)/_layout.tsx` already fails closed for signed-out, wrong-role, pending, suspended, missing-tenant, or unknown account states by redirecting through `/` or `/account-status`. Preserve this gate; do not duplicate protected-data decisions inside the screen except for CTA-specific messaging.
- `src/app/(funeral-home)/funeral-home/_layout.tsx` renders `FuneralHomeTabs`; `src/navigation/RoleTabs.tsx` defines the `quotes/index` tab with localized label/accessibility keys and hides `quotes/new`.
- Story 2.1 established TanStack Query in `src/services/query` and wraps the app root with `QueryProvider`. `QueryProvider` clears/remounts query scope when authenticated user/tenant changes. Keep request-history queries scoped through this provider and central query keys.
- `src/services/query/queryKeys.ts` currently contains category, supplier list/detail, RFQ form-context, funeral-home request-list, and supplier request-list keys. Extend `queryKeys.requests` for detail and timeline rather than creating local ad-hoc arrays.
- `src/services/api/quoteRequestsApi.ts` already has `listFuneralHomeRequests()` calling `GET /api/mobile/requests` and returning `AppApiResult<QuoteRequestListItemDto[]>`.
- `src/services/api/timelineApi.ts` already has `getQuoteRequestTimeline(requestId)` calling `GET /api/mobile/quote-requests/:id/timeline`, validates the path id, encodes dynamic segments, and returns `AppApiResult<RequestTimelineEventDto[]>`.
- `src/services/api/schemas.ts` defines `quoteRequestSchema`, `quoteResponseSchema`, `requestTimelineEventSchema`, `documentAssetSchema`, `emailDispatchSchema`, and `quoteRequestListItemSchema`. `quoteRequestSchema` now accepts optional nullable `emailDispatch`, so `quoteRequestListItemSchema` inherits that field and also includes optional/defaulted `attachments`, `documents`, `timeline`, `category`, `responses`, `supplier`, `funeralHome`, and `response`.
- `src/domain/requests/emailDispatchStatusDisplay.ts` maps receipt dispatch statuses to `funeralHome.rfq.receipt.*` keys. Add a request-history-specific display helper/key set if cards/detail need different copy.
- `src/services/api/apiResult.ts` and `src/services/api/apiProblem.ts` own backend envelope unwrapping and normalized failure mapping. Screens and hooks must not inspect raw apisauce responses.
- `src/utils/formatDate.ts` provides a date-fns based formatter and dynamic locale loading. Use it or extend locale-aware formatting instead of manual string slicing.
- `src/i18n/de.ts` and `src/i18n/en.ts` already contain `funeralHome.quotes` placeholder keys. This story should replace/extend those keys with list/detail/timeline copy.
- Existing domain account status mapping lives in `src/domain/account/accountAccess.ts`. Request/response/email/timeline status mapping should be added in a new request/status domain helper only when shared display logic exists.

### Backend / API Contract Assumptions and Blockers

- `listFuneralHomeRequests()` uses `GET /api/mobile/requests`, while planning docs also mention quote-request endpoints. Treat the implemented API module as the current source of truth, but confirm the backend path before adding detail behavior.
- No dedicated mobile request-detail API method exists in the source. If `GET /api/mobile/requests` does not return full detail, this story is blocked on confirming a detail endpoint and response shape.
- Planning docs list `GET /api/mobile/quote-requests/:id/pdf`, but no source API method exists. Do not expose a PDF button until the backend contract confirms whether the response is a direct URL, binary PDF, signed URL, or document asset.
- The API schema accepts optional `emailDispatch` on quote requests, but the live Story 2.5 backend response omitted dispatch metadata. Email-dispatch metadata in cards/detail remains conditional on backend support.
- Timeline event `status` currently allows `DONE`, `PENDING`, and `FAILED`; the UX asks for completed, pending, failed, and informational states. The implementation must define whether informational maps from event type, event status, or a backend DTO extension.
- Quote request statuses currently come from the API schema. If backend quote lifecycle naming changes, isolate that in API/domain mapping and tests before rendering labels.
- Deep-link behavior may require app scheme/app-link configuration outside the Quotes screen. If that infrastructure is absent, mark the deep-link subtask blocked rather than bypassing auth/role gates.
- Backend auth status fields were resolved on 2026-05-25 per `backend-gaps.md`; keep fail-closed behavior for missing or malformed fields anyway.

### Previous Story Intelligence

- Story 2.5 implemented real RFQ review/send/receipt behavior on top of the current `quotes/new` route. Do not break the creation flow while replacing the Quotes index placeholder.
- Story 2.5 added `queryKeys.requests.funeralHomeList()` and invalidates it after successful RFQ creation. Use that same list key for Story 2.6 so newly submitted RFQs can appear in history after refetch.
- Story 2.5 confirmed the running backend accepts `POST /api/mobile/quote-requests` with a date-only `YYYY-MM-DD` `deadline`; request history should display this safely with `formatDate()` or a locale-aware helper and should not reinterpret it as a timezone-sensitive instant.
- Story 2.5 added optional `quoteRequestSchema.emailDispatch` parsing and `emailDispatchStatusDisplay` for receipt copy, but real backend create responses still omitted dispatch metadata. Treat dispatch display as unavailable unless list/detail responses actually include it.
- Story 2.5 Argent verification required the sibling backend on port `3000` and a seeded active funeral-home/supplier/category path. Reuse that backend setup expectation for protected request-history verification instead of relying on unauthenticated route access.
- Story 2.5 completed full quality gates and live Argent RFQ submit verification; the request-history implementation should preserve those tests and add focused history/detail/timeline coverage rather than rewriting RFQ create tests.

### Dependency and Parallelism Notes

- Execution recommendation: may run in parallel later with Story 2.3 or Story 2.4 only if route ownership is coordinated first; Story 2.6 should own the Quotes list/detail route refactor unless the implementation lead explicitly assigns that refactor to Story 2.4.
- Execution can be prepared now and can likely run in parallel later with Story 2.3 or 2.4 if route ownership is coordinated.
- This story is comparatively independent from RFQ form rendering in Story 2.4 because it reads existing outgoing requests rather than creating new requests.
- It may overlap with Story 2.3 if both add supplier display helpers, status badges, or RFQ/detail navigation. Prefer extracting shared status/card pieces only when both stories need them, and avoid moving feature-specific code into `src/components`.
- It should not depend on Story 2.5 for implementation if seeded/backend requests already exist, but the vertical slice value improves after Story 2.5 can create requests from the app.
- Story 2.7 suspended read-only mode should wait, but this story must not block read-only history. Preserve route-gate behavior as currently implemented; if current gates fully redirect suspended users away from all funeral-home routes, note that Story 2.7 owns changing that access policy.

## Architecture Guardrails

- Follow the current implemented route shape under `src/app/(funeral-home)/funeral-home`, not the older idealized architecture tree that shows `src/app/(funeral-home)/quotes`.
- Use feature-oriented placement:
  - Routes: `src/app/(funeral-home)/funeral-home/quotes/index.tsx`, `src/app/(funeral-home)/funeral-home/quotes/[requestId].tsx`, and optional nested timeline route only if it improves UX.
  - Screens/hooks: `src/features/funeral-home/quotes/*` for funeral-home-only list/detail behavior, matching the current RFQ creation feature folder.
  - Shared request UI: `src/features/requests/*` only for components/helpers reused by funeral-home history and future supplier inbox.
  - API: `src/services/api/quoteRequestsApi.ts` and `src/services/api/timelineApi.ts`.
  - Query: `src/services/query/queryKeys.ts` plus feature hooks that wrap API results.
  - Domain status mapping: `src/domain/requests` or `src/domain/status` only when display mapping is shared.
- API modules own endpoint paths, backend parameter names, DTO validation, response mapping, and problem mapping. Screens consume typed hooks and display-ready data.
- Server state belongs in TanStack Query. Do not duplicate request lists/details into React context or MMKV unless there is a documented offline-read reason.
- Keep auth boot/session refresh outside TanStack Query. Do not read tokens or MMKV from screens/components.
- Backend statuses and event types must be mapped through centralized display helpers before rendering. A display object should include raw value, normalized status, localized label key, semantic tone, and accessibility label key.
- All visible strings, accessibility labels, status labels, errors, empty states, and document/PDF messages must come through i18n. German is the layout stress case.
- Use Quiet Ledger UX: dense but calm cards, explicit status, timestamps, practical next actions, stable bottom navigation, white modules, restrained brand red.
- Do not present marketplace checkout, payment, order, cart, purchase, chat, or hosted conversation language.
- Do not add a UI kit or new navigation framework. Compose existing Ignite primitives, theme tokens, Expo Router, lucide icons where useful, and current test patterns.
- Preserve tenant privacy. Never render stale or cached request detail from a previous user/tenant after session scope changes.

### Latest Technical Notes

- Local dependency state on 2026-05-26: Expo `55.0.17`, Expo Router `~55.0.4`, React Native `0.83.6`, React `19.2.0`, TanStack Query `^5.100.14`, React Hook Form `^7.76.1`, Zod `4.2.1`, and date-fns `^4.1.0`. Do not upgrade dependencies in this story unless a separate dependency task approves it.
- Expo Router's current docs state that URL params are read with `useLocalSearchParams()` and that Expo Router supports deep linking to pages by default when mobile scheme/app-link configuration is present. Use existing route groups and guards; do not add a parallel navigation stack. Source: https://docs.expo.dev/router/basics/navigation/
- Expo linking docs recommend Expo Router for incoming app links/deep links and note that development builds are recommended for testing incoming link behavior. Source: https://docs.expo.dev/linking/overview/
- TanStack Query v5 docs recommend invalidating related queries in mutation `onSuccess` using `queryClient.invalidateQueries({ queryKey })`. Story 2.5 already invalidates the outgoing request list; Story 2.6 should rely on the centralized key and not duplicate cache state. Source: https://tanstack.com/query/v5/docs/framework/react/guides/invalidations-from-mutations

## Expected File Changes

Likely NEW files:

```text
src/app/(funeral-home)/funeral-home/quotes/[requestId].tsx
src/features/funeral-home/quotes/FuneralHomeQuotesScreen.tsx
src/features/funeral-home/quotes/FuneralHomeQuoteRequestDetailScreen.tsx
src/features/funeral-home/quotes/hooks/useFuneralHomeQuoteRequestsQuery.ts
src/features/funeral-home/quotes/hooks/useQuoteRequestTimelineQuery.ts
src/features/funeral-home/quotes/components/QuoteRequestCard.tsx
src/features/requests/components/TimelineItem.tsx
src/features/requests/components/StatusBadge.tsx
src/domain/requests/requestStatusDisplay.ts
src/features/funeral-home/quotes/FuneralHomeQuotesScreen.test.tsx
src/features/funeral-home/quotes/FuneralHomeQuoteRequestDetailScreen.test.tsx
```

Likely UPDATE files:

```text
src/app/(funeral-home)/funeral-home/quotes/index.tsx
src/features/funeral-home/FuneralHomeQuotesPlaceholderScreen.tsx
src/services/query/queryKeys.ts
src/services/api/quoteRequestsApi.ts
src/services/api/schemas.ts
src/services/api/types.ts
src/services/api/quoteRequestsApi.test.ts
src/services/api/timelineApi.test.ts
src/services/query/queryKeys.test.ts
src/i18n/de.ts
src/i18n/en.ts
_bmad-output/implementation-artifacts/backend-gaps.md
```

Conditional UPDATE files:

```text
src/i18n/ar.ts
src/i18n/es.ts
src/i18n/fr.ts
src/i18n/hi.ts
src/i18n/ja.ts
src/i18n/ko.ts
app.json
app.config.ts
ios/**
android/**
```

Only update `quoteRequestsApi`, schemas/types, native config, and non-primary locale files if confirmed contract or TypeScript translation shape requires it. Do not touch `quotes/new.tsx` or RFQ creation components except to preserve navigation compatibility.

## Test / Argent Verification Expectations

- Unit/API checks:
  - `quoteRequestsApi.listFuneralHomeRequests()` still calls the confirmed outgoing request endpoint and returns normalized results.
  - New detail/PDF methods, if added, validate inputs, encode path segments, unwrap backend envelopes, and map failure states.
  - `timelineApi.getQuoteRequestTimeline()` continues to encode dynamic request IDs and map normalized timeline results.
  - Status display helpers map quote request, quote response, email dispatch, and timeline states to localized labels, tones, and accessibility labels.

- Component/query checks:
  - Quotes list: loading skeletons, success cards, empty state with Discover action, API failure retry, German/English labels, long German status text, and no raw IDs/enums as primary UI.
  - Request card: supplier/category fallbacks, deadline/sent timestamp, responded/not-responded metadata, email dispatch available/unavailable, document/PDF available/unavailable.
  - Detail: protected data displays after correct-role auth, response summary, attributes summary, documents placeholder/action, timeline success/empty/error, retry behavior, missing request handling.
  - Deep links if implemented: unauthenticated -> sign-in/session gate, correct role -> detail, wrong role/restricted -> account-status, missing target -> not-found/recoverable state, backend/network failure -> localized retry state.

- Required command checks:
  - `pnpm compile`
  - Focused Jest tests for API/query/status/screen behavior
  - `pnpm test --runInBand`
  - `pnpm lint:check`
  - `pnpm depcruise`
  - `git diff --check`

- Argent runtime verification is required because this story changes runtime behavior, navigation, protected screens, API behavior, and visible UI:
  - Active funeral-home session opens Quotes and sees outgoing request loading, success, empty, and error/retry states.
  - Tapping a request card opens protected detail and shows request summary, timeline, response/document states, and stable back navigation.
  - Timeline handles success, empty, and API failure without exposing protected data or raw backend terms.
  - PDF/document unavailable state hides or replaces unavailable actions without broken links.
  - Deep-link states are exercised if implemented.
  - Compact German UI is checked for card/status/timeline text overlap and bottom-tab collisions.
  - Verification should not claim iOS or Android coverage unless that platform was actually exercised through Argent in the current workflow.

## References

- [Source: `_bmad-output/planning-artifacts/epics.md` - Epic 2, Story 2.6 acceptance criteria; FR20, FR22, FR33, FR35, FR37, FR38, FR40; UX-DR18, UX-DR19, UX-DR25, UX-DR32]
- [Source: `_bmad-output/planning-artifacts/prd.md` - UJ-3, FR20, FR22, FR33, FR35, FR38, NFR1-NFR3, NFR9, NFR14-NFR17, API endpoint inventory]
- [Source: `_bmad-output/planning-artifacts/architecture.md` - API & Communication Patterns, Frontend Architecture, State Management, Status Mapping Patterns, Project Structure & Boundaries]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` - Quiet Ledger pattern, RFQ Card, Status Badge, Timeline Item, Loading/Empty/Error States, Navigation, Responsive Design, Accessibility]
- [Source: `_bmad-output/implementation-artifacts/2-1-funeral-home-home-and-category-discovery-baseline.md` - TanStack Query foundation, session-scope cache clearing, route shape, Argent backend/session gap, no request-history scope in Story 2.1]
- [Source: `src/app/(funeral-home)/_layout.tsx` - funeral-home protected route gate]
- [Source: `src/app/(funeral-home)/funeral-home/_layout.tsx` and `src/navigation/RoleTabs.tsx` - funeral-home tab shell and Quotes tab]
- [Source: `_bmad-output/implementation-artifacts/2-5-rfq-review-and-send-receipt.md` - previous story implementation notes, query invalidation, backend date-only deadline, live Argent verification, and RFQ creation route ownership]
- [Source: `_bmad-output/implementation-artifacts/backend-gaps.md` - confirmed request-detail/PDF/timeline/email-dispatch backend gaps and Story 2.5 resolved backend issues]
- [Source: `src/app/(funeral-home)/funeral-home/quotes/index.tsx`, `src/app/(funeral-home)/funeral-home/quotes/new.tsx`, and `src/features/funeral-home/FuneralHomeQuotesPlaceholderScreen.tsx` - current Quotes placeholder/index route and RFQ creation sibling route]
- [Source: `src/services/api/quoteRequestsApi.ts` - current outgoing/supplier request list API methods]
- [Source: `src/services/api/timelineApi.ts` - request timeline API method]
- [Source: `src/services/api/schemas.ts` and `src/services/api/types.ts` - quote request, response, document, email dispatch, timeline, and list item DTOs]
- [Source: `src/services/api/apiResult.ts` and `src/services/api/apiProblem.ts` - normalized API result and failure mapping]
- [Source: `src/services/query/QueryProvider.tsx` and `src/services/query/queryKeys.ts` - query provider/session-scope behavior and current central keys]
- [Source: `src/utils/formatDate.ts` - locale-aware date formatting helper]
- [Source: `src/i18n/de.ts` and `src/i18n/en.ts` - current funeral-home Quotes placeholder copy and translation structure]
- [Source: Official Expo Router navigation/deep-link docs - route params, default deep linking, scheme/back-stack notes: https://docs.expo.dev/router/basics/navigation/]
- [Source: Official Expo linking overview - incoming link strategies and development-build testing guidance: https://docs.expo.dev/linking/overview/]
- [Source: Official TanStack Query v5 docs - invalidations from mutations with `onSuccess` and `invalidateQueries`: https://tanstack.com/query/v5/docs/framework/react/guides/invalidations-from-mutations]
- [Source: Repowise `get_answer` for this topic returned weak retrieval on 2026-05-25; actual source files above were used as source of truth.]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-05-26: Red phase added request status, query key, timeline API, quote request list API, hook, screen, and route/tab tests; initial focused run failed for missing status helper/detail keys as expected.
- 2026-05-26: Green/refactor implemented request-history list/detail screens, thin routes, query hooks, shared status/timeline UI, request status display mapping, localized German/English copy, document URL handling, and tab hiding for the dynamic detail route.
- 2026-05-26: Argent iOS verification on iPhone 16 Pro with backend on port 3000 and Metro on 8081 verified Quotes list success, protected detail navigation, PDF document action rendering, localized timeline labels, correct-role deep link to `quote-1`, and missing-target deep link not-found state. Empty/error states were covered by focused Jest tests rather than live backend mutation because the seeded backend had an active request.
- 2026-05-26: Code review patched protected document-link handling, missing-target timeline gating, created/sent timestamp display, singular-response normalization, timeline date fallback, and localized attribute labels. Follow-up curl checks confirmed unauthenticated external PDF access returns 403 while authenticated app access returns PDF, so app-relative PDF actions remain hidden until the backend contract supports signed URLs or an authenticated in-app open flow.
- 2026-05-26: Post-review Argent iOS verification on iPhone 16 Pro confirmed list/detail render with hidden relative document actions, created/sent timestamps, localized `Menge` attribute copy, timeline rendering, and missing-target deep-link not-found state.
- 2026-05-26: Code-review rerun patched stale protected detail rendering during list refetch, quote/timeline 403 access-denied mapping, non-mutating response sorting, invalid-currency fallback, direct-entry back fallback, HTTPS-only document URLs, date-only deadline formatting, and hidden-tab test assertions. Argent iOS re-verified request list/detail, HTTPS-only document unavailable state, localized date-only deadline, timeline rendering, and back navigation from detail.

### Completion Notes List

- Replaced the funeral-home Quotes placeholder route with `FuneralHomeQuotesScreen`, including stable loading cards, localized empty/error states, outgoing request cards, and `/funeral-home/discover` recovery action.
- Added protected request detail at `quotes/[requestId]` using the confirmed full-detail list response plus separate `timelineApi.getQuoteRequestTimeline(requestId)` data; existing funeral-home route gates continue to own auth, role, account-status, and tenant protection.
- Added request-history status mapping, reusable `StatusBadge`, `TimelineItem`, and `QuoteRequestCard` components with German-first copy and no raw enum/internal ID primary labels.
- Tightened document/PDF handling to open only absolute HTTP(S) document URLs; app-relative API URLs, protocol-relative URLs, and storage keys render the graceful unavailable state instead of a broken external-browser action.
- Extended timeline actor parsing for backend `SYSTEM` events without broadening authenticated user roles, and localized confirmed timeline event types from live backend verification.
- Preserved Story 2.5 RFQ creation route and hid both `quotes/new` and `quotes/[requestId]` from the bottom tab bar.
- Updated backend gap notes for Story 2.6 PDF/document URL behavior and timeline actor/event verification limits.
- Code review originally left Story 2.6 in-progress because dedicated request-detail, supplier-response deep-link, and informational timeline contracts remained deferred backend/route-infrastructure work.
- Code-review rerun fixed all patch findings. On 2026-05-26, the deferred backend/route contract gaps were accepted as separately tracked follow-up work in `backend-gaps.md` and `deferred-work.md`, so Story 2.6 was closed as mobile-complete.

### File List

- `_bmad-output/implementation-artifacts/2-6-outgoing-request-history-detail-and-timeline.md`
- `_bmad-output/implementation-artifacts/backend-gaps.md`
- `_bmad-output/implementation-artifacts/deferred-work.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/app/(funeral-home)/funeral-home/quotes/[requestId].tsx`
- `src/app/(funeral-home)/funeral-home/quotes/index.tsx`
- `src/domain/requests/requestStatusDisplay.test.ts`
- `src/domain/requests/requestStatusDisplay.ts`
- `src/features/funeral-home/FuneralHomeQuotesPlaceholderScreen.tsx`
- `src/features/funeral-home/quotes/FuneralHomeQuoteRequestDetailScreen.test.tsx`
- `src/features/funeral-home/quotes/FuneralHomeQuoteRequestDetailScreen.tsx`
- `src/features/funeral-home/quotes/FuneralHomeQuotesScreen.test.tsx`
- `src/features/funeral-home/quotes/FuneralHomeQuotesScreen.tsx`
- `src/features/funeral-home/quotes/components/QuoteRequestCard.tsx`
- `src/features/funeral-home/quotes/hooks/useFuneralHomeQuoteRequestsQuery.test.tsx`
- `src/features/funeral-home/quotes/hooks/useFuneralHomeQuoteRequestsQuery.ts`
- `src/features/funeral-home/quotes/hooks/useQuoteRequestTimelineQuery.test.tsx`
- `src/features/funeral-home/quotes/hooks/useQuoteRequestTimelineQuery.ts`
- `src/features/requests/components/StatusBadge.tsx`
- `src/features/requests/components/TimelineItem.tsx`
- `src/i18n/de.ts`
- `src/i18n/en.ts`
- `src/i18n/i18n.test.ts`
- `src/navigation/RoleTabs.tsx`
- `src/navigation/roleTabs.test.tsx`
- `src/services/api/quoteRequestsApi.ts`
- `src/services/api/quoteRequestsApi.test.ts`
- `src/services/api/schemas.ts`
- `src/services/api/timelineApi.ts`
- `src/services/api/timelineApi.test.ts`
- `src/services/api/types.ts`
- `src/services/query/queryKeys.test.ts`
- `src/services/query/queryKeys.ts`
- `src/utils/formatDate.ts`

### Change Log

- 2026-05-26: Implemented outgoing request history, protected request detail, timeline/document display, deep-link-safe route handling, tests, and Argent runtime verification for Story 2.6.
- 2026-05-26: Applied code-review fixes for protected document links, timeline/date robustness, response normalization, created timestamp display, attribute labels, and missing-target query gating; deferred backend/route contract gaps remained tracked separately.
- 2026-05-26: Applied code-review rerun fixes for protected refetch gating, access-denied API mapping, cache-safe response sorting, safe price/date/document handling, direct-entry back fallback, and hidden-tab contract tests.
- 2026-05-26: Closed Story 2.6 as done after documenting run commands in `README.md` and accepting unresolved backend/route contracts as explicit follow-up gaps rather than mobile implementation blockers.
