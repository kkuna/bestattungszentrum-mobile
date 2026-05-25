# Story 2.6: Outgoing Request History, Detail, and Timeline

Status: ready-for-dev

<!-- Completion note: Story draft prepared for dev-story execution. Do not treat this as implementation evidence. -->

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

- [ ] Replace the funeral-home Quotes placeholder with an outgoing request history screen. (AC: 1, 2, 7)
  - [ ] Refactor the current route from `src/app/(funeral-home)/funeral-home/quotes.tsx` into a folder route if detail routes are added, for example `src/app/(funeral-home)/funeral-home/quotes/index.tsx` and `src/app/(funeral-home)/funeral-home/quotes/[requestId].tsx`.
  - [ ] Keep route files thin. They should render feature screens only; no API calls, DTO mapping, token/session reads, or status-label logic in route files.
  - [ ] Build `FuneralHomeQuotesScreen` or equivalent under `src/features/funeral-home`, using `Screen`, `Text`, `Button`, `Card`/domain cards, theme tokens, and the established safe-area/bottom-tab spacing.
  - [ ] Fetch outgoing requests through a feature hook backed by TanStack Query and `quoteRequestsApi.listFuneralHomeRequests()`.
  - [ ] Add centralized query keys for outgoing request list, outgoing request detail if implemented, and request timeline. Preserve existing category keys.
  - [ ] Render stable card skeletons/placeholders while loading; do not use a layout-shifting full-screen spinner as the only loading state.
  - [ ] Render a localized empty state with a practical action to `/funeral-home/discover`.

- [ ] Add reusable request-history domain UI close to the feature. (AC: 1, 3, 5, 6)
  - [ ] Add an `RfqCard`/`QuoteRequestCard` component for outgoing history under `src/features/funeral-home/components` or `src/features/requests/components` if it is deliberately shared with supplier inbox later.
  - [ ] Add a `StatusBadge` helper/component or status-display mapper if one does not exist by the time this story is implemented. Keep status labels out of JSX.
  - [ ] Add a `TimelineItem` component under `src/features/requests/components` if shared with future supplier request timelines; otherwise keep it under the funeral-home feature until reuse is real.
  - [ ] Show subject, supplier display name, category display name, status label, deadline/sent timestamp, response count/latest response summary, email-dispatch metadata where present, and document/PDF availability without exposing raw enum names or internal IDs as primary copy.
  - [ ] Use `formatDate()` or a locale-aware formatter; do not hand-format ISO date strings in components.
  - [ ] Ensure status badges and timeline states include localized text and accessibility labels, not color alone.

- [ ] Implement request detail and timeline access. (AC: 3, 5, 6, 7)
  - [ ] Add a protected outgoing request detail route that remains inside the funeral-home route group and inherits `src/app/(funeral-home)/_layout.tsx` role/account gating.
  - [ ] Use list-item data for detail only if the backend contract intentionally returns full detail in `GET /api/mobile/requests`. Otherwise add a typed API method for a confirmed request-detail endpoint before building the detail UI.
  - [ ] Call `timelineApi.getQuoteRequestTimeline(requestId)` for timeline data and handle success, empty timeline, normalized failures, and retry.
  - [ ] Show request details: subject, message, supplier, category, status, deadline, created/sent/responded timestamps, attributes summary if available, attachments/documents placeholder, response summary, and timeline.
  - [ ] For `documents` or PDF links, only render an action when a valid URL/contract exists. If PDF support is endpoint-based (`GET /api/mobile/quote-requests/:id/pdf`), add the API method and tests before exposing the action.
  - [ ] Do not implement chat, checkout, payment, order placement, supplier self-registration, or hosted conversation behavior.

- [ ] Add email deep-link resolution for protected outgoing request targets if app-link/deep-link infrastructure is available in this branch. (AC: 4)
  - [ ] Confirm current Expo Router linking/app scheme configuration before adding new deep-link paths.
  - [ ] Route unauthenticated users through the sign-in/session flow and then to protected detail only after `SessionGate` and the funeral-home route gate allow access.
  - [ ] Route wrong-role, pending, suspended, closed, verification-failed, tenantless, or unknown account states through the existing account-status path/panel rather than rendering protected request data.
  - [ ] Handle missing-target, unavailable-target, 404, access-denied, auth, network, timeout, and bad-data failures with localized recoverable states.
  - [ ] If deep-link infrastructure is not ready, implement the protected detail route and document deep-link handling as a blocked subtask rather than adding an unsafe partial link resolver.

- [ ] Extend API DTOs and backend-contract tests only as needed. (AC: 1, 3, 5, 6, 7)
  - [ ] Keep `src/services/api/quoteRequestsApi.ts` as the owner of quote-request endpoint paths and DTO mapping.
  - [ ] Keep `src/services/api/timelineApi.ts` as the owner of request timeline endpoint paths and path segment encoding.
  - [ ] Add a `getFuneralHomeRequestDetail()` method only after confirming the backend endpoint and response shape. Candidate endpoint must not be guessed in production code.
  - [ ] Add `getQuoteRequestPdf()` or document-link handling only after confirming whether the backend returns a direct PDF URL, binary response, signed URL, or app-openable document link.
  - [ ] If email-dispatch metadata is available, add it to schemas/types through Zod and map it behind API/domain helpers. Do not hard-code dispatch state from timeline titles.
  - [ ] Preserve `AppApiResult<T>` normalized success/failure behavior and fixture-backed tests for success, empty, validation/bad-data, unauthorized, access denied, not found, timeout/network, and server failures.

- [ ] Add German-first and English localization for all new copy. (AC: 1-7)
  - [ ] Add `funeralHome.quotes.*` keys for list title, loading, empty, error, retry, card labels, detail labels, response summary, document/PDF states, timeline section, and deep-link failure states.
  - [ ] Add status-label keys for quote request statuses, quote response statuses, email dispatch states, and timeline event states through centralized mapping helpers.
  - [ ] Keep German copy calm and operational. Use request/history language such as `Anfragen`, `Verlauf`, `Status`, `Antwort`, and `Dokument`, not checkout/order/cart/payment/chat language.
  - [ ] Update English to mirror the German structure. Update non-primary locale forwarding only if the typed translation shape requires it.

- [ ] Add focused tests and required runtime verification. (AC: 1-7)
  - [ ] Add API tests for new or extended `quoteRequestsApi`/`timelineApi` behavior and path encoding.
  - [ ] Add query-key/hook tests for list/detail/timeline query behavior, normalized failure mapping, and session-scope cache behavior where relevant.
  - [ ] Add component tests for outgoing list success, loading skeletons, empty state with Discover action, normalized error retry, card metadata, detail success, missing documents/PDF, response summary, timeline success/empty/error, and localized status labels.
  - [ ] Add route/deep-link tests for unauthenticated, wrong-role, suspended/pending, correct-role, not-found, and backend failure states if deep-link infrastructure is implemented.
  - [ ] Run `pnpm compile`, focused Jest tests, `pnpm test --runInBand`, `pnpm lint:check`, `pnpm depcruise`, and `git diff --check`.
  - [ ] Because this story affects app runtime behavior, navigation, screens, API behavior, and protected data, verify with Argent on at least one simulator/emulator. Do not claim simulator/emulator verification unless Argent was actually used.

## Dev Notes

### Current Source State

- `src/app/(funeral-home)/funeral-home/quotes.tsx` currently renders `FuneralHomeQuotesPlaceholderScreen`; this is the main route to replace or refactor into a folder route for list/detail.
- `src/features/funeral-home/FuneralHomeQuotesPlaceholderScreen.tsx` is only placeholder content and should be replaced by a real feature screen in this story.
- `src/app/(funeral-home)/_layout.tsx` already fails closed for signed-out, wrong-role, pending, suspended, missing-tenant, or unknown account states by redirecting through `/` or `/account-status`. Preserve this gate; do not duplicate protected-data decisions inside the screen except for CTA-specific messaging.
- `src/app/(funeral-home)/funeral-home/_layout.tsx` renders `FuneralHomeTabs`; `src/navigation/RoleTabs.tsx` already defines the `quotes` tab with localized label/accessibility keys.
- Story 2.1 established TanStack Query in `src/services/query` and wraps the app root with `QueryProvider`. `QueryProvider` clears/remounts query scope when authenticated user/tenant changes. Keep request-history queries scoped through this provider and central query keys.
- `src/services/query/queryKeys.ts` currently only contains category keys. Extend it rather than creating local ad-hoc query keys.
- `src/services/api/quoteRequestsApi.ts` already has `listFuneralHomeRequests()` calling `GET /api/mobile/requests` and returning `AppApiResult<QuoteRequestListItemDto[]>`.
- `src/services/api/timelineApi.ts` already has `getQuoteRequestTimeline(requestId)` calling `GET /api/mobile/quote-requests/:id/timeline`, validates the path id, encodes dynamic segments, and returns `AppApiResult<RequestTimelineEventDto[]>`.
- `src/services/api/schemas.ts` defines `quoteRequestSchema`, `quoteResponseSchema`, `requestTimelineEventSchema`, `documentAssetSchema`, `emailDispatchSchema`, and `quoteRequestListItemSchema`. `quoteRequestListItemSchema` includes optional `documents`, `timeline`, `category`, `responses`, `supplier`, `funeralHome`, and `response`, but does not currently include an email-dispatch field.
- `src/services/api/apiResult.ts` and `src/services/api/apiProblem.ts` own backend envelope unwrapping and normalized failure mapping. Screens and hooks must not inspect raw apisauce responses.
- `src/utils/formatDate.ts` provides a date-fns based formatter and dynamic locale loading. Use it or extend locale-aware formatting instead of manual string slicing.
- `src/i18n/de.ts` and `src/i18n/en.ts` already contain `funeralHome.quotes` placeholder keys. This story should replace/extend those keys with list/detail/timeline copy.
- Existing domain account status mapping lives in `src/domain/account/accountAccess.ts`. Request/response/email/timeline status mapping should be added in a new request/status domain helper only when shared display logic exists.

### Backend / API Contract Assumptions and Blockers

- `listFuneralHomeRequests()` uses `GET /api/mobile/requests`, while planning docs also mention quote-request endpoints. Treat the implemented API module as the current source of truth, but confirm the backend path before adding detail behavior.
- No dedicated mobile request-detail API method exists in the source. If `GET /api/mobile/requests` does not return full detail, this story is blocked on confirming a detail endpoint and response shape.
- Planning docs list `GET /api/mobile/quote-requests/:id/pdf`, but no source API method exists. Do not expose a PDF button until the backend contract confirms whether the response is a direct URL, binary PDF, signed URL, or document asset.
- `emailDispatchSchema` exists, but request list/detail DTOs do not currently include email dispatch records. Email-dispatch metadata in cards/detail is conditional on backend support or an agreed DTO extension.
- Timeline event `status` currently allows `DONE`, `PENDING`, and `FAILED`; the UX asks for completed, pending, failed, and informational states. The implementation must define whether informational maps from event type, event status, or a backend DTO extension.
- Quote request statuses currently come from the API schema. If backend quote lifecycle naming changes, isolate that in API/domain mapping and tests before rendering labels.
- Deep-link behavior may require app scheme/app-link configuration outside the Quotes screen. If that infrastructure is absent, mark the deep-link subtask blocked rather than bypassing auth/role gates.
- Previously, real backend current-user responses omitted `accountStatus`/`userStatus`; Story 2.1 used a documented dev-only active-session fixture for Argent verification. Expect the same constraint until backend auth/me is aligned.

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
  - Screens/hooks: `src/features/funeral-home/*` for funeral-home-only list/detail behavior.
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

## Expected File Changes

Likely NEW files:

```text
src/app/(funeral-home)/funeral-home/quotes/index.tsx
src/app/(funeral-home)/funeral-home/quotes/[requestId].tsx
src/features/funeral-home/FuneralHomeQuotesScreen.tsx
src/features/funeral-home/FuneralHomeQuoteRequestDetailScreen.tsx
src/features/funeral-home/hooks/useFuneralHomeQuoteRequestsQuery.ts
src/features/funeral-home/hooks/useQuoteRequestTimelineQuery.ts
src/features/funeral-home/components/QuoteRequestCard.tsx
src/features/requests/components/TimelineItem.tsx
src/features/requests/components/StatusBadge.tsx
src/domain/requests/requestStatusDisplay.ts
src/features/funeral-home/FuneralHomeQuotesScreen.test.tsx
src/features/funeral-home/FuneralHomeQuoteRequestDetailScreen.test.tsx
```

Likely UPDATE files:

```text
src/app/(funeral-home)/funeral-home/quotes.tsx
src/services/query/queryKeys.ts
src/services/api/quoteRequestsApi.ts
src/services/api/schemas.ts
src/services/api/types.ts
src/services/api/apiResult.test.ts
src/i18n/de.ts
src/i18n/en.ts
src/i18n/ar.ts
src/i18n/es.ts
src/i18n/fr.ts
src/i18n/hi.ts
src/i18n/ja.ts
src/i18n/ko.ts
```

Only update `quoteRequestsApi`, schemas/types, and non-primary locale files if confirmed contract or TypeScript translation shape requires it. If converting `quotes.tsx` to a folder route, remove the old file in the implementation branch after the new `quotes/index.tsx` route is in place.

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
- [Source: `src/app/(funeral-home)/funeral-home/quotes.tsx` and `src/features/funeral-home/FuneralHomeQuotesPlaceholderScreen.tsx` - current Quotes placeholder]
- [Source: `src/services/api/quoteRequestsApi.ts` - current outgoing/supplier request list API methods]
- [Source: `src/services/api/timelineApi.ts` - request timeline API method]
- [Source: `src/services/api/schemas.ts` and `src/services/api/types.ts` - quote request, response, document, email dispatch, timeline, and list item DTOs]
- [Source: `src/services/api/apiResult.ts` and `src/services/api/apiProblem.ts` - normalized API result and failure mapping]
- [Source: `src/services/query/QueryProvider.tsx` and `src/services/query/queryKeys.ts` - query provider/session-scope behavior and current central keys]
- [Source: `src/utils/formatDate.ts` - locale-aware date formatting helper]
- [Source: `src/i18n/de.ts` and `src/i18n/en.ts` - current funeral-home Quotes placeholder copy and translation structure]
- [Source: Repowise `get_answer` for this topic returned weak retrieval on 2026-05-25; actual source files above were used as source of truth.]

## Dev Agent Record

### Agent Model Used

TBD by dev agent.

### Debug Log References

### Completion Notes List

### File List
