# Investigation: iOS Dev-Client Redbox — Resolution

- **Date:** 2026-05-25
- **Status:** ✅ Resolved
- **Origin:** Carried blocker since Story 1.1 (documented in 1.1/1.2/1.3 and the Epic 1 retrospective)

## Symptom

iOS dev client built and installed, but redboxed before first render (screen blank after dismissing):

> Failed to call into JavaScript module method RCTEventEmitter.receiveEvent(). Module has not been registered as callable.

Android ran fine on the same code. All Epic 1 runtime verification was therefore Android-only.

## Environment

Expo SDK 55.0.17 · React Native 0.83.6 · React 19.2.0 · New Architecture (bridgeless) · Hermes · expo-router · expo-dev-client. iPhone 16 Pro simulator (iOS 18.3).

## Hypotheses researched (3 parallel web-research agents)

1. **Stale/incompatible native build** (RN 0.83 prebuilt RNCore / pods). The error is typically a *secondary symptom* of an earlier failure (early JS crash, or a native module emitting an event before the bridgeless runtime registered callable JS modules). A clean pod reinstall resolves this class often.
2. **Metro host = LAN IP unreachable from the simulator.** `expo run:ios` has a known bug ([expo #30821](https://github.com/expo/expo/issues/30821)) advertising the LAN IP even for simulators, which can break the bundle fetch.
3. **A library firing a legacy event under bridgeless** — prime suspects `react-native-keyboard-controller` 1.20.7 and `react-native-safe-area-context` 5.6.2 ([new-arch #134](https://github.com/reactwg/react-native-new-architecture/discussions/134)).

Ruled out locally before testing: `react-native-worklets` dual-install (single 0.7.4), babel misconfig (only `babel-preset-expo`), `react-native-dotenv` (absent).

## Diagnosis & resolution

Rebuilt and ran on the iOS simulator (`expo run:ios`), which performed a fresh `pod install` (adding `react-native-svg`) and a clean compile:

- **Result: the app rendered cleanly — no redbox.** German auth screen confirmed via native accessibility tree (`AXButton "Anmelden"`, `"Bestatter-Zugang"`, `"Passwort vergessen"`, `"Rechtliche Informationen"`).
- **Stable across a cold restart** — relaunch reconnected to Metro and rendered again with no redbox.
- **Hypothesis #2 ruled out:** the simulator reached Metro at the advertised LAN IP `192.168.0.79:8081` and bundled all 3766 modules successfully — host was not the blocker.

**Conclusion:** Hypothesis #1. The Story-1.1-era native build was stale/incompatible (likely an RN 0.83 prebuilt-RNCore / pod state mismatch); a clean pod reinstall + fresh DerivedData compile on the current toolchain resolved it. The original build's native log was not captured at the time, so the exact original trigger can't be pinned with certainty — but iOS now builds, renders, and cold-launches reliably.

## Recommendations / follow-ups

- **iOS is now a verifiable target** — resume dual-platform (iOS + Android) Argent verification for UI-affecting stories in Epic 2.
- **If a stale-build redbox recurs:** `cd ios && rm -rf build && pod deintegrate && pod install` (or `npx expo prebuild --clean -p ios`), then rebuild.
- **Network-restricted fallback (localhost pin):** for the iOS *simulator*, Metro can be pinned to localhost via `EXPO_PACKAGER_PROXY_URL=http://localhost:8081 npx expo run:ios` or `npx expo start --localhost`. (Not needed here; LAN IP worked.)
- **Optional hardening:** `react-native-keyboard-controller` 1.21.x has iOS bridgeless stability fixes over the bundled 1.20.7 — consider bumping if any keyboard-related iOS instability appears.

## Sources

- https://github.com/facebook/react-native/issues/42640 (RCTEventEmitter.receiveEvent on init/reload)
- https://github.com/reactwg/react-native-new-architecture/discussions/134 (RCTEventEmitter under bridgeless TurboModules)
- https://github.com/expo/expo/issues/30821 (`expo run:ios` advertises LAN IP for simulators)
- https://expo.dev/changelog/sdk-55
