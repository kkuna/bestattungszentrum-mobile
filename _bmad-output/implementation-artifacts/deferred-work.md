# Deferred Work

## Deferred from: code review of story-1.7 (2026-05-24)

- Test-quality nits in `src/navigation/roleTabs.test.tsx` — hard-coded `"#B8312F"` hex assertion couples the test to a literal rather than the theme `tint` token; identical Jest-mock boilerplate is duplicated across 4 test files (`roleTabs.test.tsx`, `routeAccess.test.tsx`, `SettingsScreens.test.tsx`, `AccountStatusPanel.test.tsx`); the i18n test mock returns the raw key for missing translation paths, so tests can pass even when a translation key is missing. Maintainability only, no runtime impact.
