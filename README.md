# Bestattungszentrum Mobile

React Native mobile app built with Expo, Expo Router, TypeScript, TanStack Query, i18next, MMKV, and a development client.

## Requirements

- Node.js 20 or newer
- pnpm
- Xcode and iOS Simulator for iOS development
- CocoaPods for native iOS dependency installs
- Android Studio and an emulator for Android development
- Local backend running on `http://localhost:3000` for protected app flows

Enable package-manager shims if needed:

```bash
corepack enable
```

Install dependencies:

```bash
pnpm install
```

## Backend

Development config uses `src/config/config.dev.ts`, which points the app at:

```text
http://localhost:3000
```

For full protected-flow verification, run the sibling backend before starting the app:

```bash
cd ../bestattungszentrum-app
npm install
npm run dev
```

If your backend checkout lives somewhere else, use that path. The mobile app expects the backend to serve the mobile API on port `3000`.

## Running On iOS

Build and install the Expo development client on a simulator:

```bash
pnpm run ios
```

Start Metro for an already installed development client:

```bash
pnpm start
```

Then open the installed `de.bestattungszentrum` app in the simulator. Metro prints the development-client URL and supports the usual Expo shortcuts.

Local EAS simulator build:

```bash
pnpm run build:ios:sim
```

Local EAS device build:

```bash
pnpm run build:ios:device
```

## iOS Recovery Notes

If the iOS dev client redboxes before first render with:

```text
Failed to call into JavaScript module method RCTEventEmitter.receiveEvent().
Module has not been registered as callable.
```

the known local fix is to refresh native iOS build state and rebuild:

```bash
cd ios
rm -rf build
pod deintegrate
pod install
cd ..
pnpm run ios
```

A heavier fallback is a clean Expo prebuild followed by a rebuild:

```bash
pnpm run prebuild:clean
pnpm run ios
```

For simulator networking issues, pin Metro to localhost:

```bash
EXPO_PACKAGER_PROXY_URL=http://localhost:8081 pnpm exec expo run:ios
```

or:

```bash
pnpm exec expo start --localhost --dev-client
```

The iOS redbox resolution is documented in `_bmad-output/implementation-artifacts/investigations/ios-redbox-resolution.md`.

## Running On Android

Start an Android emulator, then build/install the development app:

```bash
pnpm run android
```

For emulator port forwarding:

```bash
pnpm run adb
```

Start Metro:

```bash
pnpm start
```

Android emulator networking may need `http://10.0.2.2:3000` instead of `http://localhost:3000`; see `src/config/config.dev.ts` if the emulator cannot reach the backend.

## Verification Commands

Run the full local quality gate:

```bash
pnpm compile
pnpm test --runInBand
pnpm lint:check
pnpm depcruise
git diff --check
```

Focused development commands:

```bash
pnpm test --runInBand path/to/test.test.tsx
pnpm lint
pnpm align-deps
```

UI/runtime changes must also be verified on a simulator or emulator. This project uses Argent for simulator verification in Codex workflows; do not claim simulator verification unless it was actually run.

## Current Feature State

Epic 2 funeral-home request flow is implemented through Story 2.6:

- supplier discovery and supplier detail
- RFQ form, review, submit receipt
- outgoing quote request history
- protected request detail
- request timeline display
- document/PDF unavailable handling
- header-style `ChevronLeft` back navigation on stack/detail screens

Story 2.6 is closed as mobile-complete. Remaining backend/API contract gaps are tracked separately in:

- `_bmad-output/implementation-artifacts/backend-gaps.md`
- `_bmad-output/implementation-artifacts/deferred-work.md`

Key deferred contracts:

- dedicated mobile request-detail endpoint
- supplier response detail deep-link contract
- informational timeline event modeling
- authenticated or signed quote-request PDF/document open flow

## Useful Paths

- App routes: `src/app`
- Funeral-home quotes feature: `src/features/funeral-home/quotes`
- Shared request UI: `src/features/requests`
- API clients and DTO schemas: `src/services/api`
- Query keys and providers: `src/services/query`
- Theme: `src/theme`
- German/English translations: `src/i18n/de.ts`, `src/i18n/en.ts`
- BMAD implementation artifacts: `_bmad-output/implementation-artifacts`
