# Story 1.1: Starter Alignment and Route Group Shell

Status: done

<!-- Completion note: Ultimate context engine analysis completed - comprehensive developer guide created. -->

## Story

As a mobile user,
I want the app to open into a Bestattungszentrum-specific route shell,
so that I no longer see boilerplate screens and the app has clear role-aware navigation paths.

## Acceptance Criteria

1. Given the existing Ignite/Expo app is installed, when the app starts without an authenticated session, then the boilerplate welcome route is no longer shown and the user is routed to the unauthenticated entry experience.
2. Given the unauthenticated entry experience renders, when login, funeral-home signup, forgot-password, and legal-link entry points are reviewed, then a localized forgot-password placeholder is present and clearly marked as unavailable or pending implementation if password recovery is not yet supported by the backend.
3. Given the app source is inspected, when the route structure is reviewed, then Expo Router groups exist for `(auth)`, `(funeral-home)`, `(supplier)`, and `(shared)`, and route files remain thin wrappers around feature screens or placeholders.
4. Given a developer opens each route group, when unauthenticated, funeral-home, supplier, and shared placeholder routes render, then each route uses existing Ignite primitives and project theme/i18n hooks where available, and no business logic is embedded directly in route files.
5. Given the mobile MVP excludes ecommerce and chat, when shell labels, placeholders, and navigation affordances are reviewed, then no checkout, cart, order, purchase, payment, escrow, consumer-family, real-time chat, supplier self-registration, or admin back-office language is present.
6. Given quality checks are run, when `pnpm compile` and the relevant route/shell tests run, then they pass or any existing unrelated debt is documented separately.

## Tasks / Subtasks

- [x] Replace the starter root route behavior. (AC: 1)
  - [x] Stop rendering `WelcomeScreen` from `src/app/index.tsx`.
  - [x] Route unauthenticated startup to the new auth entry experience without briefly showing a protected or boilerplate screen.
  - [x] Leave `src/app/_layout.tsx` responsible for global providers, splash handling, font loading, i18n initialization, `ThemeProvider`, safe area, and keyboard provider.
- [x] Add Expo Router group skeletons. (AC: 3, 4)
  - [x] Create `src/app/(auth)`, `src/app/(funeral-home)`, `src/app/(supplier)`, and `src/app/(shared)` route groups.
  - [x] Add minimal `_layout.tsx` files where needed to define the group relationship with `Stack` or `Slot`.
  - [x] Keep every route file thin: import and render a feature screen or placeholder component only.
- [x] Add unauthenticated entry and required placeholders. (AC: 2, 5)
  - [x] Provide login, funeral-home signup, forgot-password placeholder, and legal-link entry points.
  - [x] Mark forgot password as pending/unavailable if no backend endpoint is confirmed in this story.
  - [x] Use professional RFQ/workspace language only; do not introduce shopping, checkout, payment, chat, consumer-family, supplier self-registration, or admin language.
- [x] Add feature placeholder screens outside `src/app`. (AC: 3, 4)
  - [x] Put screen components under `src/features/auth`, `src/features/funeral-home`, `src/features/supplier`, and `src/features/shared` as appropriate.
  - [x] Use existing Ignite primitives such as `Screen`, `Text`, `Button`, `Header`, `Card`, `ListItem`, and `EmptyState` before creating new primitives.
  - [x] Keep placeholder content calm, role-specific, and explicit about pending future implementation.
- [x] Add the minimum localization keys needed by the shell. (AC: 2, 4, 5)
  - [x] Do not hard-code visible route, button, placeholder, legal, or accessibility text in route files or reusable components.
  - [x] Add German and English keys for the new shell/placeholder copy if German resources do not already exist.
  - [x] Keep the complete German-first theme/i18n baseline for Story 1.2, but do not block this story on full typography or token work.
- [x] Add focused tests for the shell. (AC: 1, 2, 3, 6)
  - [x] Cover that `WelcomeScreen` is no longer the app's startup route.
  - [x] Cover the unauthenticated entry screen and forgot-password pending state.
  - [x] Cover at least one route file or exported route component to confirm route files stay thin wrappers.
  - [x] Run `pnpm compile` and the relevant Jest tests; run `pnpm lint:check` if touched files are broad enough to risk lint regressions.

### Review Findings

- [x] [Review][Patch] iOS startup redbox remains unresolved while story is in review [_bmad-output/implementation-artifacts/1-1-starter-alignment-and-route-group-shell.md:163] — accepted as non-blocking while runtime validation proceeds on Android for now.
- [x] [Review][Patch] Auth entry route is outside the `(auth)` route group [src/app/(auth)/index.tsx:1]
- [x] [Review][Patch] Fixed placeholder screens can clip content on small screens or large text settings [src/features/auth/AuthEntryScreen.tsx:18]
- [x] [Review][Patch] Disabled placeholder actions have no disabled visual styling [src/features/shared/PlaceholderScreen.tsx:50]
- [x] [Review][Patch] Shell tests do not verify real route pushes or initialized i18n copy [src/features/auth/AuthShell.test.tsx:31]

## Dev Notes

### Current Source State

- `src/app/index.tsx` currently imports and returns `WelcomeScreen`, so it is the primary UPDATE file for AC1.
- `src/screens/WelcomeScreen.tsx` is still Ignite boilerplate with sample logo/face imagery and `welcomeScreen:*` translation keys. This story should stop routing to it; deletion is optional only if imports/tests prove it is unused and no dependency-cruiser rule requires keeping `src/screens`.
- `src/app/_layout.tsx` already initializes i18n, loads fonts, hides the splash screen, wraps `SafeAreaProvider`, `ThemeProvider`, and `KeyboardProvider`, and renders `<Slot />`. Preserve that provider behavior unless a route-shell change truly requires adjustment.
- `src/i18n/index.ts` currently supports starter locales and falls back to `en-US`; `src/i18n/en.ts` still contains Ignite welcome/error/empty-state copy. New visible shell copy must use `tx` keys through `Text`, `Button`, or `translate`.
- `src/features` does not exist yet. Create feature folders for real screens/placeholders rather than putting product UI logic inside `src/app`.

### Architecture Guardrails

- Keep the existing Ignite 11.5 / Expo SDK 55 foundation. Do not scaffold a new app or replace Expo Router.
- Use route groups for `(auth)`, `(funeral-home)`, `(supplier)`, and `(shared)` under `src/app`.
- `src/app` is routing only. Non-navigation components, hooks, and placeholder screens belong outside `src/app`; otherwise Expo Router treats files as routes.
- Business logic for login, session, role gates, API calls, and account-status decisions is out of scope for this story. Add navigable placeholders and clear boundaries, not fake auth.
- Token/session storage, normalized API DTOs, refresh-on-401, role gates, and role-specific tabs are later Story 1.3 through Story 1.7 work. Do not pre-implement them here beyond route skeletons that can host them.
- Do not edit `ios/` or `android/` for this story.

### UX Guardrails

- Use Quiet OTTO Native as the shell/discovery direction: light gray canvas, white modules, restrained red action/active states, stable mobile navigation, and no retail pressure.
- Use Guided Anfrage only as a future form pattern reference; this story should not build the full signup or RFQ flow.
- Use Warm Institutional tone for pending/unavailable/account/legal placeholders.
- All touchable controls should keep at least 48dp touch targets. Existing `Button` min height is 56, so prefer it for primary/secondary placeholder actions.
- German copy is the layout stress case. Keep labels short and professional, and avoid app-store style excitement or celebration.

### Latest Technical Context

- Expo Router documentation updated May 05, 2026 states that routes are files under `src/app`, `index.tsx` is the first route, and the root `_layout.tsx` is where global providers and initialization belong. Source: https://docs.expo.dev/router/basics/core-concepts/
- Expo Router notation docs updated February 26, 2026 state that directories wrapped in parentheses are route groups and do not affect the URL, and `_layout.tsx` defines how routes inside a directory relate to each other. Source: https://docs.expo.dev/router/basics/notation/
- Expo Router Native Tabs are beta in SDK 55. Do not introduce `expo-router/unstable-native-tabs` in this starter-alignment story; role-specific tab implementation belongs in Story 1.7 after route groups and role gating are clearer. Source: https://docs.expo.dev/versions/latest/sdk/router/native-tabs/

### File Structure Requirements

Expected shape after this story, adjusted only where implementation discovers a better local fit:

```text
src/app/
  _layout.tsx
  index.tsx
  (auth)/
    _layout.tsx
    index.tsx
    login.tsx
    signup.tsx
    forgot-password.tsx
  (funeral-home)/
    _layout.tsx
    index.tsx
  (supplier)/
    _layout.tsx
    index.tsx
  (shared)/
    _layout.tsx
    legal/
      impressum.tsx
      privacy.tsx
      terms.tsx
src/features/
  auth/
  funeral-home/
  supplier/
  shared/
```

Route filenames may vary if Expo Router conventions require a cleaner path, but the four route groups must exist and route files must stay thin.

### Testing Requirements

- Required gate: `pnpm compile`.
- Add or update focused Jest/RNTL tests for the unauthenticated shell and forgot-password placeholder.
- Run the relevant test subset first; run `pnpm test` if the changes affect shared test setup, i18n initialization, or base components.
- If an existing unrelated issue prevents a full gate from passing, document the failing command and exact failure in the Dev Agent Record.

### Previous Story Intelligence

- No previous story exists in `_bmad-output/implementation-artifacts`; this is the first story in Epic 1.

### Git Intelligence Summary

- Recent history is documentation/starter only:
  - `a71f9f2 docs: refine mobile brand direction`
  - `6800528 docs: add mobile app PRD`
  - `386d806 New Ignite 11.5.0 app`
- There are no prior implementation patterns beyond the Ignite starter. Prefer starter primitives and architecture documents over inventing a parallel structure.

### Project Structure Notes

- Current app structure is still starter-minimal: `src/features` and route groups are absent.
- Existing source paths use the `@/*` alias from `tsconfig.json`; use that alias consistently in new route and feature files.
- `src/components` is for Ignite/base primitives only. Do not place domain placeholder screens there.

### References

- Story requirements: `_bmad-output/planning-artifacts/epics.md` - `Story 1.1: Starter Alignment and Route Group Shell`.
- Product scope and non-goals: `_bmad-output/planning-artifacts/prd.md` - `4.1 Role-Aware App Shell and Session Foundation`; `_bmad-output/planning-artifacts/epics.md` - FR36.
- Architecture decisions: `_bmad-output/planning-artifacts/architecture.md` - `Selected Starter`, `Core Architectural Decisions`, `Frontend Architecture`, `Project Structure & Boundaries`.
- UX direction: `_bmad-output/planning-artifacts/ux-design-specification.md` - `Implementation Guidance`, `Design System Foundation`, `Interaction Patterns`.
- Current source verification: `src/app/index.tsx`, `src/app/_layout.tsx`, `src/i18n/index.ts`, `src/i18n/en.ts`, `src/screens/WelcomeScreen.tsx`, `src/components/Button.tsx`.
- Repowise context checked for `src/app/index.tsx`, `src/app/_layout.tsx`, `src/i18n/index.ts`, and `src/theme/context.tsx`; `src/theme/context.tsx` is a hotspot, so avoid touching it unless necessary.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-05-23T21:18:28+0200: Story started; sprint status moved to in-progress.
- 2026-05-23T21:25:26+0200: Red test confirmed missing auth shell route modules before implementation.
- 2026-05-23T21:25:26+0200: Validation passed: `pnpm compile`, `pnpm test --runInBand`, `pnpm lint:check`.
- 2026-05-23T21:43:22+0200: Argent iOS smoke test on iPhone 16 Pro (`23B8DC84-2DDC-418D-926C-3924F35FF4A0`) built and installed through `pnpm exec expo run:ios --device 23B8DC84-2DDC-418D-926C-3924F35FF4A0`, then failed at runtime with redbox: `Failed to call into JavaScript module method RCTEventEmitter.receiveEvent(). Module has not been registered as callable`.
- 2026-05-23T21:43:22+0200: Attempted runtime mitigations: changed static shell screens from `Screen` scroll preset to fixed preset, removed duplicate grouped `/` index routes, restarted Metro with `pnpm exec expo start --dev-client --clear`, and relaunched the app. Runtime redbox persisted; app body remained blank after minimizing redbox.
- 2026-05-23T21:43:22+0200: Post-mitigation validation passed: `pnpm compile`, `pnpm test --runInBand`, `pnpm lint:check`.
- 2026-05-23T22:50:10+0200: Argent Android smoke test on Pixel_9_Pro (`emulator-5554`) built and installed through `pnpm exec expo run:android`, bundled successfully through Metro, and rendered the new shell. Verified workspace access, sign in, funeral-home signup, forgot-password, and legal information placeholder routes.
- 2026-05-23T22:50:10+0200: Story moved to review. Android runtime verification passed; iOS remains documented as a native/runtime startup blocker outside the Story 1.1 route-shell acceptance path.
- 2026-05-23T23:03:56+0200: Code review fixes applied for route grouping, scroll fallback, disabled placeholder actions, and shell test coverage. Validation passed: `pnpm compile`, `pnpm test --runInBand src/features/auth/AuthShell.test.tsx`, `pnpm test --runInBand`, `pnpm lint:check`.
- 2026-05-23T23:03:56+0200: iOS verification on iPhone 16 Pro (`23B8DC84-2DDC-418D-926C-3924F35FF4A0`) still redboxes after rebuild/relaunch with `Failed to call into JavaScript module method RCTEventEmitter.receiveEvent(). Module has not been registered as callable`; story returned to in-progress.
- 2026-05-23T23:27:45+0200: Product decision accepted Android as the current runtime verification target; iOS dev-client redbox remains documented as a follow-up and Story 1.1 moved to done.

### Completion Notes List

- Replaced startup route rendering with `AuthEntryScreen`; `src/app/_layout.tsx` provider responsibilities were preserved unchanged.
- Moved unauthenticated startup into `src/app/(auth)/index.tsx` so the auth entry belongs to the auth route group.
- Added `(auth)`, `(funeral-home)`, `(supplier)`, and `(shared)` Expo Router groups with thin route wrappers.
- Changed shell placeholder screens to use automatic scroll fallback for small screens and large text settings.
- Added disabled visual styling for unavailable placeholder actions.
- Added localized auth, role workspace, and legal placeholder screens under `src/features`.
- Added English and German shell copy; non-target starter locales reuse English shell keys to satisfy the existing `Translations` contract.
- Added focused RNTL coverage for startup route behavior, auth entry navigation targets, localized shell resources, forgot-password pending state, and a thin auth route wrapper.
- Android runtime verification passed through Argent on Pixel_9_Pro.
- Runtime blocker remains in iOS dev-client: Xcode build/install succeeds, but React Native redboxes before the shell can render.

### File List

- `_bmad-output/implementation-artifacts/1-1-starter-alignment-and-route-group-shell.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `expo-env.d.ts`
- `src/app/(auth)/_layout.tsx`
- `src/app/(auth)/index.tsx`
- `src/app/(auth)/login.tsx`
- `src/app/(auth)/signup.tsx`
- `src/app/(auth)/forgot-password.tsx`
- `src/app/(funeral-home)/_layout.tsx`
- `src/app/(funeral-home)/funeral-home.tsx`
- `src/app/(supplier)/_layout.tsx`
- `src/app/(supplier)/supplier.tsx`
- `src/app/(shared)/_layout.tsx`
- `src/app/(shared)/legal/impressum.tsx`
- `src/app/(shared)/legal/privacy.tsx`
- `src/app/(shared)/legal/terms.tsx`
- `src/features/auth/AuthEntryScreen.tsx`
- `src/features/auth/AuthShell.test.tsx`
- `src/features/auth/ForgotPasswordScreen.tsx`
- `src/features/auth/FuneralHomeSignupScreen.tsx`
- `src/features/auth/LoginScreen.tsx`
- `src/features/funeral-home/FuneralHomeHomeScreen.tsx`
- `src/features/supplier/SupplierHomeScreen.tsx`
- `src/features/shared/LegalScreen.tsx`
- `src/features/shared/PlaceholderScreen.tsx`
- `src/i18n/ar.ts`
- `src/i18n/de.ts`
- `src/i18n/en.ts`
- `src/i18n/es.ts`
- `src/i18n/fr.ts`
- `src/i18n/hi.ts`
- `src/i18n/index.ts`
- `src/i18n/ja.ts`
- `src/i18n/ko.ts`

### Change Log

- 2026-05-23: Implemented starter route replacement, route group shell, localized placeholders, and shell tests.
- 2026-05-23: Ran Argent iOS smoke test; build/install passed, runtime redbox blocks acceptance verification, story returned to in-progress.
- 2026-05-25: iOS dev-client redbox (`RCTEventEmitter ... not registered as callable`) RESOLVED via clean pod reinstall + fresh build on the current toolchain. iOS app now renders and cold-launches without redbox (iPhone 16 Pro / iOS 18.3). Root cause was a stale/incompatible native build, not app JS. See `investigations/ios-redbox-resolution.md`.
