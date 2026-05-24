---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-05-23'
inputDocuments:
  - /Users/fariskunic/Documents/personal/bsc/Bestattungszentrum/docs/mobile-app-prd.md
  - /Users/fariskunic/Documents/personal/bsc/Bestattungszentrum/_bmad-output/planning-artifacts/ux-design-specification.md
  - /Users/fariskunic/Documents/personal/bsc/Bestattungszentrum/_bmad-output/research/otto-app/otto-app-visual-scan.md
  - /Users/fariskunic/Documents/personal/bsc/Bestattungszentrum_SDD.md
workflowType: 'architecture'
project_name: 'Bestattungszentrum'
user_name: 'Fariskunic'
date: '2026-05-23'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

Bestattungszentrum Mobile is a role-aware Expo application serving two primary tenant roles: funeral homes and suppliers.

Core functional areas:

- Authentication and session lifecycle: login, refresh, logout, logout-all, current user resolution, role/account-status routing.
- Funeral-home signup: German-first company registration, verification/manual-review outcomes, pending approval states, and recovery from validation errors.
- Supplier discovery: categories, supplier search, filters, supplier detail, verified supplier metadata, and RFQ entry points.
- RFQ creation: universal fields plus category-specific dynamic schema fields, review-before-submit, send receipt, and history.
- Supplier inbox: incoming RFQ list/detail, status grouping, response submission, and response receipt.
- Request history and timelines: outgoing requests, incoming requests, quote responses, email-dispatch events, PDF links where available.
- Profile/settings: language preference, account/session state, legal links, notification placeholders, and role-appropriate settings.
- Admin/back-office remains outside the mobile app except as an integration dependency.

Architecturally, the mobile app needs clear boundaries around session state, role gates, API DTO mapping, dynamic form rendering, localized status mapping, and email-backed workflow states.

**Non-Functional Requirements:**

- German-first and English-supported from the first implementation pass.
- No hard-coded visible strings in screens or reusable components.
- WCAG AA-equivalent accessibility expectations for mobile.
- 48dp minimum touch targets and German overflow testing on compact phones.
- Offline-tolerant reading where feasible, but writes require connectivity in v1.
- Secure local token storage through a typed storage boundary.
- API refresh-on-401 behavior with safe logout fallback.
- Mobile cold-start target from SDD: under 3 seconds on mid-range Android.
- EU/GDPR sensitivity: avoid PII in logs, preserve tenant boundaries, support secure document/link handling when attachments/PDFs are enabled.
- No ecommerce, checkout, payment, chat, or consumer-family flows in MVP.

**Scale & Complexity:**

- Primary domain: mobile B2B marketplace workflow with backend integration.
- Complexity level: high for a mobile MVP because of role separation, multi-tenant data boundaries, auth/session risk, dynamic RFQ schemas, localization, compliance sensitivity, and backend contract drift.
- Estimated architectural components:
  - App shell/navigation
  - Auth/session module
  - API client and endpoint modules
  - DTO/domain model layer
  - i18n/localization layer
  - Theme/design-token layer
  - Role/account-status gate
  - Supplier discovery module
  - Dynamic RFQ form module
  - Supplier inbox/response module
  - Request timeline/history module
  - Signup/verification-status module
  - Storage/preferences module
  - Testing/smoke-flow harness

### Technical Constraints & Dependencies

The app should build on the current Ignite/Expo baseline rather than replacing it:

- Expo SDK, React Native, React, Expo Router, Hermes/new architecture.
- Existing Ignite components: `Screen`, `Text`, `Button`, `TextField`, `Card`, `ListItem`, `Header`, `Icon`, `EmptyState`, and toggles.
- Existing `ThemeProvider`, i18n setup, MMKV helpers, apisauce scaffold, Jest/RNTL, Reactotron, Maestro, and dependency-cruiser.
- Route groups should support `(auth)`, `(funeral-home)`, `(supplier)`, and `(shared)`.
- Backend endpoints already exist for mobile auth, categories, suppliers, quote requests, quote responses, timelines, PDFs, and funeral-home signup.
- Backend auth uses opaque access tokens plus rotating refresh tokens; the app must not decode JWT claims.
- Backend contract issues must be isolated behind typed API modules:
  - supplier search `q` vs OpenAPI `query`
  - signup endpoint namespace
  - quote state model differences
  - attachment upload uncertainty
  - auth/session test instability
  - `marketplace-checkout` must not surface as checkout in mobile MVP
- The mobile app must not import backend source directly across repos for MVP.

### Cross-Cutting Concerns Identified

- Role-aware navigation and authorization: every screen and CTA must respect user role, tenant, and account status.
- Session resilience: token refresh, boot-time session validation, logout fallback, storage hydration, and wrong-role prevention.
- Localization: German default, English secondary, localized enums/statuses/errors, date/number/currency formatting.
- Dynamic forms: category schema rendering, validation, unsupported field fallback, review-before-submit, and state preservation.
- Status modeling: account states, RFQ states, quote response states, email dispatch states, and timeline events need consistent domain mapping.
- API problem handling: backend errors should map into recoverable UI states and localized copy.
- Offline/network states: cached reading where practical, no offline write queue in v1, clear retry behavior.
- Accessibility: labels for icon controls/status badges, screen-reader order, Dynamic Type support where practical, color contrast.
- Security/privacy: token storage, no PII in logs, tenant boundary enforcement by API, safe handling for future attachments/PDFs/deep links.
- Design-system consistency: extend Ignite with Bestattungszentrum tokens and domain components rather than creating a second UI kit.
- Testing strategy: unit tests for auth/storage/API mapping, component tests for gates/forms/states, and Maestro smoke flows for login and RFQ paths.

## Starter Template Evaluation

### Primary Technology Domain

The primary technology domain is a React Native mobile application built with Expo, TypeScript, Expo Router, and the Ignite application foundation.

This is not a greenfield empty repository. The app has already been initialized as an Ignite/Expo project, so the starter decision is whether to preserve the existing foundation or replace it.

### Starter Options Considered

**Option 1: Keep Existing Ignite/Expo App**

The current repository already includes:

- Ignite 11.5.0 metadata in `app.json`
- Expo SDK 55 dependencies
- React Native 0.83
- React 19
- Expo Router entrypoint
- TypeScript
- Ignite component primitives
- MMKV storage
- apisauce
- i18next/react-i18next
- Reactotron
- Jest and React Native Testing Library
- Maestro test script hooks
- Native iOS/Android project folders and local build helper scripts
- dependency-cruiser scripts

This option preserves the PRD requirement to build on the existing Ignite/Expo template instead of replacing it.

**Option 2: Recreate with `create-expo-app`**

Expo's current documented creation path supports new Expo apps through `create-expo-app`. This would provide a clean Expo Router app, but it would discard the existing Ignite structure, components, scripts, Reactotron setup, MMKV helpers, and project-specific native/app configuration.

This is not recommended because the current app is already aligned with the product's intended stack.

**Option 3: Recreate with Ignite CLI**

Ignite's official current CLI path is `npx ignite-cli@latest new <AppName>`. Ignite remains a maintained React Native boilerplate with TypeScript, React Navigation, Expo support, MMKV, apisauce, Reactotron, Jest/RNTL, Maestro examples, and component generators.

This is also not recommended for the current repo because the project already appears to be generated from Ignite 11.5. Re-running the starter would create churn without solving an architectural problem.

### Selected Starter: Existing Ignite 11.5 / Expo SDK 55 Application

**Rationale for Selection:**

The selected starter is the existing repository foundation.

Keeping the current Ignite/Expo app gives us the strongest path because it already matches the PRD and UX assumptions:

- Expo Router supports the required route groups: `(auth)`, `(funeral-home)`, `(supplier)`, and `(shared)`.
- Ignite primitives can be re-themed for the Bestattungszentrum design system.
- apisauce can become the typed mobile API boundary.
- MMKV can back session and language preference storage.
- i18next can support German-first and English-secondary localization.
- Jest/RNTL and Maestro already align with the required test strategy.
- Native iOS/Android project folders and local build helper scripts already exist for simulator, device, and manual release workflows.

The architecture should therefore focus on adapting and hardening the existing starter rather than replacing it.

**Initialization Command:**

No new project initialization should be run for this repository.

For reference only, a fresh Ignite app would use:

```bash
npx ignite-cli@latest new Bestattungszentrum
```

A fresh Expo SDK 55 app would use:

```bash
npx create-expo-app@latest --template default@sdk-55
```

These are reference commands, not implementation commands for this project.

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**

- TypeScript-first React Native app.
- Expo-managed native runtime with dev client.
- Hermes JavaScript engine.
- New React Native architecture enabled.

**Routing & Navigation:**

- Expo Router entrypoint through `expo-router/entry`.
- File-based routing suitable for role-based route groups.
- React Navigation remains available underneath Expo Router.

**Styling & Design System:**

- Ignite theme context and component primitives provide the base design system.
- Bestattungszentrum should replace Ignite's visual tokens with brand tokens rather than introduce another UI kit.

**API & Storage:**

- apisauce provides the REST API client foundation.
- MMKV provides fast local key-value storage for session, token, and language-preference state.

**Testing Framework:**

- Jest and React Native Testing Library are already configured.
- Maestro smoke-test scripts are already present and should be expanded once critical flows exist.

**Development Experience:**

- Expo dev-client workflow.
- Reactotron development tooling.
- TypeScript compile script.
- ESLint and Prettier.
- dependency-cruiser for architecture guardrails.
- Native iOS/Android local build helper scripts.

**Implementation Note:**

The first implementation story should not scaffold a new app. It should audit and align the existing starter: remove boilerplate welcome behavior, establish route groups, update theme/i18n defaults, replace sample API code, and create the session/API boundaries.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- Keep the existing Ignite/Expo foundation.
- Use Expo Router route groups for role-aware navigation.
- Keep REST as the mobile API protocol.
- Use typed handwritten mobile DTOs for MVP.
- Use a session service boundary around MMKV token/session storage.
- Use German-first i18n from the first implementation story.
- Build a dynamic RFQ form renderer instead of hard-coded category forms.
- Use feature-oriented code organization with thin Expo Router files.

**Important Decisions (Shape Architecture):**

- Add TanStack Query for server-state list/detail flows once the first real API slice starts.
- Add Zod for critical API/form boundary validation.
- Use React Hook Form for guided signup, RFQ, and quote-response forms.
- Keep Ignite primitives as the base design system.
- Use Maestro for critical smoke flows after core screens exist.

**Deferred Decisions (Post-MVP or Contract-Dependent):**

- Generated OpenAPI client: defer until backend OpenAPI matches implementation.
- Attachment upload architecture: defer until backend upload contract is confirmed.
- Persisted query cache/offline read cache: defer until request/supplier DTOs stabilize.
- Push notifications: defer until RFQ email-backed workflows are green.
- Sentry or equivalent error tracking: decide after GDPR/DPA review and release-readiness planning.

### Data Architecture

The mobile app will use handwritten TypeScript DTOs and domain mapping functions for MVP.

Backend response types must not be consumed directly across repos. Each endpoint module owns:

- request DTO type
- response DTO type
- mapper from API response to app domain model
- problem/error mapping
- fixture-based tests

Zod 4 should be introduced for runtime validation at important boundaries:

- auth/session responses
- current user response
- categories and dynamic `quoteFormSchema`
- quote request creation response
- quote response creation response
- signup result/status response

Dynamic RFQ schemas remain backend-provided JSON-like schemas. The mobile app normalizes them into supported field descriptors before rendering.

Server-state should use TanStack Query v5 for categories, suppliers, requests, supplier inbox, timelines, and response summaries. Auth boot/session refresh should stay outside TanStack Query so app startup remains explicit and predictable.

### Authentication & Security

Authentication follows the existing backend model: opaque access tokens plus rotating refresh tokens.

The app must not decode JWT claims.

Session architecture:

- `sessionStorage` wraps MMKV and is the only module allowed to read/write token material.
- `sessionService` owns login, refresh, logout, logout-all, and boot hydration.
- `authApi` owns auth endpoint calls.
- Route gates consume derived session/account state, not raw tokens.
- API client injects access token into authenticated requests.
- On 401, the API layer attempts one refresh and one replay, then falls back to logout/account recovery state.
- Refresh-token rotation must update storage atomically where practical.

For MVP, MMKV remains the session store because it is already in the starter and required by the PRD. Token access must be centralized so the storage backend can later move to encrypted MMKV or SecureStore without touching screens.

Security rules:

- No PII or tokens in logs, Reactotron events, errors, or analytics.
- Wrong-role navigation must fail closed into an account/status screen.
- Suspended/pending accounts must be blocked before business actions begin.
- Deep links must resolve through auth and role gates before loading protected content.

### API & Communication Patterns

The mobile app uses REST through the existing apisauce foundation.

API modules should be organized by domain:

- `authApi`
- `categoriesApi`
- `suppliersApi`
- `quoteRequestsApi`
- `quoteResponsesApi`
- `timelineApi`
- `signupApi`

Each method returns a normalized result shape rather than leaking apisauce internals into screens.

Recommended result pattern:

- success: `{ ok: true, data }`
- failure: `{ ok: false, problem, status, messageKey, details }`

Error mapping must produce localization keys, not final English strings.

Backend contract mismatches are isolated in API modules:

- supplier search `q` vs `query`
- public signup endpoint vs mobile namespace
- quote lifecycle state naming
- attachment placeholders
- PDF/timeline availability
- hidden `marketplace-checkout`

The mobile app must not expose checkout/payment language even if a backend endpoint exists.

### Frontend Architecture

Use feature-oriented organization with thin Expo Router route files.

Recommended structure:

- `src/app` for Expo Router route groups and layouts.
- `src/features/auth`
- `src/features/funeral-home`
- `src/features/supplier`
- `src/features/signup`
- `src/features/requests`
- `src/features/shared`
- `src/domain` for shared domain types/status mappers where cross-feature reuse is real.
- `src/services/api` for API client and endpoint modules.
- `src/services/session` for session orchestration.
- `src/i18n` for German/English translations and enum label mapping.
- `src/theme` for brand tokens and Ignite theme alignment.

Route files should compose feature screens. Business logic should live in feature modules, hooks, API modules, or domain helpers, not directly in route files.

State strategy:

- Session/account state: React context or small explicit store owned by session module.
- Server state: TanStack Query for fetched lists/details and mutations.
- Form state: React Hook Form for guided forms.
- Local preferences: MMKV-backed preference service.
- Avoid Redux/Zustand unless session/context becomes measurably painful.

Component strategy:

- Keep Ignite components as base primitives.
- Add domain components from the UX spec: App Search Header, Category Tile, Supplier Card, RFQ Card, Status Badge, Guided Form Stepper, Dynamic Schema Field, Review Summary Block, Submission Receipt, Account Status Panel, Timeline Item.
- All visible labels come from i18n.

### Infrastructure & Deployment

The mobile app keeps the existing Expo dev-client and native iOS/Android local build strategy.

Environment configuration:

- Keep config under `src/config`.
- Support local iOS simulator, Android emulator, physical Android via `pnpm adb`, and production API URLs.
- Do not hard-code backend URLs in feature code.

CI/check commands:

- `pnpm compile`
- `pnpm lint:check`
- `pnpm test`
- `pnpm depcruise`
- Maestro smoke flows once screens exist

Observability:

- Keep `src/utils/crashReporting` as an abstraction.
- Do not add a concrete third-party error tracker until GDPR/DPA and release needs are confirmed.
- Reactotron remains development-only and must not log tokens or PII.

Deployment:

- Development builds use local simulator/device workflows.
- Production app release uses locally/native-side produced artifacts uploaded manually by the owner.
- Production app release requires final icons/splash, privacy manifests, app links, production API config, and German/English legal links.

### Decision Impact Analysis

**Implementation Sequence:**

1. Align existing starter: remove welcome flow, add route groups, update theme and i18n defaults.
2. Build session storage/service/API foundation.
3. Build role/account-status gate.
4. Add typed API modules and DTO mappers.
5. Introduce TanStack Query for categories/suppliers/request lists.
6. Build funeral-home discovery and RFQ flow.
7. Build supplier inbox and quote response flow.
8. Build signup/verification flow.
9. Add Maestro smoke flows and accessibility/localization QA.

**Cross-Component Dependencies:**

- Auth/session must land before route groups can behave correctly.
- i18n and status mapping must land before user-facing forms and cards are implemented.
- API result mapping must land before TanStack Query hooks.
- Dynamic schema normalization must land before RFQ and quote response forms.
- Account-status rules affect both navigation and API mutation availability.
- Design-token work affects every screen and should be done before high-volume component creation.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**

The main conflict risk is not database schema design inside this repo; it is inconsistent mobile code organization, API result formats, status naming, form validation patterns, i18n handling, and role-gated navigation.

All implementation agents must follow the same conventions for:

- feature module placement
- route file responsibilities
- API module return shapes
- DTO/domain mapping
- enum/status localization
- form validation timing
- loading/error/empty states
- token/session access
- test placement
- German-first copy handling

### Naming Patterns

**Database Naming Conventions:**

The mobile app does not own database tables. Do not invent local database table or column conventions in the mobile repo.

When referring to backend fields, preserve backend DTO names at the API boundary. Convert only inside explicit mapper functions if the mobile domain model differs.

**API Naming Conventions:**

- API modules use camelCase TypeScript names: `authApi`, `suppliersApi`, `quoteRequestsApi`.
- API methods use verb-object names: `login`, `refreshSession`, `getCurrentUser`, `listSuppliers`, `createQuoteRequest`.
- Query params must match backend implementation at the API module boundary, even when names differ from docs.
- Backend enum strings are treated as raw API values until mapped.

**Code Naming Conventions:**

- React components: PascalCase, e.g. `SupplierCard`, `StatusBadge`.
- Hooks: `use` prefix, e.g. `useSession`, `useSuppliers`.
- Services: camelCase exported singleton/object or named functions, e.g. `sessionService`, `sessionStorage`.
- Types: PascalCase, e.g. `QuoteRequest`, `QuoteRequestDto`, `QuoteRequestStatus`.
- Route files remain Expo Router conventions: `_layout.tsx`, `index.tsx`, `[id].tsx`.
- Feature files should prefer descriptive names over generic names: `QuoteRequestReviewScreen.tsx`, not `ReviewScreen.tsx`.

### Structure Patterns

**Project Organization:**

Route files in `src/app` must stay thin. They should import and render feature screens or route layouts, not contain business logic.

Feature modules own feature-specific screens, components, hooks, fixtures, and tests.

Shared domain concepts go in `src/domain` only when reused across multiple features. Do not prematurely move one-feature helpers into global shared folders.

Services go under `src/services`:

- `src/services/api` for REST client and endpoint modules
- `src/services/session` for auth/session orchestration
- `src/services/preferences` if language/preferences grow beyond simple helpers

**Test Placement:**

Use co-located tests for units/components:

- `SupplierCard.test.tsx`
- `sessionService.test.ts`
- `quoteRequestMappers.test.ts`

Use fixtures next to the API/domain tests that need them. Keep Maestro flows in `.maestro/flows`.

### Format Patterns

**API Response Formats:**

API modules must return normalized app results, not raw apisauce responses.

Use:

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

Screens and hooks consume `AppApiResult<T>` or TanStack Query wrappers around it. They should not inspect apisauce internals.

**Data Exchange Formats:**

- API DTOs use backend field names.
- App domain models use TypeScript-friendly names and stable app enums.
- Dates crossing the API boundary are ISO strings.
- Formatting dates, currency, and numbers happens at the display layer through locale-aware utilities.
- Nullable backend fields must be explicitly represented as `null` or optional in DTOs. Mappers decide the app fallback.

### Communication Patterns

**State Management Patterns:**

- Session state is explicit and centralized in the session module.
- Server state is owned by TanStack Query hooks.
- Form state is owned by React Hook Form.
- Local preferences are owned by typed storage/preference helpers.
- Avoid duplicating server data into local context unless there is a clear derived-state reason.

**Status Mapping Patterns:**

Backend status values must be mapped through centralized helpers before display.

A status display object should include:

- raw value
- normalized app status
- localized label key
- semantic tone: success, warning, danger, info, neutral
- accessibility label key where needed

Do not hard-code status labels inside cards, forms, or route files.

### Process Patterns

**Error Handling Patterns:**

- API/domain errors map to localization keys.
- Field validation errors appear inline near the field.
- Screen-level API failures use recoverable banners or empty/error states.
- Business-blocking account states use `AccountStatusPanel`.
- Receipt-level warnings are used for email dispatch uncertainty.
- Destructive or data-loss actions require confirmation.

**Loading State Patterns:**

- Lists and cards use stable skeleton/placeholder states where practical.
- Buttons support a loading state without changing height.
- Submit actions disable duplicate submission while pending.
- Route gates must show an explicit boot/refresh state rather than flashing the wrong role screen.
- Avoid full-screen spinners for content-heavy views unless no stable layout exists yet.

### Enforcement Guidelines

**All AI Agents MUST:**

- Keep Expo Router files thin and move business logic into feature modules.
- Use i18n keys for all user-facing strings, including errors and accessibility labels.
- Use German as the default language and layout stress case.
- Access token/session data only through the session service/storage boundary.
- Return normalized API results from API modules.
- Map backend statuses before rendering.
- Use Ignite primitives and project domain components before introducing new UI primitives.
- Add focused tests for mappers, session behavior, API problem mapping, and critical form validation.

**Pattern Enforcement:**

- `pnpm compile` catches type drift.
- `pnpm lint:check` catches lint/style violations.
- `pnpm test` covers behavior and mapping rules.
- `pnpm depcruise` should guard against route/screens importing from forbidden layers once rules are added.
- Architecture violations should be fixed in the story that introduces them, not deferred.

### Pattern Examples

**Good Examples:**

- `src/app/(funeral-home)/discover/index.tsx` renders `DiscoverScreen`.
- `src/features/funeral-home/discovery/SupplierCard.tsx` receives display-ready supplier/domain props.
- `src/services/api/suppliersApi.ts` maps backend `q` search parameter internally.
- `src/domain/status/quoteRequestStatus.ts` maps `SENT` to a localized label key and semantic tone.
- `src/features/requests/rfq/DynamicSchemaField.tsx` renders only normalized field descriptors.

**Anti-Patterns:**

- Putting token reads directly in screens.
- Calling apisauce directly from components.
- Hard-coding German or English visible strings in JSX.
- Building one-off category-specific RFQ screens.
- Reusing brand red for every error, warning, and success state.
- Introducing Redux/Zustand before the session/context boundary proves insufficient.
- Creating a second design system or third-party UI kit before Ignite primitives are exhausted.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
Bestattungszentrum/
├── android/
│   └── native Android project files for local builds, emulator runs, physical-device installs, and manual Play Console upload artifacts
├── ios/
│   └── native iOS project files for local simulator runs, physical-device installs, archives, and manual App Store/TestFlight upload artifacts
├── app.json
├── app.config.ts
├── babel.config.js
├── metro.config.js
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── jest.config.js
├── .eslintrc.js
├── .dependency-cruiser.js
├── .maestro/
│   ├── shared/
│   │   └── _OnFlowStart.yaml
│   └── flows/
│       ├── funeral-home-login.yaml
│       ├── supplier-login.yaml
│       └── funeral-home-rfq.yaml
├── assets/
│   ├── images/
│   └── icons/
├── docs/
│   └── mobile-app-prd.md
├── _bmad-output/
│   ├── planning-artifacts/
│   │   ├── ux-design-specification.md
│   │   ├── ux-design-directions.html
│   │   └── architecture.md
│   └── implementation-artifacts/
├── test/
├── types/
└── src/
    ├── app/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   ├── (auth)/
    │   │   ├── _layout.tsx
    │   │   ├── login.tsx
    │   │   └── signup.tsx
    │   ├── (funeral-home)/
    │   │   ├── _layout.tsx
    │   │   ├── index.tsx
    │   │   ├── discover/
    │   │   │   ├── index.tsx
    │   │   │   └── [supplierId].tsx
    │   │   ├── quotes/
    │   │   │   ├── index.tsx
    │   │   │   ├── [requestId].tsx
    │   │   │   └── new.tsx
    │   │   ├── profile.tsx
    │   │   └── settings.tsx
    │   ├── (supplier)/
    │   │   ├── _layout.tsx
    │   │   ├── index.tsx
    │   │   ├── requests/
    │   │   │   ├── index.tsx
    │   │   │   ├── [requestId].tsx
    │   │   │   └── [requestId]/respond.tsx
    │   │   ├── catalog.tsx
    │   │   ├── profile.tsx
    │   │   └── settings.tsx
    │   └── (shared)/
    │       ├── account-status.tsx
    │       ├── language.tsx
    │       ├── legal/
    │       │   ├── impressum.tsx
    │       │   ├── privacy.tsx
    │       │   └── terms.tsx
    │       └── request/[requestId]/timeline.tsx
    ├── components/
    ├── config/
    ├── devtools/
    ├── domain/
    │   ├── account/
    │   ├── quote/
    │   ├── schema/
    │   └── localization/
    ├── features/
    │   ├── auth/
    │   ├── signup/
    │   ├── funeral-home/
    │   ├── supplier/
    │   ├── requests/
    │   └── shared/
    ├── i18n/
    │   ├── de.ts
    │   ├── en.ts
    │   ├── index.ts
    │   ├── statusLabels.ts
    │   └── translate.ts
    ├── services/
    │   ├── api/
    │   ├── query/
    │   ├── session/
    │   └── preferences/
    ├── theme/
    └── utils/
```

### Architectural Boundaries

**API Boundaries:**

The API boundary is `src/services/api`. Feature modules may call typed API functions or TanStack Query hooks, but screens must not call apisauce directly.

API modules own backend-specific parameter names, endpoint paths, DTOs, response mapping, and problem mapping.

**Component Boundaries:**

`src/components` contains Ignite/base primitives only. Domain UI belongs in `src/features/**` or `src/features/shared/components`.

Feature-specific components stay inside their feature folder until reused by at least two features.

**Service Boundaries:**

Session logic belongs in `src/services/session`. Only this module may read or write tokens.

Query configuration belongs in `src/services/query`. Feature hooks may use TanStack Query, but query keys must come from the central query-key module.

Language preference belongs in `src/services/preferences` if it becomes more than direct i18n setup.

**Native Project Boundaries:**

The `ios/` and `android/` folders are part of the project and are allowed to contain native configuration needed for local builds, simulator/device testing, signing, and manual upload artifacts.

Feature implementation agents should not edit native project files unless the story explicitly requires native configuration, permissions, signing, deep links, privacy manifests, app icons, splash behavior, or platform-specific build settings.

### Requirements to Structure Mapping

**Authentication and Session:**

- Routes: `src/app/(auth)`
- Screens: `src/features/auth`
- Services: `src/services/session`, `src/services/api/authApi.ts`
- Tests: session service, auth API mappers, role gate

**Funeral-Home Signup:**

- Routes: `src/app/(auth)/signup.tsx`
- Feature: `src/features/signup`
- API: `src/services/api/signupApi.ts`
- Domain: account status mapping in `src/domain/account`

**Supplier Discovery:**

- Routes: `src/app/(funeral-home)/discover`
- Feature: `src/features/funeral-home/discovery`
- API: `src/services/api/categoriesApi.ts`, `src/services/api/suppliersApi.ts`
- Shared UI: `AppSearchHeader`, `CategoryTile`, `SupplierCard`

**RFQ Creation and History:**

- Routes: `src/app/(funeral-home)/quotes`
- Feature: `src/features/funeral-home/quotes`
- Shared request components: `src/features/requests`
- API: `quoteRequestsApi`, `timelineApi`
- Domain: `quoteFormSchema`, quote request status mapping

**Supplier Inbox and Response:**

- Routes: `src/app/(supplier)/requests`
- Feature: `src/features/supplier/inbox`
- API: `quoteRequestsApi`, `quoteResponsesApi`, `timelineApi`
- Shared request components: RFQ card, timeline item, submission receipt

**Localization and Accessibility:**

- Translations: `src/i18n/de.ts`, `src/i18n/en.ts`
- Status labels: `src/i18n/statusLabels.ts`
- Components: all shared/domain components accept localized labels or known enum values that map to i18n keys

### Integration Points

**Internal Communication:**

Routes render feature screens. Feature screens use feature hooks. Feature hooks call API modules directly or TanStack Query wrappers. API modules return normalized results. Domain mappers convert backend DTOs into app-safe models.

**External Integrations:**

- Backend REST API through apisauce
- Deep links through Expo Linking/Expo Router and native iOS/Android configuration
- Local storage through MMKV wrappers
- Future attachments through backend contract, not direct storage assumptions
- Future push notifications through native iOS/Android configuration after RFQ flows stabilize

**Data Flow:**

1. Route loads feature screen.
2. Feature hook requests data through TanStack Query or API module.
3. API module injects auth token through API client.
4. API response is validated/mapped.
5. Feature screen renders domain components.
6. User action submits through form/service/API module.
7. Result maps to receipt, inline validation, or recoverable error state.

### File Organization Patterns

**Configuration Files:**

Root-level config remains where Ignite/Expo and native tooling expect it. Runtime app config remains in `src/config`.

Environment configuration must support:

- iOS Simulator
- Android Emulator
- physical iOS device
- physical Android device
- production builds

Physical devices cannot rely on simulator-only addresses like `localhost` or `10.0.2.2`. The app must support a LAN-accessible development API URL or another explicit physical-device backend URL.

**Source Organization:**

`src/app` is routing. `src/features` is product behavior. `src/services` is integration and orchestration. `src/domain` is cross-feature domain logic. `src/components` is base UI. `src/theme` is visual system.

**Test Organization:**

Unit and component tests are co-located. Maestro flows live in `.maestro/flows`.

Maestro and manual QA must cover:

- iOS Simulator
- Android Emulator
- physical iPhone
- physical Android

**Asset Organization:**

App icons and image assets remain under `assets`. Feature-specific static imagery should be avoided unless the UX explicitly requires it.

### Development Workflow Integration

**Development Server Structure:**

Use existing scripts where they apply:

- `pnpm start` for Metro/dev client
- `pnpm ios` for iOS simulator/native run
- `pnpm android` for Android emulator/native run
- `pnpm adb` for Android physical-device reverse proxy where applicable

For physical iOS testing, use a LAN-accessible backend URL and native iOS device install/signing workflow. Do not assume `localhost` reaches the developer machine from the device.

For physical Android testing, prefer `pnpm adb` reverse proxy when connected by USB. LAN-accessible backend URLs must also be supported for cases where reverse proxy is unavailable.

**Build Process Structure:**

This is not an EAS-managed submission workflow.

The project keeps Expo and native project support, but build artifacts are controlled locally/native-side and uploaded manually by the owner.

Implementation agents may maintain scripts that help produce local iOS/Android builds, but they must not assume cloud EAS submission, automated store upload, or EAS-managed release ownership.

**Deployment Structure:**

Release readiness depends on:

- native iOS and Android project configuration
- signing/provisioning handled by the owner
- final icons and splash assets
- production API URL config
- legal links
- privacy manifests
- app links/deep links
- manually produced and uploaded release artifacts

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**

The architecture is coherent after applying the manual build/upload constraint.

The selected foundation remains valid: Ignite/Expo with native `ios/` and `android/` folders, Expo Router, TypeScript, apisauce, MMKV, i18n, Jest/RNTL, Maestro, and local/native build workflows.

The only wording conflict found was earlier generic mention of EAS/local build scripts. Final architecture interpretation: EAS may exist as helper configuration from the starter, but the product release model is local/native build artifacts uploaded manually by the owner. Implementation agents must not assume EAS-managed submission.

**Pattern Consistency:**

Implementation patterns support the decisions:

- API boundaries prevent apisauce leakage into screens.
- Session boundaries prevent token access from spreading through the app.
- Feature organization supports thin Expo Router files.
- German-first i18n rules align with UX and PRD requirements.
- Status mapping rules support RFQ, quote response, account, and email-dispatch states.

**Structure Alignment:**

The project structure supports the intended architecture:

- `src/app` owns routing.
- `src/features` owns product behavior.
- `src/services` owns API/session/query/preference integration.
- `src/domain` owns shared domain/status/schema logic.
- `src/components` remains the Ignite/base primitive layer.
- `ios/` and `android/` are explicit native project boundaries for simulator, physical-device, local build, signing, and manual upload workflows.

### Requirements Coverage Validation ✅

**Feature Coverage:**

All major MVP areas have architectural support:

- Auth/session lifecycle
- Role-aware app shell
- Funeral-home signup
- Supplier discovery
- RFQ creation and review
- Request history and timeline
- Supplier inbox and quote response
- Account status states
- German/English localization
- Manual local/native build workflow
- Simulator and physical-device testing

**Functional Requirements Coverage:**

The architecture supports all PRD functional categories through route groups, feature modules, API modules, domain mappers, and shared components.

**Non-Functional Requirements Coverage:**

Covered NFRs include:

- German-first and English-secondary localization
- No hard-coded visible strings
- WCAG AA-equivalent mobile accessibility expectations
- 48dp touch targets
- Secure session boundary around token storage
- Refresh-on-401 behavior
- No ecommerce/checkout/chat/payment flows in MVP
- Physical-device backend URL requirements
- Manual build/upload ownership
- Testing across iOS Simulator, Android Emulator, physical iPhone, and physical Android

### Implementation Readiness Validation ✅

**Decision Completeness:**

Critical technology decisions are documented:

- Existing Ignite/Expo foundation
- Expo Router route groups
- REST API via apisauce
- Handwritten DTOs for MVP
- MMKV-backed session boundary
- TanStack Query for server state
- Zod for validation
- React Hook Form for guided forms
- Manual/native release workflow

**Structure Completeness:**

The project tree is specific enough for implementation agents to place routes, features, services, domain logic, tests, assets, and native changes consistently.

**Pattern Completeness:**

The architecture defines naming, structure, API result formats, state ownership, status mapping, error handling, loading states, testing, and enforcement rules.

### Gap Analysis Results

**Critical Gaps:**

None remaining.

**Important Gaps:**

- Backend contracts still need confirmation during implementation: signup endpoint namespace, supplier search parameter naming, quote lifecycle states, attachment contract, and PDF/timeline availability.
- The architecture documents where physical-device API URL support belongs, but the exact config variable names should be finalized in the first implementation story.
- Earlier EAS wording has been normalized so there is no ambiguity about manual release ownership.

**Nice-to-Have Gaps:**

- Add dependency-cruiser rules after the new feature/service/domain folders exist.
- Add a short local device testing guide after API URL configuration is implemented.
- Add an OpenAPI/generated-client revisit point after backend contracts stabilize.

### Validation Issues Addressed

The user clarified that the app is not EAS-managed for submission. The architecture was updated to require local/native build artifacts, manual owner upload, and testability on iOS Simulator, Android Emulator, physical iPhone, and physical Android.

The final architecture treats any EAS config/scripts as starter leftovers or optional helper scripts, not as the release workflow.

### Architecture Completeness Checklist

**Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**

- Builds on the actual repo instead of inventing a new foundation.
- Separates routing, features, services, domain logic, and base UI clearly.
- Explicitly preserves German-first multilingual requirements.
- Defines strong API/session/status boundaries before feature work begins.
- Accounts for physical-device testing and manual build/upload ownership.
- Avoids ecommerce/payment/chat patterns that conflict with the product model.

**Areas for Future Enhancement:**

- Generated API client after backend OpenAPI matches implementation.
- Attachment upload design after backend contract is confirmed.
- Persisted query/offline cache after DTOs stabilize.
- Push notifications after email-backed RFQ flows are working.
- Release/error tracking tooling after GDPR/DPA review.

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions exactly as documented.
- Use implementation patterns consistently across all components.
- Respect project structure and native project boundaries.
- Do not assume EAS-managed submission.
- Ensure simulator and physical-device testing remain supported.
- Refer to this document for all architectural questions.

**First Implementation Priority:**

Align the existing starter: remove the welcome flow, establish route groups, update theme and German-first i18n defaults, replace sample API code, and create the session/API boundaries.
