---
title: Bestattungszentrum Mobile App
status: draft
created: 2026-05-21
updated: 2026-05-23
sourceDocuments:
  - /Users/fariskunic/Documents/personal/bsc/Bestattungszentrum/docs/mobile-app-prd.md
  - /Users/fariskunic/Documents/personal/bsc/Bestattungszentrum/_bmad-output/planning-artifacts/epics.md
  - /Users/fariskunic/Documents/personal/bsc/Bestattungszentrum/_bmad-output/planning-artifacts/architecture.md
  - /Users/fariskunic/Documents/personal/bsc/Bestattungszentrum/_bmad-output/planning-artifacts/ux-design-specification.md
---

# PRD: Bestattungszentrum Mobile App

## 0. Document Purpose

This PRD is the canonical BMAD-ready product requirements document for the Bestattungszentrum mobile application. It normalizes the original source PRD from `docs/mobile-app-prd.md` into a traceable structure for downstream UX, architecture, epic, story, and implementation-readiness workflows.

The stable requirement IDs in this document intentionally mirror the existing requirements inventory in `_bmad-output/planning-artifacts/epics.md` so already-created epics and stories remain aligned. Related downstream artifacts are:

- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/epics.md`

## 1. Vision

Bestattungszentrum Mobile is a role-aware Expo application for Germany-based funeral homes and suppliers. Funeral homes use it to register, discover verified suppliers, and send structured quote requests. Suppliers use it to receive requests, submit quote responses, and maintain the operational parts of their profile or catalog once an admin-created account exists.

The product thesis is trust-first B2B RFQ workflow on mobile, not ecommerce. The app should help funeral-home staff move quickly under time pressure while preserving supplier verification, tenant boundaries, structured records, and email-backed substantive communication.

The mobile product must build on the existing Ignite/Expo foundation instead of replacing it. Expo Router, Ignite components, theme tokens, i18n, apisauce, MMKV, Reactotron, Jest, Maestro, and dependency-cruiser remain first-class implementation constraints.

## 2. Target User

### 2.1 Primary Personas

**Funeral Home Staff** are owners, operations managers, and staff at German funeral homes. They often coordinate urgent services under time pressure and need to find trusted suppliers and send complete requests quickly.

**Supplier Staff** are sales or operations users at supplier companies created by platform admins. They need to review incoming requests and respond with clear availability, pricing, lead time, and terms.

**Platform Admins** primarily use the existing Next.js back office. Mobile admin features are not part of v1 except where internal testers use seeded credentials.

### 2.2 Jobs To Be Done

- Funeral-home staff can register, understand verification status, find trusted suppliers, and send complete RFQs from a phone.
- Supplier staff can understand incoming RFQs, inspect structured request detail, and submit clear quote responses.
- Platform operators can rely on the app to preserve verification, role, tenant, and communication boundaries.
- Implementation teams can build against stable mobile requirements without replacing the existing app architecture.

### 2.3 Non-Users In v1

- Consumer families arranging funerals directly.
- Supplier companies trying to self-register without platform admin creation.
- Platform admins seeking a full mobile back-office replacement.
- Buyers outside Germany.

### 2.4 Key User Journeys

**UJ-1. Funeral-home staff signs in and lands in the correct role experience.** A verified funeral-home user opens the app, signs in through mobile auth, the app validates the current user and token state, and the user lands in the funeral-home tab shell. If the account is pending, suspended, or otherwise restricted, the user sees an account-status panel before business actions are available. Realized by FR1-FR10.

**UJ-2. Funeral-home staff discovers a verified supplier and starts an RFQ.** A funeral-home user opens Discover, searches or filters by category, region, language, or certification, reviews supplier cards, opens a supplier detail screen, and starts a quote request. If no suppliers match, the app offers clear empty-state recovery. Realized by FR11-FR14 and FR33.

**UJ-3. Funeral-home staff sends a structured quote request.** A funeral-home user completes universal RFQ fields, fills category-specific fields rendered from `quoteFormSchema`, reviews the request, submits it, and receives confirmation that the request was saved and the supplier was notified by email when dispatch status is available. Unsupported schema fields do not crash the flow. Realized by FR15-FR20 and FR35.

**UJ-4. Supplier staff responds to an incoming RFQ.** A supplier user signs in, sees open requests, opens a request detail screen, reviews structured attributes and contact information, submits a quote response with price, validity, lead time, message, and attachments placeholder, then sees a receipt explaining the response and email-dispatch state. Realized by FR23-FR28 and FR35.

**UJ-5. Funeral-home applicant submits signup and understands review status.** A public applicant opens signup, enters account, company, legal, address, contact, and billing details, reviews the application, submits it, and sees a result state such as pending approval, pending review, verification failed, or manual review. Validation failures preserve form progress. Realized by FR30-FR32.

## 3. Glossary

- **Account Status** - The current access state for an authenticated user or applicant, including active, pending approval, pending review, suspended, verification failed, and unavailable/manual review.
- **App Shell** - The route, navigation, theme, safe-area, keyboard, and session structure that frames authenticated and unauthenticated app flows.
- **Category** - A supplier or RFQ classification returned by the backend and used for discovery and dynamic RFQ fields.
- **Funeral Home** - A German funeral-home tenant using the app to discover suppliers and send RFQs.
- **Funeral Home Staff** - A user belonging to a Funeral Home tenant.
- **Quote Request** - A structured RFQ sent by a Funeral Home to a Supplier.
- **Quote Response** - A Supplier's structured answer to a Quote Request, including pricing, validity, lead time, message, and attachment placeholder.
- **RFQ** - Request for quote. In this PRD, RFQ and Quote Request refer to the same domain object.
- **Supplier** - A verified supplier company available for discovery and RFQ response.
- **Supplier Staff** - A user belonging to a Supplier tenant.
- **Tenant** - The organization boundary for user role, data access, and request/response records.
- **Timeline** - The ordered event history for a Quote Request or Quote Response.
- **Verification** - The platform process and status model used to decide whether an applicant, Funeral Home, or Supplier can perform business actions.

## 4. Features

### 4.1 Role-Aware App Shell and Session Foundation

**Description:** The app replaces the Ignite boilerplate welcome screen with a role-aware mobile shell, explicit unauthenticated routes, auth integration, typed session storage, token refresh, boot validation, route groups, and account-status handling. Realizes UJ-1.

**Functional Requirements:**

#### FR1: Replace boilerplate welcome route

The app must replace the boilerplate welcome route with a role-aware app shell.

**Consequences:**
- App launch no longer shows the Ignite sample Welcome screen.
- Authenticated and unauthenticated users route through product-specific entry points.

#### FR2: Support unauthenticated entry points

The app must support unauthenticated login, funeral-home signup, forgot-password placeholder, and legal-link entry points.

**Consequences:**
- Login and signup are reachable without an authenticated session.
- Legal links include Impressum, Datenschutz, and AGB placeholder entries.

#### FR3: Authenticate through mobile auth endpoints

The app must authenticate users through the backend mobile auth endpoints for login, refresh, current user, logout, and logout-all.

**Consequences:**
- API modules cover `POST /api/mobile/auth/login`, `POST /api/mobile/auth/refresh`, `GET /api/mobile/auth/me`, `POST /api/mobile/auth/logout`, and `POST /api/mobile/auth/logout-all`.
- Screens do not call raw auth endpoints directly.

#### FR4: Store session fields behind typed boundary

The app must store access token, refresh token, expiry, user id, role, tenant id, and language preference through a typed session storage boundary.

**Consequences:**
- Token material is accessed only through session storage/service modules.
- Storage uses MMKV initially and can be replaced without changing screens.

#### FR5: Refresh on 401 with fallback

The app must refresh the session on 401 once, replay the original request once, and fall back to logout or account recovery state if refresh fails.

**Consequences:**
- Infinite retry loops are impossible.
- Failed refresh clears or blocks the session through a visible state.

#### FR6: Validate session at boot

The app must validate the session at boot and route users by role, tenant, account status, and language preference.

**Consequences:**
- Boot cannot expose protected screens before role and account state are known.
- Wrong-role and restricted-account states fail closed.

#### FR7: Provide route groups

The app must provide separate Expo Router route groups for auth, funeral-home, supplier, and shared flows.

**Consequences:**
- Expected groups are `src/app/(auth)`, `src/app/(funeral-home)`, `src/app/(supplier)`, and `src/app/(shared)`.
- Route files stay thin and render feature screens.

#### FR8: Funeral-home tabs

Funeral-home users must see role-specific tabs for Home, Discover, Quotes, Profile, and Settings.

**Consequences:**
- Supplier-only screens are not available from funeral-home navigation.
- Tab labels are localized.

#### FR9: Supplier tabs

Supplier users must see role-specific tabs for Home, Requests, Catalog, Profile, and Settings.

**Consequences:**
- Funeral-home discovery and signup business actions are not available from supplier navigation.
- Tab labels are localized.

#### FR10: Block restricted routes

The app must block wrong-role, suspended, pending, or unavailable routes through a clear account/status screen before business actions begin.

**Consequences:**
- Restricted users receive explanation and next-step guidance.
- Business actions such as sending RFQs or quote responses are not available when blocked.

### 4.2 Funeral-Home Supplier Discovery and RFQ Flow

**Description:** Funeral-home users can browse categories, discover suppliers, inspect supplier details, create schema-driven RFQs, review before sending, and track outgoing requests. Realizes UJ-2 and UJ-3.

**Functional Requirements:**

#### FR11: Home and category discovery

Funeral homes must be able to browse supplier categories and featured/recent supplier or request shortcuts from the funeral-home home screen.

**Consequences:**
- Home screen gives a useful starting point before search.
- Category data comes from the backend rather than hard-coded screens.

#### FR12: Supplier search and filters

Funeral homes must be able to search suppliers by text and filter by category, region, language, and certification where backend support exists.

**Consequences:**
- Supplier search supports backend `q` parameter unless the contract changes.
- Unsupported filters are hidden, disabled, or clearly marked until backend support exists.

#### FR13: Supplier cards

The app must show supplier cards with logo or fallback mark, name, categories, regions, short description, verification status, language indicators, and RFQ CTA.

**Consequences:**
- Cards remain scannable on compact phones.
- Missing logos render a stable fallback.

#### FR14: Supplier detail

Funeral homes must be able to open supplier detail screens showing metadata, category badges, contact transparency, and a request CTA.

**Consequences:**
- Supplier detail offers enough context before RFQ creation.
- The RFQ CTA preserves supplier and category context.

#### FR15: Universal RFQ fields

Funeral homes must be able to create a quote request using universal fields: subject, message, deadline, attachments placeholder, quantity when applicable, and supplier/category context.

**Consequences:**
- RFQ forms collect enough common information for suppliers to answer.
- Attachment support is presented as a placeholder until backend upload contract is confirmed.

#### FR16: Dynamic category fields

The app must render category-specific RFQ fields from backend-provided `quoteFormSchema` rather than hard-coded category screens.

**Consequences:**
- Category-specific fields come from backend data.
- New categories do not require new hard-coded mobile screens.

#### FR17: Unsupported schema fallback

The RFQ flow must normalize dynamic schema fields into supported mobile controls and handle unsupported field types without crashing.

**Consequences:**
- Unsupported fields display a recoverable fallback state.
- Schema parsing and mapping are covered by tests.

#### FR18: RFQ review

Funeral homes must be able to review a complete RFQ before sending it.

**Consequences:**
- Review screen summarizes recipient, category, universal fields, dynamic fields, and attachments placeholder.
- Users can return to edit before submit.

#### FR19: RFQ submit receipt

Submitting an RFQ must call the backend quote-request endpoint and show a receipt explaining the request was saved and the supplier was notified by email when dispatch status is available.

**Consequences:**
- Receipt avoids purchase, checkout, order, or payment language.
- Email dispatch queued, failed, and unknown states are explicit.

#### FR20: Outgoing request history

Funeral-home users must be able to view outgoing quote requests with statuses, timeline access, response summaries, and PDF links where available.

**Consequences:**
- Request history supports empty, loading, offline/retry, and error states.
- PDF links are shown only where backend support exists.

#### FR21: Supplier response reading

Funeral-home users must be able to read supplier responses and open related documents where backend support exists.

**Consequences:**
- Response summaries and details expose price, validity, lead time, message, and attachment placeholder/document links as available.

#### FR22: Suspended funeral-home read-only mode

Suspended funeral-home users must be able to read history but must not be able to send new quote requests.

**Consequences:**
- Restricted actions are disabled or replaced with account-status explanation.
- Existing history remains accessible when allowed by backend authorization.

### 4.3 Supplier Request Inbox and Quote Response Flow

**Description:** Supplier users can see open requests, inspect structured detail and timelines, submit quote responses, and avoid duplicate or ambiguous response states. Realizes UJ-4.

**Functional Requirements:**

#### FR23: Supplier home

Supplier users must see a home screen with open request count and profile completeness.

**Consequences:**
- Supplier home exposes the most relevant work without becoming a full back office.

#### FR24: Incoming RFQ list

Supplier users must be able to view incoming RFQs grouped or prioritized by status and deadline.

**Consequences:**
- Inbox rows communicate urgency and status.
- Empty, loading, offline/retry, and error states are explicit.

#### FR25: Supplier request detail

Supplier users must be able to open request detail screens with funeral-home contact, structured attributes, attachments placeholder, timeline, and response state.

**Consequences:**
- Request detail includes enough information to prepare a quote response.
- Timeline and existing response state reduce duplicate work.

#### FR26: Quote response form

Supplier users must be able to submit quote responses with price amount or range, validity date, lead time days, message, and attachments placeholder.

**Consequences:**
- Quote responses are structured enough for funeral homes to compare.
- Attachment support follows backend contract when available.

#### FR27: Quote response receipt

Supplier quote response submission must show a receipt explaining the response was saved and the funeral home was notified by email when dispatch status is available.

**Consequences:**
- Receipt is factual and restrained.
- Email dispatch uncertainty is represented directly.

#### FR28: Sent response clarity

Supplier users must be able to see which responses were already sent and avoid duplicate or ambiguous response states.

**Consequences:**
- Already-responded requests are visually distinct.
- Duplicate submission paths are blocked or confirmed by backend state.

#### FR29: Supplier catalog placeholder

The app must include a supplier catalog placeholder that can read current items where available while deferring item editing unless backend permissions and UX are confirmed.

**Consequences:**
- Catalog appears as a scoped placeholder, not a promised editing workflow.
- Editing remains out of scope until confirmed.

### 4.4 Funeral-Home Signup and Verification

**Description:** Public applicants can submit funeral-home signup information through a guided flow and understand review or verification outcomes. Realizes UJ-5.

**Functional Requirements:**

#### FR30: Public signup flow

Funeral-home applicants must be able to submit a public signup flow with account credentials, company/legal details, Handelsregister/VAT or sole-proprietor path, address/contact/billing email, review, and submit.

**Consequences:**
- Signup uses `POST /api/public/funeral-home-signups` unless a mobile-namespaced endpoint is added.
- Sole-proprietor path is designed but may depend on backend document upload support.

#### FR31: Signup result states

Signup must support pending approval, pending review, verification failed/correctable input, and verification unavailable/manual-review result states.

**Consequences:**
- Applicants understand whether they can act, wait, correct input, or contact support.

#### FR32: Recoverable signup validation

Signup validation errors must be recoverable without losing entered form progress.

**Consequences:**
- Field and step validation errors preserve entered data.
- Users can return to correct invalid steps.

### 4.5 Shared Workflow, Domain, and Platform Boundaries

**Description:** Shared screens, deep links, email-backed communication, domain DTOs, API isolation, and ecommerce boundaries keep the product coherent across roles. Realizes all user journeys.

**Functional Requirements:**

#### FR33: Shared screens

The app must provide shared screens for notifications/preferences placeholder, language switching, session/security, error states, empty states, offline/retry states, legal links, and request timelines.

**Consequences:**
- Shared flows have consistent layout, tone, and recovery behavior.

#### FR34: Email deep links

The app must support email deep links into relevant request or response detail after auth and role checks.

**Consequences:**
- Deep links cannot bypass auth, tenant, or role gates.
- Failed or unavailable targets show recoverable states.

#### FR35: Email-backed communication

The app must keep substantive communication email-backed while preserving request, response, timeline, and dispatch records in the app.

**Consequences:**
- The app records structured RFQ and response history.
- Chat or hosted conversation threads are not introduced in v1.

#### FR36: MVP exclusions enforced in UI

The app must not expose in-app payments, checkout, escrow, marketplace fee collection, public consumer/family flows, real-time chat, supplier self-registration, or full mobile back-office workflows in MVP.

**Consequences:**
- Navigation, labels, receipts, and CTAs avoid these flows and terms.

#### FR37: Marketplace checkout disposition

If the backend marketplace checkout endpoint is used later, the app must present it only as request basket or bulk RFQ workflow, never as purchase, order, or payment.

**Consequences:**
- `POST /api/mobile/marketplace-checkout` is not exposed as checkout in MVP.
- Any later use requires product naming and UX review.

#### FR38: Mobile DTOs

The app must define mobile DTOs for auth tokens, current user, category, supplier, supplier item, quote request, quote response, request timeline event, funeral-home signup input, create quote request input, create quote response input, and API error.

**Consequences:**
- DTOs support mapper and fixture tests.
- Screens depend on domain-facing models rather than raw response shapes.

#### FR39: Cross-repo source isolation

The mobile app must not import backend source directly across repositories for MVP.

**Consequences:**
- Backend contract reuse happens through generated client later, shared package later, or handwritten DTOs for MVP.

#### FR40: Funeral-home vertical slice

The first local vertical slice must allow funeral-home users to log in, view categories, view suppliers, submit an RFQ, and see it in request history.

**Consequences:**
- This slice is the minimum integrated proof for the funeral-home role.

#### FR41: Supplier vertical slice

The corresponding supplier vertical slice must allow supplier users to log in, view an incoming RFQ, and submit a response.

**Consequences:**
- This slice proves the request/response loop from the supplier role.

## 5. Non-Goals

- No supplier self-registration.
- No in-app payments, checkout, escrow, marketplace fee collection, Stripe, PSP, purchase, order, or ecommerce flow.
- No public consumer or family-facing experience.
- No real-time chat or hosted conversation threads.
- No full back-office replacement on mobile.
- No support for countries outside Germany in v1.
- No hard-coded quote forms per category; dynamic schemas must drive category-specific fields.
- No backend source imports across repositories for MVP.
- No supplier catalog item editing unless backend permissions and UX are confirmed.
- No EAS-managed release assumption; production release uses local/native build artifacts uploaded manually by the owner.

## 6. MVP Scope

### 6.1 In Scope

- Role-aware app shell and route groups.
- German-first theme and i18n baseline.
- Auth API methods, typed session storage, boot validation, refresh-on-401, and logout flows.
- Funeral-home home, category discovery, supplier search/filtering, supplier cards, supplier detail, RFQ creation, RFQ review, RFQ receipt, and outgoing request history.
- Supplier home, incoming request inbox, request detail, quote response form, quote response receipt, and catalog placeholder.
- Public funeral-home signup with guided form, review, submission, and result states.
- Shared empty, loading, error, offline/retry, language, session/security, legal, timeline, and account-status screens.
- Mobile DTOs, API result normalization, mapping helpers, and fixture-backed tests.
- Maestro smoke flows for funeral-home login/RFQ and supplier login/response once simulator/dev-client flow is ready.

### 6.2 Out of Scope for MVP

- Supplier self-registration.
- Consumer/family workflows.
- Payments, purchase/order flow, checkout, escrow, or marketplace fee collection.
- Real-time chat.
- Full mobile admin/back-office.
- Supplier catalog editing.
- Countries outside Germany.
- Generated OpenAPI client unless backend OpenAPI is aligned with implementation.
- Concrete third-party crash/error tracking before GDPR/DPA and release-readiness review.

## 7. Success Metrics

**Primary**

- **SM-1: Funeral-home RFQ slice completion.** A funeral-home test user can complete login, category view, supplier view, RFQ submit, and request-history confirmation in local development. Validates FR1-FR20 and FR40.
- **SM-2: Supplier response slice completion.** A supplier test user can complete login, inbox view, request detail, quote response submit, and receipt confirmation in local development. Validates FR23-FR28 and FR41.
- **SM-3: Role and account boundary correctness.** Wrong-role, suspended, pending, and unavailable states are blocked before business actions begin. Validates FR6, FR10, FR22, FR34, NFR12, and NFR13.

**Secondary**

- **SM-4: German-first UI readiness.** Visible MVP UI is localized, German copy does not overflow in buttons, tabs, cards, forms, and empty states on compact phones. Validates NFR1-NFR7, NFR14, NFR20, and NFR21.
- **SM-5: API boundary test coverage.** Auth storage, refresh behavior, API problem mapping, and DTO mapping tests pass for core endpoints. Validates FR3-FR5, FR38, FR39, NFR10, NFR15, and NFR16.
- **SM-6: Quality gates pass.** `pnpm compile`, `pnpm lint:check`, `pnpm test`, and `pnpm depcruise` pass or documented lint debt is explicitly accepted. Validates NFR18.

**Counter-metrics**

- **SM-C1: Ecommerce language avoidance.** The app must not increase use of checkout, cart, order, purchase, payment, celebratory, playful, or consumer-shopping language. Counterbalances any optimization toward conversion-like flows.
- **SM-C2: Design-system restraint.** The app must not introduce a second UI kit or design system before Ignite primitives prove insufficient. Counterbalances velocity-driven UI library additions.
- **SM-C3: Sensitive debug safety.** Reactotron and debug logs must not expose tokens, PII, tenant identifiers beyond safe development context, or sensitive account data. Counterbalances development observability.

## 8. Non-Functional Requirements

- **NFR1:** The app must be German-first and English-supported from the first implementation pass.
- **NFR2:** No visible user-facing strings may be hard-coded in screens or reusable components; all labels, errors, statuses, accessibility labels, and legal/navigation text must come through i18n.
- **NFR3:** German copy must be the canonical layout stress case and must be tested in buttons, tabs, cards, empty states, form labels, status badges, and small-screen layouts.
- **NFR4:** The app must meet WCAG AA-equivalent mobile accessibility expectations where practical.
- **NFR5:** All actionable controls must provide at least 48dp touch targets.
- **NFR6:** Status must never rely on color alone and must include localized text and accessibility labels where relevant.
- **NFR7:** The app must support VoiceOver/TalkBack labels, screen-reader task order, form error associations, focus/pressed/loading states, and Dynamic Type where practical.
- **NFR8:** The mobile cold-start target is under 3 seconds on mid-range Android.
- **NFR9:** Writes require connectivity in v1; reading should be offline-tolerant where feasible for previously loaded requests, profile/status information, and cached list/detail data.
- **NFR10:** Token material must be accessed only through the typed session storage/service boundary.
- **NFR11:** The app must avoid logging PII, tokens, or sensitive account data in Reactotron, errors, analytics, or debug events.
- **NFR12:** Deep links must resolve through auth and role gates before loading protected content.
- **NFR13:** The app must preserve tenant boundaries and fail closed on wrong-role navigation.
- **NFR14:** Date, number, currency, plural, enum, and status display must use locale-aware formatters and mapping helpers.
- **NFR15:** API modules must return normalized app results rather than leaking apisauce internals into screens.
- **NFR16:** Backend contract drift must be isolated behind typed API modules, DTOs, mappers, and fixture-based tests.
- **NFR17:** The app must keep Ignite components, Expo Router, theme provider, i18n, apisauce, MMKV, Reactotron, Jest/RNTL, Maestro, and dependency-cruiser first-class.
- **NFR18:** `pnpm compile`, `pnpm lint:check`, `pnpm test`, and `pnpm depcruise` must remain the main quality gates, with lint debt documented if accepted.
- **NFR19:** Maestro smoke flows must cover login as funeral home, login as supplier, and at least one RFQ happy path once simulator/dev-client flows are ready.
- **NFR20:** The UI must avoid checkout, cart, order, purchase, payment, chat, celebratory, playful, or consumer-shopping language and patterns.
- **NFR21:** Layouts must work on compact phones, standard phones, large phones, and tablets where supported without text overlap or bottom-navigation/keyboard collisions.
- **NFR22:** Animations and transitions must be subtle and respect reduced motion settings.
- **NFR23:** Production release must use local/native build artifacts uploaded manually by the owner; implementation must not assume EAS-managed submission.
- **NFR24:** The app must support iOS simulator, Android emulator, physical iPhone, and physical Android development/testing paths.
- **NFR25:** The app must support local API URL configuration for iOS simulator, Android emulator, physical Android via `pnpm adb`, physical iOS through LAN-accessible backend URL, and production API URLs.

## 9. UX and Design Requirements

- Use the Quiet OTTO Native direction: light gray canvas, prominent rounded top search, white modules, modular category grid, horizontal content rhythm, red active tab state, and stable bottom navigation.
- Replace retail energy with supplier categories, RFQ status cards, verified supplier tiles, request shortcuts, and professional workflow content.
- Use Guided Anfrage patterns for signup, RFQ creation, and quote response forms.
- Use Quiet Ledger patterns for request history, supplier inbox, timelines, account/security screens, status rows, timestamps, and compact repeated work items.
- Use Warm Institutional patterns for splash, onboarding, signup status, pending approval, pending review, verification failed, suspended account, and dignified brand/status moments.
- Archive earlier explorations as non-reference directions; do not implement Operational Red, Supplier Command, Blue Dispatch Accent, or Restrained OTTO Framework directly.
- Use `#B8312F` as canonical brand red, `#8E2422` as pressed/deep red, `#C8102E` as accent, warm off-white backgrounds, white surfaces, warm borders, near-black text, and separate semantic success/warning/danger/info colors.
- Use red for primary actions, active navigation, selected filters, and key brand moments; do not use red as a constant alert/background color.
- Use Cormorant Garamond for splash, selected onboarding headings, selected empty states, and occasional major screen titles only.
- Use Inter or Noto Sans for product UI, dense lists, form labels, buttons, tabs, helper text, badges, validation copy, and long German text.
- Replace the existing Space Grotesk default rather than mixing Space Grotesk with the new display/UI font pairing.
- Use an 8px spacing rhythm with 4px fine adjustments, 16px default horizontal padding, 20-24px section spacing, and 8-12px dense row/card spacing.
- Use stable dimensions for chips, tabs, icon buttons, badges, form controls, and action buttons to prevent layout shifts.
- Avoid nested cards and prefer cards only for repeated items, focused modules, modals, and genuinely framed tools.
- Build App Search Header, Category Tile, Supplier Card, RFQ Card, Status Badge, Guided Form Stepper, Dynamic Schema Field, Review Summary Block, Submission Receipt, Account Status Panel, and Timeline Item components as defined by the UX and epics artifacts.
- Use one primary button per decision area, reserve primary styling for send RFQ, submit response, complete signup, and save account changes, and provide secondary, ghost, and destructive treatments as appropriate.
- Business-action completions must show what happened, when it happened, what was saved, whether email was sent or uncertain, and the next expected step.
- Error, loading, empty, search, filter, modal, and bottom-sheet states must be calm, recoverable, localized, and layout-stable.

## 10. Architecture and Implementation Constraints

- Keep the existing Ignite 11.5 / Expo SDK 55 repository foundation; do not scaffold or replace the app.
- Use Expo Router route groups for `(auth)`, `(funeral-home)`, `(supplier)`, and `(shared)` with thin route files that render feature screens.
- Use feature-oriented organization under `src/features`, shared domain logic under `src/domain`, integration/session/query/preferences under `src/services`, and base Ignite primitives under `src/components`.
- Keep REST through apisauce as the mobile API protocol for MVP.
- Add API modules for `authApi`, `categoriesApi`, `suppliersApi`, `quoteRequestsApi`, `quoteResponsesApi`, `timelineApi`, and `signupApi`.
- API modules must own endpoint paths, backend parameter naming, DTOs, response validation/mapping, problem mapping, and normalized result shapes.
- Use handwritten TypeScript DTOs and domain mappers for MVP; defer generated OpenAPI clients until backend OpenAPI matches implementation.
- Introduce Zod for critical API/form boundary validation: auth/session, current user, categories, `quoteFormSchema`, quote request creation, quote response creation, and signup result/status.
- Introduce TanStack Query v5 for categories, suppliers, requests, supplier inbox, timelines, and response summaries after the first real API slice starts.
- Keep auth boot/session refresh outside TanStack Query so startup remains explicit and predictable.
- Use React Hook Form for guided signup, RFQ, and quote-response forms.
- Use MMKV-backed `sessionStorage` and `sessionService` for login, refresh, logout, logout-all, and boot hydration.
- The app must not decode JWT claims because backend auth uses opaque access tokens plus rotating refresh tokens.
- Refresh token rotation must update storage atomically where practical.
- Query keys must come from a central query-key module once query support exists.
- Add centralized status mapping for account states, quote request states, quote response states, verification states, and email dispatch states.
- Runtime app config must live under `src/config`; backend URLs must not be hard-coded in feature code.
- Physical-device API URL support must be explicit because physical devices cannot rely on simulator-only localhost addresses.
- Maintain `src/utils/crashReporting` as an abstraction and defer concrete third-party error tracking until GDPR/DPA and release-readiness review.
- Reactotron must remain development-only and must not log tokens or PII.
- Native iOS/Android folders are valid project boundaries for local builds, simulator/device testing, signing, app links, privacy manifests, icons, splash, and manual release artifacts.
- Implementation agents must not edit native project files unless a story explicitly requires native configuration.

## 11. Backend Contract Baseline

The mobile-relevant backend endpoints are:

- `POST /api/mobile/auth/login`
- `POST /api/mobile/auth/refresh`
- `GET /api/mobile/auth/me`
- `POST /api/mobile/auth/logout`
- `POST /api/mobile/auth/logout-all`
- `POST /api/public/funeral-home-signups`
- `GET /api/mobile/categories`
- `GET /api/mobile/suppliers?q&categoryId&region&language`
- `POST /api/mobile/quote-requests`
- `GET /api/mobile/requests`
- `GET /api/mobile/supplier-requests`
- `POST /api/mobile/quote-responses`
- `POST /api/mobile/quote-responses/:id/decision`
- `GET /api/mobile/quote-requests/:id/timeline`
- `GET /api/mobile/quote-requests/:id/pdf`

The backend also has `POST /api/mobile/marketplace-checkout`. The mobile MVP must not expose this as checkout. If it is used later, it must be presented as request basket or bulk RFQ workflow, not purchase, order, or payment.

## 12. Backend Dependencies

These dependencies must be settled before or during the mobile MVP:

- Fix backend auth tests and verify Prisma-mode login with the repository cache.
- Decide whether mobile signup calls `/api/public/funeral-home-signups` or a new `/api/mobile/...` endpoint.
- Align OpenAPI supplier search param `query` vs implementation `q`.
- Add or confirm current-user tenant profile endpoint.
- Decide quote state model: SDD terminal `RESPONDED` vs backend `ACCEPTED`/`REJECTED`.
- Validate RFQ `attributes` against category `quoteFormSchema`, or explicitly defer with tests.
- Confirm attachment upload contract for quote request/response documents.
- Decide whether `marketplace-checkout` is removed, hidden, or renamed as request basket/bulk RFQ.

## 13. Rollout Plan

1. Documentation and contract freeze.
2. Mobile app shell, theme, German i18n baseline, API config.
3. Auth/session foundation.
4. Funeral-home discovery and RFQ slice.
5. Supplier inbox and response slice.
6. Signup flow.
7. Polish pass: empty/error states, accessibility, responsive QA, Maestro smoke tests.
8. Native release readiness: icons/splash, signing, privacy manifests, app links, production env config.

## 14. Open Questions

1. Confirm the exact font packages and weights to ship through Expo: Cormorant Garamond for display plus Inter or Noto Sans for UI.
2. Should supplier catalog editing exist in mobile v1, or stay backoffice/web-only?
3. Should quote response `ACCEPTED`/`REJECTED` be user-facing in mobile v1?
4. What is the attachment strategy for PDFs/images in RFQs and responses?
5. How should sole proprietors without Handelsregister entries complete signup?
6. What minimum profile data should `/api/mobile/auth/me` return versus a dedicated tenant profile endpoint?
7. Is request basket/bulk RFQ part of MVP, or should the app only support one supplier RFQ at a time?

## 15. Assumptions Index

- The PRD uses the existing `epics.md` FR and NFR identifiers as canonical because downstream epics and stories already reference them.
- The original `docs/mobile-app-prd.md` remains the historical source PRD, while this file is the BMAD planning artifact used for readiness checks.
- Funeral-home signup uses `/api/public/funeral-home-signups` unless the backend adds a mobile-namespaced endpoint.
- Supplier catalog editing remains deferred unless backend permissions and UX are confirmed.
- Attachment upload remains a placeholder until the backend upload contract is confirmed.
- Generated OpenAPI client work is deferred until backend OpenAPI matches the implementation.
- Email remains the channel for substantive communication in MVP; the app preserves structured request, response, timeline, and dispatch records.
