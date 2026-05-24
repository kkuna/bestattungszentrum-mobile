---
stepsCompleted: [1, 2, 3, 4, 5, 6]
lastStep: 6
status: complete
completedAt: 2026-05-23
assessor: Codex / BMAD implementation-readiness workflow
documentInventory:
  prd:
    - /Users/fariskunic/Documents/personal/bsc/Bestattungszentrum/_bmad-output/planning-artifacts/prd.md
  architecture:
    - /Users/fariskunic/Documents/personal/bsc/Bestattungszentrum/_bmad-output/planning-artifacts/architecture.md
  epics:
    - /Users/fariskunic/Documents/personal/bsc/Bestattungszentrum/_bmad-output/planning-artifacts/epics.md
  ux:
    - /Users/fariskunic/Documents/personal/bsc/Bestattungszentrum/_bmad-output/planning-artifacts/ux-design-specification.md
---

# Implementation Readiness Assessment Report

**Date:** 2026-05-23
**Project:** Bestattungszentrum

## Step 1: Document Discovery

### PRD Files Found

**Whole Documents:**
- `_bmad-output/planning-artifacts/prd.md` (canonical BMAD-ready PRD converted from `docs/mobile-app-prd.md`)

**Sharded Documents:**
- None found

### Architecture Files Found

**Whole Documents:**
- `_bmad-output/planning-artifacts/architecture.md`

**Sharded Documents:**
- None found

### Epics & Stories Files Found

**Whole Documents:**
- `_bmad-output/planning-artifacts/epics.md`

**Sharded Documents:**
- None found

### UX Design Files Found

**Whole Documents:**
- `_bmad-output/planning-artifacts/ux-design-specification.md`

**Sharded Documents:**
- None found

### Discovery Issues

- No duplicate whole/sharded document conflicts found.
- The original PRD existed outside the planning artifacts folder at `docs/mobile-app-prd.md`; it has been converted into the canonical planning artifact `prd.md`.

## Step 2: PRD Analysis

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

Total FRs: 41

### Non-Functional Requirements

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

Total NFRs: 25

### Additional Requirements

- Use the Quiet OTTO Native UX direction, Guided Anfrage form patterns, Quiet Ledger operational-list patterns, and Warm Institutional brand/status patterns.
- Archive earlier explorations as non-reference directions; do not implement Operational Red, Supplier Command, Blue Dispatch Accent, or Restrained OTTO Framework directly.
- Use `#B8312F` as canonical brand red, with distinct semantic success, warning, danger, and info colors.
- Keep the existing Ignite 11.5 / Expo SDK 55 repository foundation; do not scaffold or replace the app.
- Use feature-oriented organization under `src/features`, shared domain logic under `src/domain`, integration/session/query/preferences under `src/services`, and base Ignite primitives under `src/components`.
- Keep REST through apisauce for MVP and add typed API modules for auth, categories, suppliers, quote requests, quote responses, timeline, and signup.
- Use handwritten DTOs and domain mappers for MVP; defer generated OpenAPI clients until backend OpenAPI matches implementation.
- Introduce Zod for critical API/form boundary validation and React Hook Form for guided signup, RFQ, and quote-response forms.
- Keep auth boot/session refresh outside TanStack Query; introduce TanStack Query v5 for server state after the first real API slice starts.
- Runtime app config must live under `src/config`; backend URLs must not be hard-coded in feature code.
- Reactotron must remain development-only and must not log tokens or PII.
- Implementation agents must not edit native project files unless a story explicitly requires native configuration.
- Backend dependencies include auth test/cache instability, signup endpoint namespace, supplier search `q` vs `query`, current-user tenant profile shape, quote state naming, RFQ attribute validation, attachment upload contract, and marketplace-checkout disposition.

### PRD Completeness Assessment

The PRD is now implementation-ready as a BMAD planning artifact: it has canonical frontmatter, source references, personas, user journeys, glossary, 41 functional requirements, 25 non-functional requirements, success metrics, explicit scope boundaries, backend dependencies, rollout plan, open questions, and assumptions. It is intentionally aligned to the already-created `epics.md` requirements inventory so coverage validation can compare stable IDs without renumbering.

Residual readiness risks are the open backend/product questions: attachment upload, signup endpoint namespace, quote state terminology, supplier catalog editing scope, current-user tenant profile shape, and whether request basket/bulk RFQ belongs in MVP.

## Step 3: Epic Coverage Validation

### Coverage Matrix

| FR Number | PRD Requirement | Epic Coverage | Status |
| --------- | --------------- | ------------- | ------ |
| FR1 | The app must replace the boilerplate welcome route with a role-aware app shell. | Epic 1 | Covered |
| FR2 | The app must support unauthenticated login, funeral-home signup, forgot-password placeholder, and legal-link entry points. | Epic 1 | Covered |
| FR3 | The app must authenticate users through the backend mobile auth endpoints for login, refresh, current user, logout, and logout-all. | Epic 1 | Covered |
| FR4 | The app must store access token, refresh token, expiry, user id, role, tenant id, and language preference through a typed session storage boundary. | Epic 1 | Covered |
| FR5 | The app must refresh the session on 401 once, replay the original request once, and fall back to logout or account recovery state if refresh fails. | Epic 1 | Covered |
| FR6 | The app must validate the session at boot and route users by role, tenant, account status, and language preference. | Epic 1 | Covered |
| FR7 | The app must provide separate Expo Router route groups for auth, funeral-home, supplier, and shared flows. | Epic 1 | Covered |
| FR8 | Funeral-home users must see role-specific tabs for Home, Discover, Quotes, Profile, and Settings. | Epic 1 | Covered |
| FR9 | Supplier users must see role-specific tabs for Home, Requests, Catalog, Profile, and Settings. | Epic 1 | Covered |
| FR10 | The app must block wrong-role, suspended, pending, or unavailable routes through a clear account/status screen before business actions begin. | Epic 1 | Covered |
| FR11 | Funeral homes must be able to browse supplier categories and featured/recent supplier or request shortcuts from the funeral-home home screen. | Epic 2 | Covered |
| FR12 | Funeral homes must be able to search suppliers by text and filter by category, region, language, and certification where backend support exists. | Epic 2 | Covered |
| FR13 | The app must show supplier cards with logo or fallback mark, name, categories, regions, short description, verification status, language indicators, and RFQ CTA. | Epic 2 | Covered |
| FR14 | Funeral homes must be able to open supplier detail screens showing metadata, category badges, contact transparency, and a request CTA. | Epic 2 | Covered |
| FR15 | Funeral homes must be able to create a quote request using universal fields: subject, message, deadline, attachments placeholder, quantity when applicable, and supplier/category context. | Epic 2 | Covered |
| FR16 | The app must render category-specific RFQ fields from backend-provided `quoteFormSchema` rather than hard-coded category screens. | Epic 2 | Covered |
| FR17 | The RFQ flow must normalize dynamic schema fields into supported mobile controls and handle unsupported field types without crashing. | Epic 2 | Covered |
| FR18 | Funeral homes must be able to review a complete RFQ before sending it. | Epic 2 | Covered |
| FR19 | Submitting an RFQ must call the backend quote-request endpoint and show a receipt explaining the request was saved and the supplier was notified by email when dispatch status is available. | Epic 2 | Covered |
| FR20 | Funeral-home users must be able to view outgoing quote requests with statuses, timeline access, response summaries, and PDF links where available. | Epic 2 | Covered |
| FR21 | Funeral-home users must be able to read supplier responses and open related documents where backend support exists. | Epic 2 | Covered |
| FR22 | Suspended funeral-home users must be able to read history but must not be able to send new quote requests. | Epic 2 | Covered |
| FR23 | Supplier users must see a home screen with open request count and profile completeness. | Epic 3 | Covered |
| FR24 | Supplier users must be able to view incoming RFQs grouped or prioritized by status and deadline. | Epic 3 | Covered |
| FR25 | Supplier users must be able to open request detail screens with funeral-home contact, structured attributes, attachments placeholder, timeline, and response state. | Epic 3 | Covered |
| FR26 | Supplier users must be able to submit quote responses with price amount or range, validity date, lead time days, message, and attachments placeholder. | Epic 3 | Covered |
| FR27 | Supplier quote response submission must show a receipt explaining the response was saved and the funeral home was notified by email when dispatch status is available. | Epic 3 | Covered |
| FR28 | Supplier users must be able to see which responses were already sent and avoid duplicate or ambiguous response states. | Epic 3 | Covered |
| FR29 | The app must include a supplier catalog placeholder that can read current items where available while deferring item editing unless backend permissions and UX are confirmed. | Epic 3 | Covered |
| FR30 | Funeral-home applicants must be able to submit a public signup flow with account credentials, company/legal details, Handelsregister/VAT or sole-proprietor path, address/contact/billing email, review, and submit. | Epic 4 | Covered |
| FR31 | Signup must support pending approval, pending review, verification failed/correctable input, and verification unavailable/manual-review result states. | Epic 4 | Covered |
| FR32 | Signup validation errors must be recoverable without losing entered form progress. | Epic 4 | Covered |
| FR33 | The app must provide shared screens for notifications/preferences placeholder, language switching, session/security, error states, empty states, offline/retry states, legal links, and request timelines. | Epic 1 | Covered |
| FR34 | The app must support email deep links into relevant request or response detail after auth and role checks. | Epic 2 / Epic 3 | Covered |
| FR35 | The app must keep substantive communication email-backed while preserving request, response, timeline, and dispatch records in the app. | Epic 2 / Epic 3 | Covered |
| FR36 | The app must not expose in-app payments, checkout, escrow, marketplace fee collection, public consumer/family flows, real-time chat, supplier self-registration, or full mobile back-office workflows in MVP. | Epic 1 | Covered |
| FR37 | If the backend marketplace checkout endpoint is used later, the app must present it only as request basket or bulk RFQ workflow, never as purchase, order, or payment. | Epic 2 | Covered |
| FR38 | The app must define mobile DTOs for auth tokens, current user, category, supplier, supplier item, quote request, quote response, request timeline event, funeral-home signup input, create quote request input, create quote response input, and API error. | Epic 1 | Covered |
| FR39 | The mobile app must not import backend source directly across repositories for MVP. | Epic 1 | Covered |
| FR40 | The first local vertical slice must allow funeral-home users to log in, view categories, view suppliers, submit an RFQ, and see it in request history. | Epic 2 | Covered |
| FR41 | The corresponding supplier vertical slice must allow supplier users to log in, view an incoming RFQ, and submit a response. | Epic 3 | Covered |

### Missing Requirements

No missing FR coverage found. All PRD FRs are represented in the epics coverage map.

No FRs were found in the epics coverage map that are absent from the canonical PRD.

### Coverage Statistics

- Total PRD FRs: 41
- FRs covered in epics: 41
- Coverage percentage: 100%

## Step 4: UX Alignment Assessment

### UX Document Status

Found.

- Primary UX specification: `_bmad-output/planning-artifacts/ux-design-specification.md`
- Supporting visual direction reference: `_bmad-output/planning-artifacts/ux-design-directions.html`

### UX to PRD Alignment

The UX specification aligns with the PRD requirements:

- PRD role-aware entry, route groups, and account-status requirements are reflected in the UX role-gated app entry journey.
- PRD funeral-home discovery and RFQ requirements are reflected in the UX discovery, supplier card/detail, guided RFQ, review, and receipt flows.
- PRD supplier inbox and quote-response requirements are reflected in the UX supplier request review, response, review-before-submit, and receipt flow.
- PRD signup and verification requirements are reflected in the UX funeral-home signup and verification journey.
- PRD non-goals around ecommerce, checkout, chat, public consumer flows, and supplier self-registration are explicitly reinforced by the UX anti-patterns and mental model sections.
- PRD German-first, English-supported, accessibility, status-label, long-label, and 48dp touch target requirements are represented in UX localization and accessibility rules.
- PRD dynamic `quoteFormSchema` requirements are represented by the UX Dynamic Schema Field pattern and guided RFQ form behavior.

No UX requirements were found that contradict the canonical PRD.

### UX to Architecture Alignment

The architecture supports the UX specification:

- Architecture preserves the existing Ignite/Expo foundation and extends it through theme tokens and composed domain components, matching the UX design-system strategy.
- Architecture defines Expo Router route groups for auth, funeral-home, supplier, and shared flows, matching UX role navigation.
- Architecture defines domain components required by UX: App Search Header, Category Tile, Supplier Card, RFQ Card, Status Badge, Guided Form Stepper, Dynamic Schema Field, Review Summary Block, Submission Receipt, Account Status Panel, and Timeline Item.
- Architecture defines German-first i18n, localized status mapping, accessibility labels, no hard-coded visible strings, 48dp touch targets, and German overflow testing.
- Architecture supports guided forms through React Hook Form and dynamic schema validation through Zod/domain normalization.
- Architecture supports request/inbox/list/detail state through apisauce API modules and TanStack Query after the first real API slice starts.
- Architecture supports email deep links through auth and role gates before protected detail screens.
- Architecture supports offline-tolerant reads where feasible and explicit retry/error/loading patterns.

No architecture gap was found that blocks the UX direction.

### Alignment Issues

No critical or high UX alignment issues found.

Important open dependencies remain contract-driven rather than UX/architecture contradictions:

- Attachment upload behavior is still pending backend contract confirmation.
- Signup endpoint namespace remains open: `/api/public/funeral-home-signups` versus a future mobile-namespaced endpoint.
- Quote lifecycle state naming must be settled between SDD-style `RESPONDED` and backend `ACCEPTED`/`REJECTED`.
- Supplier search parameter naming must remain isolated in API modules because backend implementation uses `q` while docs may use `query`.
- Physical-device API URL support is architecturally required, but exact config variable names should be finalized in the first implementation story.

### Warnings

- The UX spec is present and strong; no missing-UX warning applies.
- The visual HTML direction exists as an implementation reference, but the Markdown UX spec remains the authoritative UX artifact.
- Implementation stories must preserve the UX rule that completion screens are operational receipts, not celebratory success screens.

## Step 5: Epic Quality Review

### Epic Structure Validation

#### Epic 1: Trusted Role-Aware App Entry

- User value focus: Pass. Users can open the app, avoid boilerplate, authenticate, land in the correct workspace, and understand account restrictions.
- Independence: Pass. Epic 1 stands alone as the required app-entry and shell foundation.
- Notes: Stories 1.3 through 1.5 are technical-enabling stories, but they are contained inside a user-value app-entry epic and are necessary for a brownfield mobile app. This is acceptable because the architecture explicitly says the existing starter must be aligned rather than recreated.

#### Epic 2: Funeral-Home Supplier Discovery and RFQ Flow

- User value focus: Pass. Funeral-home users can discover suppliers, create RFQs, send them, and track history.
- Independence: Pass. Epic 2 depends on Epic 1 shell/session output but not on future Epic 3 or Epic 4 work.
- Notes: The final smoke-flow story is a validation story rather than an end-user product story, but it is correctly placed at the end of the epic and verifies the vertical slice.

#### Epic 3: Supplier Request Inbox and Quote Response Flow

- User value focus: Pass. Supplier users can inspect incoming RFQs and submit responses.
- Independence: Pass with expected dependency on Epic 1 and the RFQ loop established by Epic 2. It does not depend on future Epic 4 work.
- Notes: Seeded data or an RFQ created by Epic 2 is required for smoke testing; the story explicitly documents unresolved backend/data prerequisites as blockers rather than hiding them.

#### Epic 4: Funeral-Home Signup and Verification

- User value focus: Pass. Applicants can apply, recover from validation errors, and understand verification outcomes.
- Independence: Pass. Epic 4 uses Epic 1 app shell/session/status patterns and does not require later epics.
- Notes: Public acquisition could move earlier if signup becomes mandatory for first release; the epics document already notes this sequencing condition.

### Story Quality Assessment

- Story format: Pass. Every story uses a clear "As a / I want / So that" structure.
- Acceptance criteria: Pass overall. Criteria are mostly BDD-style Given/When/Then, testable, and include happy paths, empty/error states, localization, accessibility, and API fixture coverage.
- Story sizing: Pass overall. Stories are implementable vertical increments, with larger foundation stories limited to Epic 1 where the brownfield starter alignment requires them.
- Technical milestone risk: Low. Epic 1 includes technical-enabling stories, but no epic is purely "API development", "database setup", or "infrastructure setup" without user-facing outcome.

### Dependency Analysis

- Forward dependencies: None found.
- Circular dependencies: None found.
- Epic sequencing: Valid. Epic 1 establishes shell/session/status/API boundaries; Epic 2 uses those for funeral-home RFQ; Epic 3 uses shell/session/request patterns for supplier response; Epic 4 uses shell/status/form patterns for signup.
- Database/entity creation timing: Not applicable. This is a mobile app; no local database schema creation is specified. Backend data contracts are isolated in API modules and fixtures.
- Starter template requirement: Satisfied for a brownfield repo. Architecture selects the existing Ignite/Expo foundation, and Story 1.1 covers starter alignment rather than creating a new project.

### Critical Violations

None found.

### Major Issues

1. **FR34 email deep-link behavior is covered at epic level but not explicit enough at story acceptance-criteria level.**
   - Evidence: The coverage map assigns FR34 to Epic 2 / Epic 3: "Support email deep links into protected request/response detail after auth and role checks." Story 2.6 covers outgoing request detail/timeline, and Story 3.2 covers supplier request detail/timeline, but neither explicitly tests opening those details from email deep links after auth and role checks. Story 2.7 references deep linking only for blocked RFQ creation, not email-to-detail behavior.
   - Impact: Implementation agents could satisfy request/detail screens while missing the protected email deep-link entry path and its auth/role safety behavior.
   - Recommendation: Add explicit ACs to Story 2.6 and Story 3.2, or add a shared story, covering email deep links into request/response detail after unauthenticated, authenticated-right-role, authenticated-wrong-role, suspended/pending, missing-target, and unavailable-target states.

### Minor Concerns

1. **Forgot-password placeholder is implied but not directly asserted in a story AC.**
   - Evidence: FR2 includes "forgot-password placeholder", and Epic 1 covers FR2, but Story 1.1 and Story 1.7 do not explicitly name the forgot-password placeholder in their acceptance criteria.
   - Impact: Low implementation risk, but a developer could omit the placeholder while still satisfying most auth shell criteria.
   - Recommendation: Add an AC to Story 1.1 or Story 1.7 requiring a localized forgot-password placeholder in the unauthenticated entry flow.

2. **Smoke-flow stories are process-validation stories rather than direct user stories.**
   - Evidence: Story 2.8 and Story 3.6 use "As a product team member" and validate end-to-end smoke paths.
   - Impact: Low. These are correctly placed at the end of their epics and improve implementation readiness.
   - Recommendation: Keep them, but treat them as QA/verification stories if the implementation workflow distinguishes product stories from validation stories.

### Best Practices Compliance Checklist

| Check | Result |
| ----- | ------ |
| Epics deliver user value | Pass |
| Epics can function independently in sequence | Pass |
| Stories appropriately sized | Pass |
| No forward dependencies | Pass |
| Database tables created when needed | Not applicable |
| Clear acceptance criteria | Pass with minor gaps |
| Traceability to FRs maintained | Pass with story-level FR34 gap |

### Overall Epic Quality Assessment

The epic set is strong and mostly implementation-ready. There are no critical structural violations and no forward dependencies. The main remediation needed before starting implementation is to make FR34 email deep-link behavior explicit at story acceptance-criteria level, then add a direct forgot-password placeholder AC for FR2 completeness.

## Step 6: Summary and Recommendations

### Overall Readiness Status

NEEDS WORK.

The planning set is close to implementation-ready, but one major story-level traceability gap should be fixed before implementation starts: FR34 email deep-link behavior is covered in the epic map but not explicit enough in story acceptance criteria.

Once that is patched, the artifacts can reasonably move to implementation with known backend-contract dependencies tracked as implementation blockers where relevant.

### Critical Issues Requiring Immediate Action

No critical issues found.

### Major Issues Requiring Action Before Implementation

1. **Add explicit email deep-link acceptance criteria for FR34.**
   - Add ACs to Story 2.6 and Story 3.2, or create a shared story, covering email links into request/response detail after auth and role checks.
   - Required states: unauthenticated, authenticated correct role, authenticated wrong role, pending/suspended account, missing target, unavailable target, and backend/network failure.

### Minor Fixes Recommended Before Implementation

1. **Add a direct forgot-password placeholder AC.**
   - Add to Story 1.1 or Story 1.7.
   - It should require a localized forgot-password placeholder in the unauthenticated flow.

2. **Classify smoke-flow stories as validation stories if the implementation tracker supports story types.**
   - Story 2.8 and Story 3.6 are useful and should remain.
   - Treat them as QA/verification stories to avoid confusing them with direct end-user product increments.

### Contract Dependencies to Track During Implementation

- Attachment upload behavior is still pending backend contract confirmation.
- Signup endpoint namespace remains open.
- Quote lifecycle state naming must be settled.
- Supplier search parameter naming must stay isolated in API modules.
- Physical-device API URL config variable names should be finalized in Story 1.1 or the first config story.

### Recommended Next Steps

1. Patch `_bmad-output/planning-artifacts/epics.md` for FR34 email deep-link ACs.
2. Patch `_bmad-output/planning-artifacts/epics.md` for the forgot-password placeholder AC.
3. Re-run this readiness check or do a focused review of those two changes.
4. Start implementation with Epic 1 Story 1.1 after the story fixes are in place.
5. Keep backend-contract dependencies visible as blockers in the specific stories that touch them.

### Final Note

This assessment identified 3 planning issues across epic quality and story-level traceability: 1 major issue and 2 minor concerns. It also confirmed strong coverage elsewhere: the canonical PRD is now discoverable, all 41 PRD FRs are covered by epics, UX aligns with PRD and architecture, and there are no critical structural violations or forward dependencies.

**Final report date:** 2026-05-23

**Assessor:** Codex using BMAD implementation-readiness workflow
