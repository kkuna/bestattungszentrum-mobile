# Bestattungszentrum Mobile App PRD

| | |
|---|---|
| Status | Draft for product and engineering review |
| Version | 0.1 |
| Date | 21 May 2026 |
| App repo | `Bestattungszentrum` |
| Backend repo | `bestattungszentrum-app` |

## 1. Summary

Bestattungszentrum Mobile is a role-aware Expo app for Germany-based funeral homes and suppliers. Funeral homes use it to register, discover verified suppliers, and send structured quote requests. Suppliers use it to receive requests, submit quote responses, and maintain the operational parts of their profile/catalog once an admin-created account exists.

The mobile product must stay faithful to the core platform model: it is a trust-first B2B RFQ marketplace, not ecommerce. There are no in-app payments, escrow, consumer-family flows, supplier self-registration, or real-time chat in v1.

## 2. Product Goals

- Let funeral homes self-register and understand their verification/approval status.
- Make supplier discovery fast on mobile with category, region, language, certification, and text filters.
- Let funeral homes send category-specific RFQs with enough structure for suppliers to answer without clarification.
- Let suppliers review incoming RFQs and send quote responses with price, validity, lead time, message, and attachments.
- Keep substantive communication email-backed while preserving request/response records in the app.
- Build on the existing Ignite/Expo template instead of replacing it: Expo Router, Ignite components, theme tokens, i18n, apisauce, MMKV, Reactotron, Jest, Maestro, and dependency-cruiser should remain first-class.

## 3. Target Users

### Funeral Home Staff

- Owners, operations managers, and staff at German funeral homes.
- Context: mobile-first procurement while coordinating urgent services, often under time pressure.
- Primary job: find a trusted supplier and send a complete request quickly.

### Supplier Staff

- Sales or operations staff at supplier companies created by platform admins.
- Context: reviewing requests and responding with availability/pricing.
- Primary job: turn a structured RFQ into a clear quote response.

### Platform Admins

- Admins primarily use the Next.js back office, not this app.
- Mobile admin features are not in v1 except where an internal tester uses seeded credentials.

## 4. Non-Goals

- No supplier self-registration.
- No in-app payments, checkout, escrow, marketplace fee collection, or Stripe/PSP flow.
- No public consumer/family-facing experience.
- No real-time chat or hosted conversation threads.
- No full back-office replacement on mobile.
- No support for countries outside Germany in v1.
- No hard-coded quote forms per category; dynamic schemas must drive category-specific fields.

## 5. Current Technical Baseline

The Ignite app currently has:

- Expo SDK 55, React Native 0.83, React 19, Expo Router, dev client, Hermes, new architecture.
- Root layout at `src/app/_layout.tsx` with splash, font loading, i18n initialization, `ThemeProvider`, `SafeAreaProvider`, and `KeyboardProvider`.
- A single route at `src/app/index.tsx` rendering the boilerplate `WelcomeScreen`.
- Ignite components: `Screen`, `Text`, `Button`, `TextField`, `Card`, `ListItem`, `Header`, `Icon`, `EmptyState`, `AutoImage`, checkbox/radio/switch toggles, and `ErrorBoundary`.
- Theme files under `src/theme`, currently using Ignite warm-orange defaults and Space Grotesk.
- API scaffold under `src/services/api`, currently pointed at the RSS2JSON sample API.
- MMKV storage helpers under `src/utils/storage`.
- i18next setup under `src/i18n`, currently boilerplate and English-first.
- Jest/React Native Testing Library setup, Reactotron dev tooling, Maestro script hooks, and dependency-cruiser scripts.

## 6. Backend Contract Baseline

The Next.js backend currently provides these mobile-relevant endpoints:

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

The backend also has `POST /api/mobile/marketplace-checkout`. The mobile MVP should not expose this as checkout. If it is used later, it must be presented as a request basket or bulk RFQ workflow, not purchase/order/payment.

## 7. Auth Position

Auth is directionally in place but should not be treated as fully settled until tests and local login flows are green.

Current backend reality:

- Mobile auth uses opaque access tokens plus rotating refresh tokens.
- Access tokens expire quickly; refresh tokens last longer and rotate.
- The app must not decode JWT claims because the backend is not currently JWT-based.
- Token storage should use MMKV initially, wrapped behind an auth/session service.

Known backend follow-up:

- A pulled auth change made session tokens include a session id prefix for faster lookup.
- The existing Prisma command test still expects a 64-character token and fails.
- There may be a Prisma-cache risk where login creates a session directly in the database, then redirect/session resolution reads a stale cached repository snapshot.

Mobile implementation should therefore define clean auth boundaries, but final sign-in acceptance should depend on backend test fixes and a real local login walkthrough.

## 8. MVP Scope

### Phase M1: App Shell and Session Foundation

- Replace boilerplate welcome route with a role-aware app shell.
- Add backend environment config:
  - iOS simulator: `http://localhost:3000`
  - Android emulator: `http://10.0.2.2:3000`
  - Physical Android dev: use existing `pnpm adb` reverse path.
- Add auth API methods and DTOs.
- Store access token, refresh token, expiry, user id, role, tenant id, and language preference.
- Add refresh-on-401 behavior with logout fallback.
- Add route groups:
  - `src/app/(auth)`
  - `src/app/(funeral-home)`
  - `src/app/(supplier)`
  - `src/app/(shared)`
- Add role gate after app boot.

### Phase M2: Funeral Home Discovery and RFQ Slice

- Funeral-home home screen with recent requests and featured categories.
- Discover screen:
  - Search input.
  - Category filter chips/tree.
  - Region filter.
  - Language/certification filters when backend supports them.
  - Supplier cards with logo, name, categories, regions, short description, and CTA.
- Supplier detail screen:
  - Supplier metadata, category badges, contact transparency, and request CTA.
- Quote request flow:
  - Universal fields: subject, message, deadline, attachments placeholder, quantity when applicable.
  - Category-specific fields rendered from `quoteFormSchema`.
  - Review screen before submit.
  - Send result screen explaining that the supplier is notified by email.
- Requests screen:
  - Outgoing requests, statuses, timeline, response summary, and PDF link.

### Phase M3: Supplier Inbox and Response Slice

- Supplier home screen with open request count and profile completeness.
- Incoming requests screen:
  - Request list grouped by status/deadline.
  - Request detail with funeral home contact, attributes, attachments placeholder, and timeline.
- Quote response form:
  - Price amount or range.
  - Validity date.
  - Lead time days.
  - Message.
  - Attachments placeholder.
  - Submit response and show email-dispatch confirmation.
- Supplier catalog placeholder:
  - Read current items where available.
  - Defer item editing unless backend permissions and UX are confirmed.

### Phase M4: Funeral Home Signup

- Public signup flow using `POST /api/public/funeral-home-signups`, unless backend adds a mobile-namespaced equivalent.
- Steps:
  - Account credentials.
  - Company/legal details.
  - Handelsregister/VAT details.
  - Address/contact/billing email.
  - Review and submit.
- Result states:
  - Pending approval.
  - Pending review.
  - Verification failed/correct input.
  - Verification unavailable/manual review.
- German sole-proprietor path should be designed but may depend on backend document upload support.

## 9. Information Architecture

### Unauthenticated

- Welcome/login
- Funeral-home signup
- Forgot password placeholder
- Legal links: Impressum, Datenschutz, AGB placeholder

### Funeral Home Tabs

- Home
- Discover
- Quotes
- Profile
- Settings

### Supplier Tabs

- Home
- Requests
- Catalog
- Profile
- Settings

### Shared Screens

- Notifications/preferences placeholder
- Language switcher
- Session/security
- Error and empty states
- Offline/retry state

## 10. Ignite Implementation Strategy

### Keep and Extend

- Use Expo Router for route grouping and deep-linkable detail screens.
- Use Ignite `Screen` for safe-area-aware page structure.
- Use Ignite `Text`, `Button`, `TextField`, `Card`, `ListItem`, `Icon`, `EmptyState`, and toggles for the first implementation pass.
- Keep `ThemeProvider`, but replace palette/semantic tokens with Bestattungszentrum values.
- Keep MMKV helpers, but wrap them in a typed `sessionStorage` module.
- Keep apisauce, but replace sample feed code with typed domain API clients.
- Keep Reactotron in development and add auth/API debug events where safe.
- Keep Jest and React Native Testing Library as the default unit/component test stack.
- Keep Maestro for critical-path smoke flows once screens exist.

### Add Carefully

- Consider TanStack Query for server-state caching after the first vertical slice, especially for categories, suppliers, requests, and inboxes.
- Add a small local session/preferences store only if prop/context passing becomes noisy.
- Add document/image picker support only when backend upload contract supports quote attachments.

### Avoid

- Replacing Ignite components before they prove insufficient.
- Introducing a second design system.
- Hard-coding category-specific form screens.
- Treating `marketplace-checkout` as mobile ecommerce.
- Building admin workflows in the mobile app before the role products work.

## 11. Design Direction

The mobile UI should feel operational, trustworthy, and calm. It should borrow the Otto-like mobile structure described in the SDD: strong red accents, white surfaces, large touch targets, generous spacing, clear typography, and card/list layouts optimized for scanning.

Recommended tokens:

- Primary red: `#B8312F`. This should become the app's canonical brand red across mobile UI, splash/app assets, and any web surface that needs to align visually with mobile.
- Primary strong/accent: `#C8102E`.
- Background: warm off-white, near `#F7F7F7` or `#F6F3F1`.
- Surface: white or lightly warm white.
- Text: near black, not pure black.
- Muted text: neutral gray.
- Success, warning, danger: visually distinct from brand red.

Typography:

- Use Cormorant Garamond for brand/display moments: splash, empty states with brand presence, major screen titles where space allows, and selected marketing/onboarding headings.
- Use a highly legible sans-serif for product UI, dense lists, form labels, buttons, tabs, helper text, and long German copy. Inter is the preferred default if its German glyph coverage is verified in the app build; Noto Sans is the fallback if we want broader language coverage with less risk.
- Replace the current Ignite Space Grotesk default during theme work rather than mixing all three families.
- German text length must be tested in buttons, tabs, cards, and empty states.

Tone:

- German-first, direct, restrained.
- No playful illustrations, exclamation-heavy copy, celebratory animations, or consumer-shopping language.
- Prefer "Anfrage senden" / "Angebot anfragen" over checkout/order language.

## 12. Core Data Types Needed In Mobile

Minimum DTOs:

- `MobileAuthTokens`
- `CurrentUser`
- `Category`
- `Supplier`
- `SupplierItem`
- `QuoteRequest`
- `QuoteResponse`
- `RequestTimelineEvent`
- `FuneralHomeSignupInput`
- `CreateQuoteRequestInput`
- `CreateQuoteResponseInput`
- `ApiError`

The mobile app should not import backend source directly across repos. Use one of:

1. Generated client from backend OpenAPI after it is aligned with implementation.
2. A shared package later.
3. Hand-written DTOs in mobile for MVP, with tests against real API fixtures.

## 13. Key User Stories

### Funeral Home

- As a funeral-home user, I can sign in and land in the correct role experience.
- As a funeral-home user, I can browse active suppliers by category and region.
- As a funeral-home user, I can search suppliers by name, description, and category.
- As a funeral-home user, I can create a category-specific RFQ.
- As a funeral-home user, I can see the status and timeline of sent requests.
- As a funeral-home user, I can read supplier responses and open related documents.
- As a suspended funeral-home user, I can read history but cannot send new quote requests.

### Supplier

- As a supplier user, I can sign in and land in the supplier experience.
- As a supplier user, I can see incoming RFQs.
- As a supplier user, I can inspect structured request details.
- As a supplier user, I can submit a quote response.
- As a supplier user, I can see which responses have already been sent.

### Signup

- As a funeral-home applicant, I can submit company and account details.
- As an applicant, I can understand whether the application is pending approval or manual review.
- As an applicant, I can recover from validation errors without losing form progress.

## 14. States and Edge Cases

- First app launch.
- Logged out.
- Token refresh in progress.
- Token refresh failed.
- Wrong role for attempted route.
- Empty supplier directory.
- No matching suppliers after filters.
- No requests yet.
- Supplier has no incoming requests.
- Pending approval account.
- Pending review account.
- Suspended account.
- Backend offline.
- Slow network.
- Validation errors from Zod/API.
- Email dispatch queued vs failed.
- Supplier deactivated while request exists.
- Quote request expired.
- Quote response already sent.
- Dynamic schema unsupported field type.
- German long labels overflowing on small screens.

## 15. Acceptance Criteria

### Product

- Funeral-home and supplier users see different tabs and screens after login.
- Funeral-home users can complete the local vertical slice: login, view categories, view suppliers, submit an RFQ, and see it in request history.
- Supplier users can complete the corresponding slice: login, view incoming RFQ, submit response.
- The app never presents payment, checkout, or purchase language in MVP.
- German copy is available for visible MVP UI.

### Technical

- `pnpm compile` passes.
- `pnpm lint:check` passes or documented lint debt is accepted.
- `pnpm test` passes.
- API service code has tests for auth storage, refresh behavior, problem mapping, and core endpoint DTO mapping.
- Screen tests cover role gate, empty states, validation states, and happy-path submit for RFQ/response forms.
- Maestro smoke flows exist for login as funeral home, login as supplier, and at least one RFQ happy path once a simulator/dev client flow is ready.

### Design

- Touch targets are at least 48dp.
- Text does not overflow in German on small screens.
- Empty/loading/error states are explicit and useful.
- Layouts work on small phones and large phones.
- Brand red is used for primary actions and active navigation, not as a noisy background everywhere.

## 16. Backend Dependencies

Must settle before or during mobile MVP:

- Fix backend auth tests and verify Prisma-mode login with the repository cache.
- Decide whether mobile signup calls `/api/public/funeral-home-signups` or a new `/api/mobile/...` endpoint.
- Align OpenAPI supplier search param `query` vs implementation `q`.
- Add or confirm current-user tenant profile endpoint.
- Decide quote state model: SDD terminal `RESPONDED` vs backend `ACCEPTED`/`REJECTED`.
- Validate RFQ `attributes` against category `quoteFormSchema`, or explicitly defer with tests.
- Confirm attachment upload contract for quote request/response documents.
- Decide whether `marketplace-checkout` is removed, hidden, or renamed as request basket/bulk RFQ.

## 17. Rollout Plan

1. Documentation and contract freeze.
2. Mobile app shell, theme, German i18n baseline, API config.
3. Auth/session foundation.
4. Funeral-home discovery and RFQ slice.
5. Supplier inbox and response slice.
6. Signup flow.
7. Polish pass: empty/error states, accessibility, responsive QA, Maestro smoke tests.
8. Native release readiness: icons/splash, signing, privacy manifests, app links, production env config.

## 18. Open Questions

- Confirm the exact font packages and weights to ship through Expo: Cormorant Garamond for display plus Inter or Noto Sans for UI.
- Should supplier catalog editing exist in mobile v1, or stay backoffice/web-only?
- Should quote response `ACCEPTED`/`REJECTED` be user-facing in mobile v1?
- What is the attachment strategy for PDFs/images in RFQs and responses?
- How should sole proprietors without Handelsregister entries complete signup?
- What minimum profile data should `/api/mobile/auth/me` return versus a dedicated tenant profile endpoint?
- Is request basket/bulk RFQ part of MVP, or should the app only support one supplier RFQ at a time?
