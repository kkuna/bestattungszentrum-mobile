# Story 1.2: German-First Theme and i18n Baseline

Status: done

<!-- Completion note: Ultimate context engine analysis completed - comprehensive developer guide created. -->

## Story

As a mobile user,
I want the app interface to use Bestattungszentrum branding and German-first localized copy,
so that the product feels trustworthy, readable, and ready for German funeral-home and supplier workflows.

## Acceptance Criteria

1. Given the app theme is loaded, when core shell, auth, placeholder, and shared screens render, then they use Bestattungszentrum color tokens including brand red, pressed red, accent red, warm background, surface, border, text, muted text, success, warning, danger, info, and neutral tones, and brand red is used for primary actions, active navigation, selected states, and brand moments rather than generic error/warning/success states.
2. Given the existing Ignite typography defaults are reviewed, when theme typography is configured, then Space Grotesk is no longer the default product UI font, and the theme is prepared for Cormorant Garamond display moments plus Inter or Noto Sans product UI text, subject to app-build glyph verification.
3. Given visible UI copy appears in route shells, placeholders, tabs, settings, account state placeholders, and legal-link placeholders, when the source is inspected, then no visible string is hard-coded in screens or reusable components, and all visible labels, status text, helper text, errors, accessibility labels, and navigation labels resolve through i18n keys.
4. Given the app starts for a first-time user, when no saved language preference exists, then German is selected as the default locale, and English remains available as the secondary locale.
5. Given German and English translations exist, when key shell labels and placeholders are rendered in both languages, then the meaning and operational tone are consistent, and the German strings are used as the layout stress case for buttons, tabs, cards, and empty states.
6. Given accessibility and visual checks are performed, when shell components use red-on-white, white-on-red, muted text, and status colors, then contrast-sensitive pairings are explicitly verified or documented as needing correction before release.

## Tasks / Subtasks

- [x] Replace starter color tokens with the Bestattungszentrum semantic palette. (AC: 1, 6)
  - [x] Update `src/theme/colors.ts` and `src/theme/colorsDark.ts` with semantic keys for `primary`, `primaryPressed`, `primaryAccent`, `background`, `surface`, `surfaceWarm`, `ink`, `text`, `textMuted`, `border`, `success`, `warning`, `danger`, `info`, and neutral tones.
  - [x] Preserve existing compatibility keys currently consumed by Ignite primitives (`text`, `textDim`, `background`, `border`, `tint`, `tintInactive`, `separator`, `error`, `errorBackground`, and `palette`) unless all call sites are updated in the same story.
  - [x] Ensure brand red `#B8312F` is not reused as the generic error color; use a separate danger red for destructive or failed states.
  - [x] Update `src/components/Button.tsx` only as needed so primary/reversed button presets use brand action tokens and pressed states without height changes.
- [x] Replace Space Grotesk as the product UI default. (AC: 2)
  - [x] Update `src/theme/typography.ts` so `typography.primary` points to Inter or Noto Sans for dense UI text.
  - [x] Prepare `typography.display` or an equivalent semantic font bucket for Cormorant Garamond brand/display moments without forcing it into dense lists, form labels, tabs, or long German copy.
  - [x] Update `customFontsToLoad` and `src/app/_layout.tsx` imports only as needed to load the selected font packages through the existing `useFonts(customFontsToLoad)` gate.
  - [x] Remove or stop using `@expo-google-fonts/space-grotesk` as the default product font; if the dependency remains temporarily, document why.
- [x] Make German the default runtime locale while keeping English supported. (AC: 3, 4, 5)
  - [x] Update `src/i18n/index.ts` so first launch defaults to `de` when there is no saved language preference.
  - [x] Keep English available as the secondary language and fallback catalog for missing keys.
  - [x] Avoid device-locale selection overriding the German default on first launch; saved user preference may override default after the preferences/session boundary exists.
  - [x] Update `src/utils/formatDate.ts` so the German locale is loaded for `de` and still falls back safely for unsupported tags.
- [x] Normalize translation catalogs for German-first shell coverage. (AC: 3, 5)
  - [x] Treat `src/i18n/de.ts` as the canonical product copy for current shell/auth/shared placeholders.
  - [x] Keep `src/i18n/en.ts` structurally equivalent to `de.ts` so `TxKeyPath` remains complete.
  - [x] Remove or rewrite remaining visible Ignite sample copy in current German and English catalogs where it can still render through retained starter components (`welcomeScreen`, `errorScreen`, `emptyStateComponent`).
  - [x] If non-target starter locales (`ar`, `es`, `fr`, `hi`, `ja`, `ko`) remain imported, keep them type-compatible without expanding product scope beyond German and English.
- [x] Add localization and theme regression tests. (AC: 1, 2, 3, 4, 5, 6)
  - [x] Add focused tests for `initI18n` defaulting to German with no saved preference and keeping English selectable/fallback-safe.
  - [x] Add tests that German and English shell keys exist for auth entry, forgot-password, role placeholders, legal placeholders, and shared empty/error copy used by current screens.
  - [x] Add tests or assertions for theme token availability and critical mappings: brand red, pressed red, background, surface, text, muted text, success, warning, danger, info.
  - [x] Update existing shell tests so they do not only prove untranslated key strings render; at least one test should initialize i18n and assert resolved German and English text.
  - [x] Document contrast verification for brand red on white and white on brand red. Automated contrast assertions are preferred if a local helper is small and focused.
- [x] Run required quality gates. (AC: 1-6)
  - [x] Run `pnpm compile`.
  - [x] Run focused Jest tests for i18n/theme/shell changes, then `pnpm test --runInBand` if shared setup or base components were touched.
  - [x] Run `pnpm lint:check`.
  - [x] Run `pnpm depcruise` if imports or layer boundaries changed.

### Review Findings

- [x] [Review][Patch] German date-fns locale is not actually loaded [src/utils/formatDate.ts:41]
- [x] [Review][Patch] Dark-mode button presets fail text contrast [src/components/Button.tsx:234]
- [x] [Review][Patch] Status color contrast is not fully verified and the light success pair is below AA [src/theme/theme.test.ts:66]
- [x] [Review][Patch] Non-target starter locales remain runtime-supported with starter copy and disabled RTL handling [src/i18n/locale.ts:4]

## Dev Notes

### Current Source State

- `src/i18n/index.ts` currently imports `ar`, `de`, `en`, `es`, `fr`, `hi`, `ja`, and `ko`, computes the active language from `expo-localization`, and falls back to `en-US`. This does not satisfy the story requirement that first launch defaults to German.
- `src/i18n/de.ts` exists from Story 1.1 and contains German auth, role workspace, and legal placeholder copy, but the strings are ASCII transliterations such as `Zurueck`, `fuer`, and `waehrend`. The dev agent should decide whether to keep the repo's current ASCII style or introduce proper German characters consistently across catalogs.
- `src/i18n/en.ts` is still the `Translations` type source. It also still contains Ignite starter welcome, error, and empty-state text. Any retained visible starter copy must be replaced with Bestattungszentrum-appropriate product copy or kept unreachable and tested accordingly.
- `src/utils/formatDate.ts` loads date-fns locales by `i18n.language` primary tag but has no `de` case yet. If German becomes the runtime default, date formatting must not silently use `en-US`.
- `src/theme/typography.ts` still loads `@expo-google-fonts/space-grotesk` and sets `typography.primary` to `fonts.spaceGrotesk`. This is the primary typography UPDATE file.
- `src/app/_layout.tsx` imports `useFonts` from `@expo-google-fonts/space-grotesk`, initializes i18n, then calls `loadDateFnsLocale()`. Preserve the provider order, splash behavior, `SafeAreaProvider`, `ThemeProvider`, `KeyboardProvider`, and font-loading gate while changing font packages/imports.
- `src/theme/colors.ts` and `src/theme/colorsDark.ts` currently expose starter-style semantic keys and a palette, but they do not expose all required Bestattungszentrum tokens (`primaryPressed`, `surfaceWarm`, `success`, `warning`, `danger`, `info`, etc.).
- `src/components/Text.tsx` derives its `Weights` type from `typography.primary`. Font key changes can break `weight="semiBold"` and base text styles if the new font map is not shaped like the current one.
- `src/components/Button.tsx` currently uses neutral palette values for `filled`/`reversed` presets. If primary shell buttons should turn red in this story, update presets through theme tokens rather than one-off hard-coded colors.
- Story 1.1 added route groups and feature placeholders under `src/app/(auth)`, `src/app/(funeral-home)`, `src/app/(supplier)`, `src/app/(shared)`, and `src/features/**`. These screens already use `tx` keys and must keep route files thin.

### What This Story Changes

- It changes theme tokens, typography selection, font loading, i18n default language behavior, date locale loading, and current shell translation catalogs.
- It does not implement the settings language switcher UI, session-backed language persistence, role gates, API DTOs, auth integration, or tab navigation. Those remain Story 1.3 through Story 1.7 work.
- If a temporary preference helper is needed to make default-language logic testable, keep it small and place it under `src/services/preferences` only if it is more than direct i18n setup.

### What Must Be Preserved

- Do not scaffold a new app, replace Expo Router, replace Ignite primitives, or introduce a third-party UI kit.
- Do not put business logic in `src/app` route files. Route files must keep importing and rendering feature screens or layouts only.
- Do not decode tokens, access session storage, or implement auth/session behavior in this story.
- Do not edit `ios/` or `android/` unless font verification proves a native config change is required and the change is documented.
- Keep all visible user-facing copy in i18n catalogs, including accessibility labels and test-visible status/help text.
- Preserve Story 1.1's Android-verified shell behavior. iOS dev-client redbox remains a documented follow-up from Story 1.1 and should not be hidden by this story's completion notes.

### Architecture Guardrails

- `src/app` is routing. `src/features` owns product screens/placeholders. `src/components` remains Ignite/base primitives only. `src/theme` owns design tokens and typography. `src/i18n` owns German/English translations and future status label mapping.
- German is the layout stress case and default locale. English remains secondary.
- Backend enum/status display must eventually map through centralized localization/status helpers; do not hard-code status labels in cards, forms, or route files.
- Status meaning must never rely on color alone. Use localized label text and accessibility labels where status meaning appears.
- Theme changes have broad blast radius: `src/theme/context.tsx` has a Repowise hotspot score of 85%, `src/i18n/index.ts` 73%, and `src/theme/colors.ts` 71%. Add tests before or alongside risky shared changes.

### UX Guardrails

- Brand color: `#B8312F`.
- Pressed red: `#8E2422`.
- Accent red: `#C8102E`.
- Warm background: `#F6F3F1` or `#F7F7F7`.
- Surface: `#FFFFFF`; warm surface: `#F5F1EC`.
- Ink/text: near-black, not pure black; recommended ink `#1A1614`.
- Border: warm light gray close to `#D8D1C5`.
- Success, warning, danger, and info must be visually distinct from brand red.
- Use red primarily for brand moments, primary actions, active navigation, and selected states. Do not make every status or alert red.
- Product typography should favor Inter or Noto Sans for tabs, lists, cards, forms, labels, buttons, badges, validation text, and long German copy.
- Cormorant Garamond is for selected brand/display moments only, not dense operational UI.
- Buttons, tabs, cards, empty states, and form labels must be checked against long German strings on compact phones. Use wrapping and stable dimensions; do not rely on viewport-scaled text.

### File Structure Requirements

Expected UPDATE files:

```text
src/app/_layout.tsx
src/i18n/index.ts
src/i18n/de.ts
src/i18n/en.ts
src/i18n/ar.ts
src/i18n/es.ts
src/i18n/fr.ts
src/i18n/hi.ts
src/i18n/ja.ts
src/i18n/ko.ts
src/i18n/translate.ts
src/utils/formatDate.ts
src/theme/colors.ts
src/theme/colorsDark.ts
src/theme/typography.ts
src/theme/types.ts
src/theme/theme.ts
src/components/Text.tsx
src/components/Button.tsx
src/features/auth/AuthShell.test.tsx
```

Likely NEW files if useful:

```text
src/i18n/i18n.test.ts
src/theme/theme.test.ts
src/theme/contrast.test.ts
src/services/preferences/languagePreference.ts
```

Only create a preferences service if the implementation actually needs a boundary for language selection/persistence now. Otherwise keep the default-locale change inside `src/i18n/index.ts` and leave persisted language preference to Story 1.7.

### Testing Requirements

- Required gates: `pnpm compile`, `pnpm lint:check`, and focused Jest tests.
- Run `pnpm test --runInBand src/features/auth/AuthShell.test.tsx` after updating shell/i18n behavior.
- Add i18n tests that cover:
  - no saved language preference -> German default;
  - English remains available;
  - fallback uses an existing language catalog;
  - German date-fns locale loads when `i18n.language` is `de`.
- Add theme tests that cover:
  - all required semantic token names exist in light and dark themes;
  - brand red, pressed red, and accent red match the UX spec;
  - error/danger is not the same as brand red;
  - key contrast-sensitive pairs are verified or explicitly documented.
- If a local UI smoke test is run, stress German copy on compact phone width first. Android is currently the accepted runtime target from Story 1.1; document if iOS remains blocked by the existing dev-client redbox.

### Previous Story Intelligence

- Story 1.1 is done and created the route-group shell, feature placeholders, localized German/English shell copy, and `AuthShell.test.tsx`.
- Story 1.1 deliberately left complete theme and i18n baseline work for this story. Do not undo the route grouping or placeholder architecture while changing copy/theme.
- Story 1.1 established that route files should stay thin and feature screens should live under `src/features/**`.
- Story 1.1 tests currently assert many untranslated `tx` key strings because i18n is not initialized in the test renderer. This story should improve at least one path to assert resolved localized text.
- Story 1.1 Android runtime verification passed on Pixel_9_Pro. iOS build/install succeeded but the dev client redboxed before shell render with `Failed to call into JavaScript module method RCTEventEmitter.receiveEvent(). Module has not been registered as callable`; do not claim iOS smoke success unless re-tested and fixed.

### Git Intelligence Summary

- Recent commits are documentation/starter only:
  - `a71f9f2 docs: refine mobile brand direction`
  - `6800528 docs: add mobile app PRD`
  - `386d806 New Ignite 11.5.0 app`
- Current uncommitted Story 1.1 work has already modified i18n files and added route/feature placeholders. Treat those as the current source of truth and do not revert them.
- Repowise retrieval for theme/i18n was low confidence because the index predates Story 1.1 uncommitted files; actual source files have been verified directly for this story.

### Latest Technical Context

- The installed project uses Expo SDK `55.0.17`, `expo-font` `~55.0.4`, `expo-router` `~55.0.4`, React Native `0.83.6`, i18next `^23.14.0`, react-i18next `^15.0.1`, and TypeScript `~5.9.2`.
- Expo SDK 55 font docs say `expo-font` supports runtime font loading through `useFonts`, but the config plugin is more efficient for embedding fonts on Android/iOS. This story can continue runtime loading through the existing `useFonts(customFontsToLoad)` gate unless native embedding becomes necessary. Source: https://docs.expo.dev/versions/v55.0.0/sdk/font/
- Expo font guide confirms OTF/TTF font formats are supported across Android, iOS, and web, and `useFonts` loads font files asynchronously. Source: https://docs.expo.dev/develop/user-interface/fonts/
- i18next docs state production fallback should point to an existing language. Do not leave `fallbackLng` pointing to a tag that does not have a catalog if it causes missing-key behavior. Source: https://www.i18next.com/principles/fallback
- react-i18next docs continue to require binding the i18n instance through `initReactI18next`. Preserve the existing `i18n.use(initReactI18next)` pattern. Source: https://react.i18next.com/latest/i18next-instance

### Project Structure Notes

- `src/theme/index.ts` does not exist. Import theme modules by their actual paths (`@/theme/context`, `@/theme/typography`, etc.).
- `src/i18n/de.ts` is untracked relative to the last committed baseline but is part of the current Story 1.1 shell work. This story should build on it.
- `src/components/Text.tsx`, `Header.tsx`, `Button.tsx`, `TextField.tsx`, `ListItem.tsx`, `Card.tsx`, `EmptyState.tsx`, and Toggle components consume theme and i18n primitives. Shared token changes must be verified through component tests or compile coverage.
- Dependency additions for fonts should be minimal and aligned with Expo Google Fonts packages already used by the starter. Do not introduce a full design system or UI library for this story.

### References

- Story requirements: `_bmad-output/planning-artifacts/epics.md` - `Story 1.2: German-First Theme and i18n Baseline`.
- Epic sequencing: `_bmad-output/planning-artifacts/epics.md` - `Epic 1: Trusted Role-Aware App Entry`.
- PRD constraints: `_bmad-output/planning-artifacts/prd.md` - `NFR1` through `NFR7`, `NFR14`, `NFR17`, `NFR18`, `NFR20`, `NFR21`.
- UX requirements: `_bmad-output/planning-artifacts/ux-design-specification.md` - `Visual Design Direction`, `Typography System`, `Localization & Language Requirements`, `Accessibility Strategy`, `Implementation Guidelines`.
- Architecture constraints: `_bmad-output/planning-artifacts/architecture.md` - `Structure Patterns`, `Communication Patterns`, `Enforcement Guidelines`, `Localization and Accessibility`.
- Current source verified: `src/i18n/index.ts`, `src/i18n/de.ts`, `src/i18n/en.ts`, `src/utils/formatDate.ts`, `src/theme/colors.ts`, `src/theme/colorsDark.ts`, `src/theme/typography.ts`, `src/theme/context.tsx`, `src/components/Text.tsx`, `src/components/Button.tsx`, `src/app/_layout.tsx`, `src/features/auth/AuthShell.test.tsx`.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-05-23T23:36:03+0200: Story started; sprint status moved to in-progress.
- Theme red phase: `pnpm test --runInBand src/theme/theme.test.ts` failed against missing semantic tokens and Space Grotesk typography.
- Theme green/refactor: `pnpm test --runInBand src/theme/theme.test.ts` passed after palette, contrast, button, and font updates.
- Type check after theme/typography work: `pnpm compile` passed.
- i18n red phase: `pnpm test --runInBand src/i18n/i18n.test.ts` failed before locale helpers and German date-locale resolution existed.
- i18n/catalog green phase: `pnpm test --runInBand src/features/auth/AuthShell.test.tsx src/i18n/i18n.test.ts` passed.
- Focused regression after theme and i18n work: `pnpm test --runInBand src/theme/theme.test.ts src/i18n/i18n.test.ts src/features/auth/AuthShell.test.tsx` passed.
- Type check after locale/catalog work: `pnpm compile` passed.
- Final gate: `pnpm compile` passed.
- Final gate: `pnpm test --runInBand` passed all 7 suites / 38 tests.
- Final gate: `pnpm lint:check` passed after ESLint formatting fixes on story-touched files.
- Final gate: `pnpm depcruise` passed with no dependency violations across 140 modules / 285 dependencies.
- Android Argent verification on Pixel_9_Pro (`emulator-5554`) launched the existing dev build through Metro at `http://10.0.2.2:8081` and verified German startup shell, login placeholder, signup placeholder, forgot-password placeholder, and legal placeholder render with the new theme/i18n baseline.
- Android Argent check found awkward wrapping for `Passwort-Wiederherstellung ausstehend`; German copy was shortened to `Passwort-Hilfe ausstehend`, then focused compile/tests and final lint/dependency checks passed.
- Code review patches fixed date-fns named locale loading, dark-mode button contrast, status color contrast coverage, and German/English-only runtime locale support.
- Review gate: `pnpm compile` passed.
- Review gate: `pnpm test --runInBand` passed all 7 suites / 42 tests.
- Review gate: `pnpm lint:check` passed.
- Review gate: `pnpm depcruise` passed with no dependency violations across 140 modules / 279 dependencies.

### Completion Notes List

- Added Bestattungszentrum semantic light/dark theme tokens, preserving Ignite compatibility keys.
- Updated button presets to use brand action tokens without changing base button height.
- Replaced Space Grotesk as the primary UI font with Noto Sans and added Cormorant Garamond display typography.
- Switched the root font gate to `expo-font` `useFonts(customFontsToLoad)` so product and display fonts load through the existing splash gate.
- Added a German-first locale helper and wired `initI18n` to default to `de` with English fallback.
- Added German date-fns locale resolution and fallback-safe date locale selection.
- Rewrote remaining visible German/English Ignite starter catalog copy for retained welcome, error, and empty-state keys.
- Updated auth shell tests to assert resolved German and English copy instead of raw translation keys.
- Verified required compile, Jest, lint, and dependency-cruiser gates.
- Verified the themed German-first shell on Android with Argent, including main entry actions and placeholder navigation.
- Fixed review findings by loading date-fns locales through named exports, limiting runtime i18n resources to German and English, adding readable action text tokens, and extending contrast regression coverage.

### File List

- `_bmad-output/implementation-artifacts/1-2-german-first-theme-and-i18n-baseline.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `expo-env.d.ts`
- `package.json`
- `pnpm-lock.yaml`
- `src/app/_layout.tsx`
- `src/components/Button.tsx`
- `src/features/auth/AuthEntryScreen.tsx`
- `src/features/auth/AuthShell.test.tsx`
- `src/features/shared/PlaceholderScreen.tsx`
- `src/i18n/de.ts`
- `src/i18n/en.ts`
- `src/i18n/i18n.test.ts`
- `src/i18n/index.ts`
- `src/i18n/locale.ts`
- `src/theme/colors.ts`
- `src/theme/colorsDark.ts`
- `src/theme/theme.test.ts`
- `src/theme/typography.ts`
- `src/utils/formatDate.ts`

### Change Log

- 2026-05-23: Implemented German-first theme, typography, i18n default locale, catalog cleanup, locale-aware date handling, and focused regression tests.
