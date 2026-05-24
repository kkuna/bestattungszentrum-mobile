---
stepsCompleted: [1, 2, 3, 4]
lastStep: 4
status: complete
completedAt: 2026-05-23
inputDocuments:
  - /Users/fariskunic/Documents/personal/bsc/Bestattungszentrum/docs/mobile-app-prd.md
  - /Users/fariskunic/Documents/personal/bsc/Bestattungszentrum/_bmad-output/planning-artifacts/architecture.md
  - /Users/fariskunic/Documents/personal/bsc/Bestattungszentrum/_bmad-output/planning-artifacts/ux-design-specification.md
  - /Users/fariskunic/Documents/personal/bsc/Bestattungszentrum/_bmad-output/planning-artifacts/ux-design-directions.html
---

# Bestattungszentrum - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Bestattungszentrum, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: The app must replace the boilerplate welcome route with a role-aware app shell.

FR2: The app must support unauthenticated login, funeral-home signup, forgot-password placeholder, and legal-link entry points.

FR3: The app must authenticate users through the backend mobile auth endpoints for login, refresh, current user, logout, and logout-all.

FR4: The app must store access token, refresh token, expiry, user id, role, tenant id, and language preference through a typed session storage boundary.

FR5: The app must refresh the session on 401 once, replay the original request once, and fall back to logout or account recovery state if refresh fails.

FR6: The app must validate the session at boot and route users by role, tenant, account status, and language preference.

FR7: The app must provide separate Expo Router route groups for auth, funeral-home, supplier, and shared flows.

FR8: Funeral-home users must see role-specific tabs for Home, Discover, Quotes, Profile, and Settings.

FR9: Supplier users must see role-specific tabs for Home, Requests, Catalog, Profile, and Settings.

FR10: The app must block wrong-role, suspended, pending, or unavailable routes through a clear account/status screen before business actions begin.

FR11: Funeral homes must be able to browse supplier categories and featured/recent supplier or request shortcuts from the funeral-home home screen.

FR12: Funeral homes must be able to search suppliers by text and filter by category, region, language, and certification where backend support exists.

FR13: The app must show supplier cards with logo or fallback mark, name, categories, regions, short description, verification status, language indicators, and RFQ CTA.

FR14: Funeral homes must be able to open supplier detail screens showing metadata, category badges, contact transparency, and a request CTA.

FR15: Funeral homes must be able to create a quote request using universal fields: subject, message, deadline, attachments placeholder, quantity when applicable, and supplier/category context.

FR16: The app must render category-specific RFQ fields from backend-provided `quoteFormSchema` rather than hard-coded category screens.

FR17: The RFQ flow must normalize dynamic schema fields into supported mobile controls and handle unsupported field types without crashing.

FR18: Funeral homes must be able to review a complete RFQ before sending it.

FR19: Submitting an RFQ must call the backend quote-request endpoint and show a receipt explaining the request was saved and the supplier was notified by email when dispatch status is available.

FR20: Funeral-home users must be able to view outgoing quote requests with statuses, timeline access, response summaries, and PDF links where available.

FR21: Funeral-home users must be able to read supplier responses and open related documents where backend support exists.

FR22: Suspended funeral-home users must be able to read history but must not be able to send new quote requests.

FR23: Supplier users must see a home screen with open request count and profile completeness.

FR24: Supplier users must be able to view incoming RFQs grouped or prioritized by status and deadline.

FR25: Supplier users must be able to open request detail screens with funeral-home contact, structured attributes, attachments placeholder, timeline, and response state.

FR26: Supplier users must be able to submit quote responses with price amount or range, validity date, lead time days, message, and attachments placeholder.

FR27: Supplier quote response submission must show a receipt explaining the response was saved and the funeral home was notified by email when dispatch status is available.

FR28: Supplier users must be able to see which responses were already sent and avoid duplicate or ambiguous response states.

FR29: The app must include a supplier catalog placeholder that can read current items where available while deferring item editing unless backend permissions and UX are confirmed.

FR30: Funeral-home applicants must be able to submit a public signup flow with account credentials, company/legal details, Handelsregister/VAT or sole-proprietor path, address/contact/billing email, review, and submit.

FR31: Signup must support pending approval, pending review, verification failed/correctable input, and verification unavailable/manual-review result states.

FR32: Signup validation errors must be recoverable without losing entered form progress.

FR33: The app must provide shared screens for notifications/preferences placeholder, language switching, session/security, error states, empty states, offline/retry states, legal links, and request timelines.

FR34: The app must support email deep links into relevant request or response detail after auth and role checks.

FR35: The app must keep substantive communication email-backed while preserving request, response, timeline, and dispatch records in the app.

FR36: The app must not expose in-app payments, checkout, escrow, marketplace fee collection, public consumer/family flows, real-time chat, supplier self-registration, or full mobile back-office workflows in MVP.

FR37: If the backend marketplace checkout endpoint is used later, the app must present it only as request basket or bulk RFQ workflow, never as purchase, order, or payment.

FR38: The app must define mobile DTOs for auth tokens, current user, category, supplier, supplier item, quote request, quote response, request timeline event, funeral-home signup input, create quote request input, create quote response input, and API error.

FR39: The mobile app must not import backend source directly across repositories for MVP.

FR40: The first local vertical slice must allow funeral-home users to log in, view categories, view suppliers, submit an RFQ, and see it in request history.

FR41: The corresponding supplier vertical slice must allow supplier users to log in, view an incoming RFQ, and submit a response.

### NonFunctional Requirements

NFR1: The app must be German-first and English-supported from the first implementation pass.

NFR2: No visible user-facing strings may be hard-coded in screens or reusable components; all labels, errors, statuses, accessibility labels, and legal/navigation text must come through i18n.

NFR3: German copy must be the canonical layout stress case and must be tested in buttons, tabs, cards, empty states, form labels, status badges, and small-screen layouts.

NFR4: The app must meet WCAG AA-equivalent mobile accessibility expectations where practical.

NFR5: All actionable controls must provide at least 48dp touch targets.

NFR6: Status must never rely on color alone and must include localized text and accessibility labels where relevant.

NFR7: The app must support VoiceOver/TalkBack labels, screen-reader task order, form error associations, focus/pressed/loading states, and Dynamic Type where practical.

NFR8: The mobile cold-start target is under 3 seconds on mid-range Android.

NFR9: Writes require connectivity in v1; reading should be offline-tolerant where feasible for previously loaded requests, profile/status information, and cached list/detail data.

NFR10: Token material must be accessed only through the typed session storage/service boundary.

NFR11: The app must avoid logging PII, tokens, or sensitive account data in Reactotron, errors, analytics, or debug events.

NFR12: Deep links must resolve through auth and role gates before loading protected content.

NFR13: The app must preserve tenant boundaries and fail closed on wrong-role navigation.

NFR14: Date, number, currency, plural, enum, and status display must use locale-aware formatters and mapping helpers.

NFR15: API modules must return normalized app results rather than leaking apisauce internals into screens.

NFR16: Backend contract drift must be isolated behind typed API modules, DTOs, mappers, and fixture-based tests.

NFR17: The app must keep Ignite components, Expo Router, theme provider, i18n, apisauce, MMKV, Reactotron, Jest/RNTL, Maestro, and dependency-cruiser first-class.

NFR18: `pnpm compile`, `pnpm lint:check`, `pnpm test`, and `pnpm depcruise` must remain the main quality gates, with lint debt documented if accepted.

NFR19: Maestro smoke flows must cover login as funeral home, login as supplier, and at least one RFQ happy path once simulator/dev-client flows are ready.

NFR20: The UI must avoid checkout, cart, order, purchase, payment, chat, celebratory, playful, or consumer-shopping language and patterns.

NFR21: Layouts must work on compact phones, standard phones, large phones, and tablets where supported without text overlap or bottom-navigation/keyboard collisions.

NFR22: Animations and transitions must be subtle and respect reduced motion settings.

NFR23: Production release must use local/native build artifacts uploaded manually by the owner; implementation must not assume EAS-managed submission.

NFR24: The app must support iOS simulator, Android emulator, physical iPhone, and physical Android development/testing paths.

NFR25: The app must support local API URL configuration for iOS simulator, Android emulator, physical Android via `pnpm adb`, physical iOS through LAN-accessible backend URL, and production API URLs.

### Additional Requirements

- Keep the existing Ignite 11.5 / Expo SDK 55 repository foundation; do not scaffold or replace the app.
- First implementation work must audit and align the starter: remove boilerplate welcome behavior, add route groups, update theme/i18n defaults, replace sample API code, and establish session/API boundaries.
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
- Each status display object should include raw value, normalized app status, localization label key, semantic tone, and accessibility label key where needed.
- Add domain components from the UX/architecture documents: App Search Header, Category Tile, Supplier Card, RFQ Card, Status Badge, Guided Form Stepper, Dynamic Schema Field, Review Summary Block, Submission Receipt, Account Status Panel, and Timeline Item.
- Components must accept localized display strings or known enum values mapped through localization helpers.
- Do not introduce a second design system or third-party UI kit before Ignite primitives prove insufficient.
- Replace Ignite's current Space Grotesk default during theme work rather than mixing all intended font families.
- Use Cormorant Garamond only for brand/display moments and Inter or Noto Sans for dense product UI after app-build glyph coverage is verified.
- Support semantic color tokens for primary, pressed, accent, background, surface, surface warm, ink, text, muted text, border, success, warning, danger, info, and neutral tones.
- Brand red must be used for primary actions, selected/active states, and brand moments, not as the generic error/warning/success color.
- Runtime app config must live under `src/config`; backend URLs must not be hard-coded in feature code.
- Physical-device API URL support must be explicit because physical devices cannot rely on simulator-only localhost addresses.
- Maintain `src/utils/crashReporting` as an abstraction and defer concrete third-party error tracking until GDPR/DPA and release-readiness review.
- Reactotron must remain development-only and must not log tokens or PII.
- Native iOS/Android folders are valid project boundaries for local builds, simulator/device testing, signing, app links, privacy manifests, icons, splash, and manual release artifacts.
- Implementation agents must not edit native project files unless a story explicitly requires native configuration.
- Backend dependencies to settle during MVP include auth test/cache instability, signup endpoint namespace, supplier search `q` vs `query`, current-user tenant profile shape, quote state naming, RFQ attribute validation, attachment upload contract, and marketplace-checkout disposition.

### UX Design Requirements

UX-DR1: Implement the primary mobile shell using the Quiet OTTO Native direction: light gray canvas, prominent rounded top search, white modules, modular category grid, horizontal content rhythm, red active tab state, and stable bottom navigation.

UX-DR2: Remove retail energy from the shell by replacing shopping modules with supplier categories, RFQ status cards, verified supplier tiles, request shortcuts, and professional workflow content.

UX-DR3: Implement Guided Anfrage patterns for signup, RFQ creation, and quote response forms with multi-step progression, visible progress, preserved form state, review-before-submit, and confirmation receipts.

UX-DR4: Implement Quiet Ledger patterns for request history, supplier inbox, timelines, account/security screens, status rows, timestamps, and compact repeated work items.

UX-DR5: Implement Warm Institutional patterns for splash, onboarding, signup status, pending approval, pending review, verification failed, suspended account, and dignified brand/status moments.

UX-DR6: Archive earlier explorations as non-reference directions; do not implement Operational Red, Supplier Command, Blue Dispatch Accent, or Restrained OTTO Framework directly.

UX-DR7: Use `#B8312F` as canonical brand red, `#8E2422` as pressed/deep red, `#C8102E` as accent, warm off-white backgrounds, white surfaces, warm borders, near-black text, and separate semantic success/warning/danger/info colors.

UX-DR8: Use red for primary actions, active navigation, selected filters, and key brand moments; do not use red as a constant alert/background color.

UX-DR9: Use Cormorant Garamond for splash, selected onboarding headings, selected empty states, and occasional major screen titles only.

UX-DR10: Use Inter or Noto Sans for product UI, dense lists, form labels, buttons, tabs, helper text, badges, validation copy, and long German text.

UX-DR11: Replace the existing Space Grotesk default rather than mixing Space Grotesk with the new display/UI font pairing.

UX-DR12: Use an 8px spacing rhythm with 4px fine adjustments, 16px default horizontal padding, 20-24px section spacing, and 8-12px dense row/card spacing.

UX-DR13: Use stable dimensions for chips, tabs, icon buttons, badges, form controls, and action buttons to prevent layout shifts.

UX-DR14: Avoid nested cards and prefer cards only for repeated items, focused modules, modals, and genuinely framed tools.

UX-DR15: Build an App Search Header with back affordance when needed, rounded search pill, optional status/notification affordance, default/focused/loading/disabled/no-query states, localized search label, and clear button label.

UX-DR16: Build Category Tile components for category discovery and RFQ category selection with localized label, optional icon/initial/visual, default/selected/disabled/loading states, and German/English category content.

UX-DR17: Build Supplier Card components with supplier mark/logo, name, location/regions, category badges, verification badge, language indicators, active/deactivated/unavailable/loading/fallback-image states, detail navigation, and RFQ CTA.

UX-DR18: Build RFQ Card components for outgoing and incoming requests with subject, counterpart name, category, status badge, deadline/timestamp, response/email metadata, compact/detailed variants, and sent/responded/expired/cancelled/pending-email/email-failed states.

UX-DR19: Build Status Badge components for account, RFQ, quote response, verification, and email-dispatch states with localized text, semantic tone, and accessibility support independent of color.

UX-DR20: Build Guided Form Stepper components with step indicator, step title, helper text, content area, back/next actions, save/progress state, and current/complete/invalid/blocked/submitting states.

UX-DR21: Build Dynamic Schema Field components supporting text, number, date, select, multi-select, boolean, segmented option, attachment placeholder, invalid/disabled/focused states, and graceful unsupported-field fallback.

UX-DR22: Build Review Summary Block components with grouped label/value rows, recipient, language/status metadata, edit links, and reuse in signup review, RFQ review, and quote-response review.

UX-DR23: Build Submission Receipt components with status label, timestamp, reference id, email-dispatch explanation, next actions, and a receipt tone rather than celebration.

UX-DR24: Build Account Status Panel components for pending approval, pending review, suspended, verification failed, and provider unavailable states with explanation, restrictions, next step, and optional contact action.

UX-DR25: Build Timeline Item components with event label, timestamp, actor/system source, optional details, and completed/pending/failed/informational states.

UX-DR26: Use one primary button per decision area, reserve primary styling for send RFQ, submit response, complete signup, and save account changes, and provide secondary, ghost, and destructive treatments as appropriate.

UX-DR27: Button labels must support loading, disabled, pressed, and error recovery states without height changes and must be tested against long German strings.

UX-DR28: Form validation must appear inline near the relevant field, remain visible until resolved, validate at step transitions and submit, and preserve entered data across failures.

UX-DR29: Business-action completions must show what happened, when it happened, what was saved, whether email was sent or uncertain, and the next expected step.

UX-DR30: Error states must be calm, specific, recoverable, and include retry where retry is meaningful.

UX-DR31: Search and filtering must use a large rounded search field, visible reversible filters, selected-filter states, individual/group clear affordances, and empty states that suggest clear filters, browse categories, or adjust criteria.

UX-DR32: Loading states for supplier lists, RFQ cards, and inbox rows must use skeletons or stable placeholders rather than only full-screen spinners.

UX-DR33: Empty states must cover no suppliers, no matching suppliers, no requests yet, no inbox items, no responses, and unavailable states with practical next actions.

UX-DR34: Modal/bottom-sheet use must be limited to focused decisions such as filters, language selection, discard changes, cancel, leave unsent response, or status detail explanation.

UX-DR35: Compact phone layouts from 320-374px must be the stress case for German labels, bottom tabs, forms, buttons, and status badges.

UX-DR36: Tablet layouts may use extra width for wider cards, two-column category grids, improved review layouts, and supporting metadata but must keep the same touch-first navigation model.

UX-DR37: Primary actions must remain reachable without overlapping bottom navigation, keyboard, or safe areas.

UX-DR38: Forms must support keyboard avoidance, scroll-to-error behavior, and review-before-submit interaction.

UX-DR39: Accessibility testing must include color contrast, touch targets, status comprehension without color, form validation with screen readers, VoiceOver, TalkBack, large text, and reduced motion.

UX-DR40: The HTML direction file must be treated as an implementation reference for visual rhythm, component anatomy, and pattern hierarchy, with the Markdown UX spec as the authoritative specification.

### FR Coverage Map

FR1: Epic 1 - Replace boilerplate with role-aware app shell.
FR2: Epic 1 - Provide unauthenticated login, signup, forgot-password placeholder, and legal entry points.
FR3: Epic 1 - Implement backend mobile auth endpoint integration.
FR4: Epic 1 - Store session, role, tenant, and language data through typed storage.
FR5: Epic 1 - Refresh on 401 and fall back safely on refresh failure.
FR6: Epic 1 - Validate session at boot and route by role/account/language.
FR7: Epic 1 - Establish auth, funeral-home, supplier, and shared route groups.
FR8: Epic 1 - Provide funeral-home role tabs.
FR9: Epic 1 - Provide supplier role tabs.
FR10: Epic 1 - Block wrong-role and restricted accounts through account/status screens.
FR11: Epic 2 - Provide funeral-home category browsing and request shortcuts.
FR12: Epic 2 - Provide supplier search and filters.
FR13: Epic 2 - Render supplier cards with verification, metadata, and RFQ CTA.
FR14: Epic 2 - Provide supplier detail with metadata and request CTA.
FR15: Epic 2 - Capture universal quote request fields.
FR16: Epic 2 - Render category-specific RFQ fields from `quoteFormSchema`.
FR17: Epic 2 - Normalize dynamic schema fields and handle unsupported fields.
FR18: Epic 2 - Provide RFQ review before send.
FR19: Epic 2 - Submit RFQ and show saved/email-dispatch receipt.
FR20: Epic 2 - Show outgoing request history, status, timelines, responses, and PDFs where available.
FR21: Epic 2 - Show supplier responses and related documents where available.
FR22: Epic 2 - Allow suspended funeral-home users to read history while blocking new RFQs.
FR23: Epic 3 - Provide supplier home with open request count and profile completeness.
FR24: Epic 3 - Provide incoming RFQ list grouped/prioritized by status and deadline.
FR25: Epic 3 - Provide supplier request detail with structured attributes, contact, attachments placeholder, timeline, and response state.
FR26: Epic 3 - Capture supplier quote response fields.
FR27: Epic 3 - Submit quote response and show saved/email-dispatch receipt.
FR28: Epic 3 - Show sent responses and prevent duplicate/ambiguous response states.
FR29: Epic 3 - Provide read-only supplier catalog placeholder where backend data exists.
FR30: Epic 4 - Provide public funeral-home signup form.
FR31: Epic 4 - Support signup result states for approval, review, failed verification, and manual review.
FR32: Epic 4 - Preserve signup form progress across validation errors.
FR33: Epic 1 - Provide shared settings, language, session/security, legal, empty/error/offline, and timeline shell screens.
FR34: Epic 2 / Epic 3 - Support email deep links into protected request/response detail after auth and role checks.
FR35: Epic 2 / Epic 3 - Preserve email-backed request, response, timeline, and dispatch records.
FR36: Epic 1 - Exclude payments, checkout, escrow, consumer flows, chat, supplier self-registration, and mobile back-office workflows.
FR37: Epic 2 - Treat any future marketplace-checkout usage only as request basket or bulk RFQ, not purchase/order/payment.
FR38: Epic 1 - Define core mobile DTOs and API error types.
FR39: Epic 1 - Prevent direct backend source imports across repos for MVP.
FR40: Epic 2 - Deliver the first funeral-home vertical slice.
FR41: Epic 3 - Deliver the supplier vertical slice.

## Epic List

### Epic 1: Trusted Role-Aware App Entry
Users can open the app, authenticate, land in the correct role workspace, understand account restrictions, switch language/settings, and avoid wrong-role or forbidden flows.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR33, FR36, FR38, FR39

### Epic 2: Funeral-Home Supplier Discovery and RFQ Flow
Funeral-home users can find verified suppliers, inspect supplier details, create a structured dynamic RFQ, review it, send it, and see the request recorded.
**FRs covered:** FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR34, FR35, FR37, FR40

### Epic 3: Supplier Request Inbox and Quote Response Flow
Supplier users can review incoming RFQs, inspect structured request details, respond with quote details, avoid duplicate responses, and see their supplier workspace status.
**FRs covered:** FR23, FR24, FR25, FR26, FR27, FR28, FR29, FR34, FR35, FR41

### Epic 4: Funeral-Home Signup and Verification
Funeral-home applicants can submit a German-first company signup, recover from validation errors, and understand approval, review, failed-verification, or manual-review outcomes.
**FRs covered:** FR30, FR31, FR32

Implementation sequencing note: Epic 1 must establish the app shell, session, role gate, API result boundary, and shared status patterns before Epic 2 or Epic 3 implementation begins. Epic 2 and Epic 3 prove the first RFQ marketplace loop with seeded or already-approved users. Epic 4 is required before public funeral-home acquisition and can move earlier if public self-registration becomes mandatory for the first releasable slice.

## Epic 1: Trusted Role-Aware App Entry

Users can open the app, authenticate, land in the correct role workspace, understand account restrictions, switch language/settings, and avoid wrong-role or forbidden flows.

### Story 1.1: Starter Alignment and Route Group Shell

As a mobile user,
I want the app to open into a Bestattungszentrum-specific route shell,
So that I no longer see boilerplate screens and the app has clear role-aware navigation paths.

**Acceptance Criteria:**

**Given** the existing Ignite/Expo app is installed
**When** the app starts without an authenticated session
**Then** the boilerplate welcome route is no longer shown
**And** the user is routed to the unauthenticated entry experience.

**Given** the unauthenticated entry experience renders
**When** login, funeral-home signup, forgot-password, and legal-link entry points are reviewed
**Then** a localized forgot-password placeholder is present
**And** it is clearly marked as unavailable or pending implementation if password recovery is not yet supported by the backend.

**Given** the app source is inspected
**When** the route structure is reviewed
**Then** Expo Router groups exist for `(auth)`, `(funeral-home)`, `(supplier)`, and `(shared)`
**And** route files remain thin wrappers around feature screens or placeholders.

**Given** a developer opens each route group
**When** unauthenticated, funeral-home, supplier, and shared placeholder routes render
**Then** each route uses existing Ignite primitives and project theme/i18n hooks where available
**And** no business logic is embedded directly in route files.

**Given** the mobile MVP excludes ecommerce and chat
**When** shell labels, placeholders, and navigation affordances are reviewed
**Then** no checkout, cart, order, purchase, payment, escrow, consumer-family, real-time chat, supplier self-registration, or admin back-office language is present.

**Given** quality checks are run
**When** `pnpm compile` and the relevant route/shell tests run
**Then** they pass or any existing unrelated debt is documented separately.

### Story 1.2: German-First Theme and i18n Baseline

As a mobile user,
I want the app interface to use Bestattungszentrum branding and German-first localized copy,
So that the product feels trustworthy, readable, and ready for German funeral-home and supplier workflows.

**Acceptance Criteria:**

**Given** the app theme is loaded
**When** core shell, auth, placeholder, and shared screens render
**Then** they use Bestattungszentrum color tokens including brand red, pressed red, accent red, warm background, surface, border, text, muted text, success, warning, danger, info, and neutral tones
**And** brand red is used for primary actions, active navigation, selected states, and brand moments rather than generic error/warning/success states.

**Given** the existing Ignite typography defaults are reviewed
**When** theme typography is configured
**Then** Space Grotesk is no longer the default product UI font
**And** the theme is prepared for Cormorant Garamond display moments plus Inter or Noto Sans product UI text, subject to app-build glyph verification.

**Given** visible UI copy appears in route shells, placeholders, tabs, settings, account state placeholders, and legal-link placeholders
**When** the source is inspected
**Then** no visible string is hard-coded in screens or reusable components
**And** all visible labels, status text, helper text, errors, accessibility labels, and navigation labels resolve through i18n keys.

**Given** the app starts for a first-time user
**When** no saved language preference exists
**Then** German is selected as the default locale
**And** English remains available as the secondary locale.

**Given** German and English translations exist
**When** key shell labels and placeholders are rendered in both languages
**Then** the meaning and operational tone are consistent
**And** the German strings are used as the layout stress case for buttons, tabs, cards, and empty states.

**Given** accessibility and visual checks are performed
**When** shell components use red-on-white, white-on-red, muted text, and status colors
**Then** contrast-sensitive pairings are explicitly verified or documented as needing correction before release.

### Story 1.3: Typed API DTOs and Normalized API Result Boundary

As a mobile developer,
I want a typed mobile API boundary with normalized result shapes,
So that authentication and future feature screens can consume backend responses safely without leaking apisauce or backend implementation details.

**Acceptance Criteria:**

**Given** the mobile API service layer is inspected
**When** core API types are reviewed
**Then** DTOs exist for mobile auth tokens, current user, category, supplier, supplier item, quote request, quote response, request timeline event, funeral-home signup input, create quote request input, create quote response input, and API error
**And** DTOs are defined in the mobile repo without importing backend source across repositories.

**Given** API modules return responses to features or hooks
**When** a success response is mapped
**Then** it returns a normalized success shape such as `{ ok: true, data }`
**And** screens do not need to inspect raw apisauce response objects.

**Given** API modules encounter backend, network, timeout, validation, auth, or unknown failures
**When** the failure is mapped
**Then** it returns a normalized failure shape with problem, optional status, localized message key, and optional details
**And** no final German or English error copy is hard-coded in the API layer.

**Given** backend status and enum values are received
**When** they are exposed to UI consumers
**Then** raw backend values remain at the API boundary until explicit domain/status mappers convert them
**And** status display concerns are kept out of route files and basic API functions.

**Given** API fixture tests are run
**When** representative success and failure fixtures are mapped
**Then** the normalized result shape, DTO mapping, and problem mapping are covered by focused tests.

**Given** future API modules are added
**When** their implementation is reviewed
**Then** they follow the same normalized result pattern
**And** endpoint paths, backend parameter naming, DTOs, response mapping, and problem mapping stay owned by API modules.

### Story 1.4: Session Storage and Auth API Integration

As a returning user,
I want the app to securely remember my authenticated session,
So that I can resume the correct workspace without repeatedly signing in.

**Acceptance Criteria:**

**Given** the session service layer is inspected
**When** token and user session persistence is reviewed
**Then** access token, refresh token, expiry, user id, role, tenant id, and language preference are read and written only through a typed session storage boundary
**And** screens, route files, and feature components do not access MMKV token data directly.

**Given** a user submits valid login credentials
**When** the mobile login endpoint succeeds
**Then** the app stores the returned session data through the session storage boundary
**And** the app exposes a derived authenticated session state without exposing raw tokens to UI components.

**Given** the backend uses opaque access tokens
**When** session data is processed
**Then** the app does not decode JWT claims
**And** role, tenant, expiry, and user information come only from trusted backend response fields or current-user calls.

**Given** a user requests logout
**When** logout succeeds or the backend is unreachable
**Then** local session token material is cleared safely
**And** the user returns to the unauthenticated entry state.

**Given** a user requests logout-all
**When** the mobile logout-all endpoint succeeds
**Then** local session token material is cleared
**And** the UI communicates the signed-out state through localized copy.

**Given** development tooling is active
**When** login, session persistence, logout, or logout-all events are inspected in Reactotron/logs
**Then** tokens and PII are not logged
**And** only safe diagnostic metadata is emitted.

**Given** focused session tests run
**When** session save, load, clear, login success, logout, and logout-all paths are exercised
**Then** typed storage behavior and auth API integration are verified.

### Story 1.5: Session Boot, Refresh, and Logout Handling

As an authenticated user,
I want the app to validate and recover my session automatically,
So that temporary token expiry does not interrupt my work and failed sessions return me to a clear signed-out state.

**Acceptance Criteria:**

**Given** stored session data exists when the app starts
**When** boot hydration runs
**Then** the app shows an explicit boot/refresh state instead of briefly rendering the wrong role workspace
**And** the session is validated before protected routes are shown.

**Given** stored session data is missing, expired beyond recovery, or malformed
**When** boot hydration completes
**Then** token material is cleared
**And** the user is routed to the unauthenticated entry state with localized copy where visible.

**Given** an authenticated API request receives a 401 response
**When** a refresh token is available
**Then** the API layer attempts exactly one refresh
**And** if refresh succeeds, it stores rotated token data atomically where practical and replays the original request once.

**Given** an authenticated API request receives a 401 response
**When** refresh fails or the replay also fails
**Then** the app clears local session token material
**And** routes the user to a safe signed-out or account-recovery state without retry loops.

**Given** multiple authenticated requests encounter 401 near the same time
**When** refresh handling runs
**Then** the app avoids multiple competing refresh writes where practical
**And** all waiting requests resolve using the final refreshed or signed-out state.

**Given** the app is offline or the backend is unavailable during boot or refresh
**When** session validation cannot complete
**Then** the user sees a localized recoverable offline/retry state where appropriate
**And** token and PII details are not exposed.

**Given** focused tests run
**When** boot hydration, refresh success, refresh failure, replay success, replay failure, malformed storage, and concurrent 401 cases are exercised
**Then** session state transitions and storage mutations are verified.

### Story 1.6: Role Gate and Account Status Handling

As a signed-in user,
I want the app to route me according to my role and account status,
So that I only see workflows I am allowed to use and blocked states are explained clearly.

**Acceptance Criteria:**

**Given** a valid current-user response identifies an active funeral-home user
**When** session validation completes
**Then** the user lands in the funeral-home workspace
**And** protected supplier routes remain inaccessible.

**Given** a valid current-user response identifies an active supplier user
**When** session validation completes
**Then** the user lands in the supplier workspace
**And** protected funeral-home routes remain inaccessible.

**Given** the account status is pending approval, pending review, suspended, verification failed, or provider unavailable
**When** the user attempts to open a restricted business route
**Then** the app shows an Account Status Panel with localized status, explanation, restrictions, next step, and optional contact action
**And** the user is blocked before filling a business form.

**Given** a wrong-role or unavailable route is opened directly
**When** the role gate evaluates access
**Then** the route fails closed into a shared account/status or safe fallback screen
**And** no protected data from the wrong tenant or role is rendered.

**Given** account and route status values are rendered
**When** badges, panel labels, and accessibility labels are displayed
**Then** centralized status mapping provides the localized label key, semantic tone, and accessibility label
**And** status meaning does not rely on color alone.

**Given** route-gate tests run
**When** active, pending, suspended, failed, wrong-role, and unknown-status cases are exercised
**Then** the expected destination, status panel, and access decision are verified.

### Story 1.7: Role-Specific Tabs and Shared Settings Placeholders

As a signed-in user,
I want role-specific navigation plus shared account and legal screens,
So that I can move through the correct workspace and manage basic app preferences.

**Acceptance Criteria:**

**Given** an active funeral-home user is signed in
**When** the app renders the main workspace
**Then** the bottom tabs show localized Home, Discover, Quotes, Profile, and Settings labels
**And** active navigation uses the brand red active state without relying on color alone.

**Given** an active supplier user is signed in
**When** the app renders the main workspace
**Then** the bottom tabs show localized Home, Requests, Catalog, Profile, and Settings labels
**And** funeral-home discovery or RFQ actions are not exposed in supplier navigation.

**Given** shared settings screens are opened
**When** language, session/security, notifications/preferences placeholder, legal links, error, empty, and offline/retry placeholders render
**Then** each screen uses localized copy, Ignite primitives, safe-area-aware layout, and 48dp touch targets.

**Given** the language switcher is used
**When** the user selects German or English
**Then** the language preference is persisted through the preferences/session boundary
**And** navigation labels and placeholder copy update consistently.

**Given** compact phone layouts are tested
**When** German tab labels, buttons, and placeholders render
**Then** text wraps or truncates intentionally without overlap, clipped controls, or bottom navigation collisions.

**Given** navigation and settings tests run
**When** role tabs, shared placeholders, language selection, and legal links are exercised
**Then** role-specific navigation and shared-screen behavior are verified.

## Epic 2: Funeral-Home Supplier Discovery and RFQ Flow

Funeral-home users can find verified suppliers, inspect supplier details, create a structured dynamic RFQ, review it, send it, and see the request recorded.

### Story 2.1: Funeral-Home Home and Category Discovery Baseline

As a funeral-home user,
I want a role-specific home screen with supplier categories and request shortcuts,
So that I can start supplier discovery or return to recent request work quickly.

**Acceptance Criteria:**

**Given** an active funeral-home user opens the app
**When** the funeral-home home screen renders
**Then** it shows localized category entry points, recent requests or empty-state shortcuts, and clear next actions
**And** it follows the Quiet OTTO Native shell rhythm with a light canvas, white modules, stable bottom navigation, and restrained brand red.

**Given** categories are available from the backend
**When** the home screen loads
**Then** category tiles show localized names, loading states, empty states, and retry behavior
**And** category selection routes the user toward supplier discovery or RFQ start without exposing raw backend schema terms.

**Given** the backend is unavailable or no categories exist
**When** category loading fails or returns empty
**Then** the user sees a localized practical empty/error state with retry where meaningful
**And** no full-screen spinner remains after the request settles.

**Given** compact German layouts are tested
**When** category names, request shortcuts, and primary actions render
**Then** text remains readable without overlap or bottom navigation collisions.

**Given** component tests run
**When** category loading, empty, error, and selection states are exercised
**Then** the home screen behavior and i18n labels are verified.

### Story 2.2: Supplier Search, Filters, and Supplier Cards

As a funeral-home user,
I want to search and filter verified suppliers,
So that I can find relevant suppliers by category, region, language, certification, and text.

**Acceptance Criteria:**

**Given** the Discover screen is opened
**When** supplier discovery renders
**Then** it provides a localized App Search Header, reversible filters, selected-filter states, and individual or grouped clear affordances
**And** the UI avoids ecommerce shopping or product-purchase language.

**Given** the user enters search text or filters
**When** suppliers are requested from the backend
**Then** the API module maps mobile query inputs to the backend implementation parameter names
**And** supplier search contract mismatches such as `q` versus `query` are isolated inside the API module.

**Given** supplier results are returned
**When** the list renders
**Then** Supplier Cards show logo or fallback mark, name, categories, regions, short description, verification status, language indicators, and RFQ CTA
**And** status badges include localized labels and accessibility text.

**Given** supplier search API fixtures exist
**When** success, empty, validation failure, unauthorized, and network failure fixtures are mapped
**Then** `suppliersApi` owns request parameter mapping, response DTO mapping, problem mapping, and localized message keys.

**Given** no suppliers match the current search
**When** the empty state renders
**Then** it suggests clearing filters, browsing categories, or adjusting region/category criteria
**And** the empty copy is calm and operational.

**Given** loading and error states occur
**When** supplier results are pending or fail
**Then** stable skeletons/placeholders or recoverable error states are shown instead of layout-shifting spinners.

**Given** tests run
**When** search, filter selection, filter clearing, loading, empty, error, and supplier-card states are exercised
**Then** the user-visible behavior and API query mapping are verified.

### Story 2.3: Supplier Detail and RFQ Entry Points

As a funeral-home user,
I want to inspect a supplier before requesting a quote,
So that I can verify category fit, region coverage, contact transparency, and trust signals.

**Acceptance Criteria:**

**Given** a supplier card is selected
**When** the supplier detail screen opens
**Then** it shows supplier metadata, category badges, regions, languages, verification state, description, contact transparency, and request CTA
**And** unavailable or deactivated supplier states are clearly labeled.

**Given** supplier detail API fixtures exist
**When** success, not-found, unavailable, unauthorized, and network failure fixtures are mapped
**Then** supplier detail screens receive normalized domain data or normalized failures without inspecting raw apisauce responses.

**Given** a supplier is active and requestable
**When** the user taps the RFQ CTA
**Then** the app starts the RFQ flow with supplier and category context preserved
**And** the CTA uses request language such as `Angebot anfragen` or localized equivalent, not checkout/order language.

**Given** a supplier is deactivated, unavailable, or the user is suspended
**When** the detail screen renders
**Then** RFQ creation is blocked before form entry
**And** the user sees a localized explanation with a safe next action.

**Given** supplier detail data fails to load
**When** the request fails
**Then** the screen shows a recoverable localized error state with retry
**And** no stale supplier details are shown as current.

**Given** detail-screen tests run
**When** active, unavailable, suspended, loading, error, and RFQ entry states are exercised
**Then** supplier detail behavior and navigation are verified.

### Story 2.4: Dynamic RFQ Form Renderer

As a funeral-home user,
I want category-specific RFQ fields to appear as familiar mobile form controls,
So that I can submit complete structured requests without understanding backend schemas.

Out of scope: no checkout, payment, order placement, chat, supplier self-registration, or hosted conversation thread behavior.

**Acceptance Criteria:**

**Given** a user starts an RFQ from a supplier or category
**When** the RFQ form opens
**Then** it captures universal fields including subject, message, deadline, attachments placeholder, quantity where applicable, supplier context, and category context.

**Given** a category provides `quoteFormSchema`
**When** the schema is loaded
**Then** supported fields are normalized into mobile controls for text, number, date, select, multi-select, boolean, segmented option, and attachment placeholder
**And** raw schema concepts are not shown directly to users.

**Given** category and schema API fixtures exist
**When** valid, empty, unsupported-field, malformed, unauthorized, and network failure fixtures are mapped
**Then** the form renderer consumes normalized field descriptors and localized error keys rather than backend-specific schema details.

**Given** the schema contains an unsupported field type
**When** the form renderer encounters it
**Then** the app shows a controlled localized unsupported-field message
**And** the form does not crash.

**Given** required fields are incomplete or invalid
**When** the user advances steps or submits
**Then** validation appears inline near the field and remains visible until fixed
**And** entered data is preserved across validation failures.

**Given** the keyboard is open or the user jumps to an error
**When** form interactions occur
**Then** primary actions remain reachable without overlapping the keyboard, safe areas, or bottom navigation
**And** scroll-to-error behavior focuses the relevant field where practical.

**Given** tests run
**When** universal fields, supported schema controls, unsupported fields, validation errors, and preserved form state are exercised
**Then** RFQ renderer behavior is verified.

### Story 2.5: RFQ Review and Send Receipt

As a funeral-home user,
I want to review my quote request before sending it,
So that I can confirm the recipient, details, and next step before the supplier is notified.

Out of scope: no checkout, payment, order placement, chat, supplier self-registration, or hosted conversation thread behavior.

**Acceptance Criteria:**

**Given** the user completes RFQ form steps
**When** the review screen renders
**Then** it shows a Review Summary Block with supplier, category, universal fields, category-specific details, deadline, attachments placeholder, language/status metadata, and edit links.

**Given** the user chooses to edit a section
**When** they return from editing
**Then** the review screen reflects updated values
**And** previously entered valid data remains intact.

**Given** the user submits the RFQ
**When** the backend quote-request endpoint succeeds
**Then** the app shows a Submission Receipt with reference id when available, timestamp, saved state, email-dispatch explanation, and next actions.

**Given** quote-request API fixtures exist
**When** success, validation failure, unauthorized, forbidden/suspended, expired category/supplier, dispatch warning, and network failure fixtures are mapped
**Then** `quoteRequestsApi` owns request payload mapping, response DTO mapping, problem mapping, and localized message keys.

**Given** email dispatch status is queued, sent, failed, or unavailable
**When** the receipt renders
**Then** the dispatch state is communicated with localized text and semantic status
**And** the app does not imply chat or in-app conversation hosting.

**Given** RFQ submission fails due to validation, network, auth, or backend error
**When** the failure is mapped
**Then** the user receives recoverable localized feedback
**And** completed form data remains available for correction or retry.

**Given** tests run
**When** review, edit, submit success, email-dispatch variants, and submit failures are exercised
**Then** the RFQ send flow and receipt behavior are verified.

### Story 2.6: Outgoing Request History, Detail, and Timeline

As a funeral-home user,
I want to view my sent quote requests and their history,
So that I can track status, supplier responses, timeline events, and documents.

**Acceptance Criteria:**

**Given** a funeral-home user opens Quotes
**When** outgoing requests load
**Then** RFQ Cards show subject, supplier, category, status badge, deadline or timestamp, response metadata, and email-dispatch metadata where available.

**Given** the user has no requests
**When** the request list renders
**Then** a localized empty state explains that no requests exist yet
**And** offers a practical path back to discovery.

**Given** a request is selected
**When** the request detail opens
**Then** it shows request details, timeline access, response summary, email-dispatch traces, and PDF/document links where backend support exists.

**Given** an email deep link targets an outgoing request or supplier response detail
**When** the link opens from unauthenticated, authenticated correct-role, authenticated wrong-role, pending/suspended, missing-target, unavailable-target, and backend/network failure states
**Then** the app resolves the link through auth, role, account-status, and tenant gates before rendering protected detail
**And** it routes to the correct detail, account-status panel, sign-in flow, not-found state, or recoverable error state without exposing protected data.

**Given** timeline events are available
**When** the timeline renders
**Then** Timeline Items show localized event labels, timestamps, actor/system source, optional details, and completed/pending/failed/informational states.

**Given** PDF or related document links are unavailable
**When** the detail screen renders
**Then** the app shows a graceful placeholder or hides the unavailable action
**And** it does not present broken links.

**Given** tests run
**When** outgoing list, empty state, detail, timeline, response summary, PDF availability, and error states are exercised
**Then** request-history behavior is verified.

### Story 2.7: Suspended Funeral-Home Read-Only Mode

As a suspended funeral-home user,
I want to read my existing request history without sending new RFQs,
So that I can access records while understanding current account restrictions.

**Acceptance Criteria:**

**Given** a suspended funeral-home user signs in
**When** they open home, discovery, supplier detail, or quotes
**Then** read-only request history remains available where allowed
**And** new RFQ creation entry points are disabled or replaced with account-status guidance before form entry.

**Given** the user attempts to deep link into RFQ creation
**When** the role/account gate evaluates access
**Then** the app blocks the route and shows an Account Status Panel
**And** no partially created RFQ state is stored.

**Given** the suspended account status is displayed
**When** status copy renders
**Then** it is precise, non-judgmental, localized, and clear about restrictions and next steps.

**Given** tests run
**When** suspended user access to history, supplier detail, RFQ CTA, direct RFQ routes, and account panels is exercised
**Then** read-only and blocked-action behavior is verified.

### Story 2.8: Funeral-Home Vertical Slice Smoke Flow

As a product team member,
I want a smoke-tested funeral-home RFQ path,
So that the first mobile vertical slice can be verified end to end on a dev build.

**Acceptance Criteria:**

**Given** a dev backend and seeded funeral-home credentials are available
**When** the smoke flow runs
**Then** it signs in, opens category/discovery, views suppliers, starts an RFQ, completes required fields, reviews, submits, and sees the request in history.

**Given** the smoke flow is configured
**When** it runs on supported simulator/dev-client paths
**Then** it uses stable localized test selectors or accessibility labels
**And** it does not depend on fragile visual text matching where avoidable.

**Given** backend contract gaps remain
**When** a path cannot be automated yet
**Then** the flow includes a documented placeholder or manual verification note
**And** the blocker is tied to the relevant backend dependency.

**Given** quality gates run
**When** `pnpm compile`, focused tests, and the available smoke flow are executed
**Then** the funeral-home vertical slice is verified or unresolved external blockers are documented.

## Epic 3: Supplier Request Inbox and Quote Response Flow

Supplier users can review incoming RFQs, inspect structured request details, respond with quote details, avoid duplicate responses, and see their supplier workspace status.

### Story 3.1: Supplier Home and Inbox Overview

As a supplier user,
I want a supplier-specific home and request inbox overview,
So that I can see open request work and understand my supplier workspace status quickly.

**Acceptance Criteria:**

**Given** an active supplier user opens the app
**When** the supplier home renders
**Then** it shows open request count, profile completeness placeholder, and clear navigation to incoming requests
**And** it uses the same localized, calm operational shell as the rest of the app.

**Given** incoming requests are available
**When** the supplier request list renders
**Then** RFQ Cards show subject, funeral-home name, category, status badge, deadline/timestamp, and response/email metadata where available.

**Given** requests have different status or deadline urgency
**When** the inbox renders
**Then** requests are grouped or prioritized by status and deadline in a way that makes open work clear.

**Given** the supplier has no incoming requests
**When** the inbox empty state renders
**Then** it explains the state with practical localized copy
**And** it avoids promotional or playful messaging.

**Given** tests run
**When** supplier home, inbox loading, grouped list, empty state, and error state are exercised
**Then** the supplier overview behavior is verified.

### Story 3.2: Supplier Request Detail and Timeline

As a supplier user,
I want to inspect the full structured request before responding,
So that I can understand the funeral home's need and avoid incomplete replies.

**Acceptance Criteria:**

**Given** an incoming RFQ is selected
**When** the request detail screen opens
**Then** it shows funeral-home contact information permitted by the backend, subject, message, category, structured attributes, deadline, attachments placeholder, timeline, and current response state.

**Given** an email deep link targets an incoming request or quote response detail
**When** the link opens from unauthenticated, authenticated correct-role, authenticated wrong-role, pending/suspended, missing-target, unavailable-target, and backend/network failure states
**Then** the app resolves the link through auth, role, account-status, and tenant gates before rendering protected detail
**And** it routes to the correct supplier detail, account-status panel, sign-in flow, not-found state, or recoverable error state without exposing protected data.

**Given** structured request attributes are displayed
**When** the backend provides schema-derived values
**Then** the app maps them into readable localized label/value groups
**And** raw schema identifiers are not exposed as primary UI labels.

**Given** the request is already responded, expired, cancelled, or otherwise non-actionable
**When** the detail screen renders
**Then** the respond CTA is disabled or replaced with a read-only response/status summary
**And** the reason is clearly localized.

**Given** timeline events are available
**When** the supplier views the request timeline
**Then** Timeline Items show event label, timestamp, actor/system source, optional details, and semantic state.

**Given** tests run
**When** actionable, responded, expired, missing-attributes, loading, error, and timeline cases are exercised
**Then** request detail behavior is verified.

### Story 3.3: Quote Response Form and Review

As a supplier user,
I want to prepare and review a quote response,
So that I can send price, validity, lead time, and message details clearly.

Out of scope: no checkout, payment, order acceptance workflow, chat, supplier self-registration, catalog editing, or hosted conversation thread behavior.

**Acceptance Criteria:**

**Given** an actionable RFQ is open
**When** the supplier starts a response
**Then** the form captures price amount or range, validity date, lead time days, message, and attachments placeholder.

**Given** required response fields are incomplete or invalid
**When** the user advances or reviews the response
**Then** field-level validation appears near the relevant input
**And** entered data remains available for correction.

**Given** the response form is complete
**When** the review screen renders
**Then** it shows a Review Summary Block with request, funeral-home recipient, price, validity, lead time, message, attachments placeholder, and edit links.

**Given** the user edits a reviewed response section
**When** they return to review
**Then** updated values are reflected
**And** the app does not create duplicate response drafts.

**Given** German layouts and keyboard behavior are tested
**When** long labels, validation messages, and action buttons render
**Then** primary actions remain reachable without overlap and text remains readable.

**Given** quote response draft fixtures exist
**When** valid, missing required fields, invalid price, invalid validity date, expired request, and already-responded states are evaluated
**Then** validation results are deterministic and localized before submission.

**Given** tests run
**When** response field entry, validation, review, edit, and preserved form state are exercised
**Then** quote response form behavior is verified.

### Story 3.4: Quote Response Submission and Receipt

As a supplier user,
I want to submit a quote response and see confirmation,
So that I know the response was recorded and the funeral home was notified.

Out of scope: no checkout, payment, order acceptance workflow, chat, supplier self-registration, catalog editing, or hosted conversation thread behavior.

**Acceptance Criteria:**

**Given** a reviewed response is submitted
**When** the backend quote-response endpoint succeeds
**Then** the app shows a Submission Receipt with timestamp, response reference when available, saved state, email-dispatch explanation, and next actions.

**Given** quote-response API fixtures exist
**When** success, validation failure, unauthorized, already-responded, expired request, dispatch warning, and network failure fixtures are mapped
**Then** `quoteResponsesApi` owns request payload mapping, response DTO mapping, problem mapping, and localized message keys.

**Given** email dispatch status is sent, queued, failed, or unavailable
**When** the receipt renders
**Then** it communicates the exact dispatch status with localized text, semantic tone, and non-celebratory receipt language.

**Given** the backend reports that a response already exists
**When** submission or detail refresh detects it
**Then** the app prevents duplicate response submission
**And** routes the user to the read-only response summary.

**Given** response submission fails due to validation, network, auth, expiration, or backend error
**When** the failure is mapped
**Then** the user receives recoverable localized feedback
**And** completed form data remains available where safe.

**Given** tests run
**When** successful submit, dispatch variants, duplicate response, expired request, and failure states are exercised
**Then** response submission and receipt behavior are verified.

### Story 3.5: Supplier Catalog Placeholder

As a supplier user,
I want to view current catalog information where available,
So that I can understand what the platform knows about my supplier profile without editing unsupported data.

**Acceptance Criteria:**

**Given** supplier catalog data is available from the backend
**When** the supplier opens Catalog
**Then** the app shows read-only current items or profile/catalog metadata using localized list/card UI.

**Given** catalog data is unavailable or backend permissions are not confirmed
**When** the Catalog screen renders
**Then** it shows a localized placeholder explaining that editing is not available in mobile v1
**And** it does not expose broken edit actions.

**Given** future edit capability is not in scope
**When** catalog UI is reviewed
**Then** no item editing, creation, deletion, checkout, or order language is present.

**Given** tests run
**When** catalog loading, read-only data, empty, unavailable, and error states are exercised
**Then** catalog placeholder behavior is verified.

### Story 3.6: Supplier Vertical Slice Smoke Flow

As a product team member,
I want a smoke-tested supplier response path,
So that the supplier side of the RFQ loop can be verified end to end on a dev build.

**Acceptance Criteria:**

**Given** a dev backend, seeded supplier credentials, and at least one incoming RFQ are available
**When** the smoke flow runs
**Then** it signs in, opens supplier requests, selects an incoming RFQ, reviews detail, submits a response, and sees the response receipt.

**Given** a request already has a response
**When** the smoke flow or manual QA opens it
**Then** the app shows the already-sent response summary
**And** duplicate submission is not possible.

**Given** the smoke flow is configured
**When** it runs on supported simulator/dev-client paths
**Then** it uses stable localized test selectors or accessibility labels
**And** unresolved backend/data prerequisites are documented as blockers rather than hidden failures.

**Given** quality gates run
**When** `pnpm compile`, focused tests, and the available smoke flow are executed
**Then** the supplier vertical slice is verified or unresolved external blockers are documented.

## Epic 4: Funeral-Home Signup and Verification

Funeral-home applicants can submit a German-first company signup, recover from validation errors, and understand approval, review, failed-verification, or manual-review outcomes.

### Story 4.1: Public Signup Entry and Guided Form Shell

As a funeral-home applicant,
I want a guided signup flow from the unauthenticated experience,
So that I can apply for access without needing an existing account.

Out of scope: no supplier self-registration, admin approval UI, document upload implementation, checkout, payments, or chat.

**Acceptance Criteria:**

**Given** an unauthenticated user opens the app
**When** they choose funeral-home signup
**Then** the app opens a guided multi-step signup flow
**And** the flow uses localized German-first copy and avoids supplier self-registration language.

**Given** the signup form shell renders
**When** the applicant moves through steps
**Then** it shows progress, step titles, helper text, back/next actions, and preserved entered values
**And** it follows Guided Anfrage and Warm Institutional patterns where appropriate.

**Given** the applicant leaves and returns within the same app session
**When** signup state can be safely preserved
**Then** entered values remain available where practical
**And** sensitive values are not logged.

**Given** compact German layouts are tested
**When** long labels, helper text, and primary actions render
**Then** text remains readable and controls do not overlap safe areas, keyboard, or bottom navigation.

**Given** tests run
**When** signup entry, step navigation, preserved values, and localized shell states are exercised
**Then** the signup flow shell behavior is verified.

### Story 4.2: Company, Legal, Address, and Contact Data Capture

As a funeral-home applicant,
I want to provide account, company, legal, address, and contact details,
So that Bestattungszentrum can review and verify my business.

Out of scope: no supplier self-registration, admin approval UI, document upload implementation, checkout, payments, or chat.

**Acceptance Criteria:**

**Given** the applicant proceeds through signup
**When** the account credentials step renders
**Then** it captures the required account fields with localized labels, helper text, validation, and password/security guidance where applicable.

**Given** the applicant proceeds to company/legal details
**When** the step renders
**Then** it captures company name, legal details, Handelsregister or VAT information where applicable, and supports a sole-proprietor path designed for manual review.

**Given** the applicant proceeds to address/contact details
**When** the step renders
**Then** it captures address, contact, and billing email details needed by the backend signup contract.

**Given** required fields are missing or invalid
**When** the applicant advances or submits
**Then** inline localized validation appears near the relevant fields
**And** valid data from other fields remains intact.

**Given** backend signup endpoint naming is still a contract dependency
**When** the API module is implemented
**Then** the public signup endpoint path is isolated in `signupApi`
**And** a future mobile-namespaced endpoint can replace it without changing form screens.

**Given** signup API fixtures exist
**When** success, validation failure, duplicate account, manual-review, provider-unavailable, unauthorized, and network failure fixtures are mapped
**Then** `signupApi` owns request payload mapping, response DTO mapping, problem mapping, and localized message keys.

**Given** tests run
**When** account, company/legal, sole-proprietor, address/contact, validation, and API mapping cases are exercised
**Then** signup data capture behavior is verified.

### Story 4.3: Signup Review and Submission

As a funeral-home applicant,
I want to review my signup details before submitting,
So that I can correct mistakes before the application is sent for verification.

Out of scope: no supplier self-registration, admin approval UI, document upload implementation, checkout, payments, or chat.

**Acceptance Criteria:**

**Given** the applicant completes required signup steps
**When** the review screen renders
**Then** it shows a Review Summary Block with account, company/legal, verification, address, contact, and billing details
**And** each section provides an edit path back to the relevant step.

**Given** the applicant edits reviewed details
**When** they return to review
**Then** updated values are shown
**And** unrelated completed sections remain intact.

**Given** the applicant submits the signup
**When** `signupApi` receives a successful backend response
**Then** the app shows a Submission Receipt or Account Status Panel based on the returned verification/application state.

**Given** submission fails due to validation, duplicate account, backend error, network failure, or provider unavailable state
**When** the failure is mapped
**Then** the app shows recoverable localized feedback
**And** the applicant can correct or retry without losing form progress.

**Given** tests run
**When** review, edit, successful submission, validation failure, duplicate account, network failure, and provider unavailable cases are exercised
**Then** signup review and submission behavior is verified.

### Story 4.4: Verification Result and Applicant Status States

As a funeral-home applicant,
I want to understand the result of my signup submission,
So that I know whether my account is pending approval, under review, needs correction, or blocked by verification issues.

Out of scope: no supplier self-registration, admin approval UI, document upload implementation, checkout, payments, or chat.

**Acceptance Criteria:**

**Given** signup returns a verified or accepted application state
**When** the result screen renders
**Then** the applicant sees a localized pending-approval status with explanation, timestamp/reference where available, and next-step guidance.

**Given** signup returns pending review, manual review, provider unavailable, or sole-proprietor review state
**When** the result screen renders
**Then** the applicant sees a precise non-judgmental status explanation
**And** the copy makes clear that review continues outside the mobile app where appropriate.

**Given** signup returns failed or correctable verification errors
**When** the result screen renders
**Then** the applicant sees what needs correction
**And** can return to the relevant form step without losing other entered details.

**Given** the applicant later signs in with a pending, review, failed, or suspended account
**When** the app evaluates account state
**Then** the shared Account Status Panel presents the same localized status model used by the role gate.

**Given** tests run
**When** pending approval, pending review, manual review, verification failed, provider unavailable, correction path, and later sign-in account-status cases are exercised
**Then** applicant status behavior is verified.
