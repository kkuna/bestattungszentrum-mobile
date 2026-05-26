# Deferred Work

## Deferred from: code review of story-1.7 (2026-05-24)

- Test-quality nits in `src/navigation/roleTabs.test.tsx` — hard-coded `"#B8312F"` hex assertion couples the test to a literal rather than the theme `tint` token; identical Jest-mock boilerplate is duplicated across 4 test files (`roleTabs.test.tsx`, `routeAccess.test.tsx`, `SettingsScreens.test.tsx`, `AccountStatusPanel.test.tsx`); the i18n test mock returns the raw key for missing translation paths, so tests can pass even when a translation key is missing. Maintainability only, no runtime impact.

## Deferred from: code review of story-2.6 (2026-05-26)

- Dedicated mobile request-detail endpoint and full deep-link target matrix remain unconfirmed — backend/API contract and route-infrastructure follow-up needed; current implementation uses the protected list response and keeps the known backend gap documented.
- Supplier response detail deep links are not implemented — no confirmed response-detail route/contract exists in this story branch.
- Informational timeline state is not represented in the DTO — backend must confirm whether informational events are modeled by event type, status, or another field.

## Deferred from: code review of story-2.6 (2026-05-26 rerun)

- Dedicated mobile request-detail endpoint and full protected deep-link/auth-state matrix remain unconfirmed — backend/API contract and route-infrastructure follow-up needed before the app can implement the complete AC4 matrix.
- Supplier response detail deep links are not implemented — no confirmed response-detail route/contract exists in this story branch.
- Informational timeline state is not represented in the DTO — backend must confirm whether informational events are modeled by event type, status, or another field.

## Accepted while closing story-2.6 (2026-05-26)

- Story 2.6 is closed as mobile-complete. The unresolved backend/route items above remain tracked follow-up work and should not block moving to the next mobile story unless that story explicitly depends on one of these contracts.
- Runtime setup and iOS recovery commands are documented in `README.md`.
