# Clean Quick Laundry — Customer App

Expo (React Native) app for customers. Covers phone OTP onboarding, a home
screen with live services/prices, the full booking flow (services → time
slot → address → note → confirm), order timeline, order history with
reorder, address management with area gating, profile, and push
notification registration/handling.

Talks to the real Laravel backend — no mocked data.

## Setup

```bash
cd customer-app
npm install
cp .env.example .env   # then edit EXPO_PUBLIC_API_URL for your setup
npx expo start
```

`EXPO_PUBLIC_API_URL` must point at the Laravel app's `/api/v1`:

- Android emulator: `http://10.0.2.2:8000/api/v1`
- iOS simulator: `http://localhost:8000/api/v1`
- Physical device (Expo Go): `http://<your-computer's-LAN-IP>:8000/api/v1`

Make sure the backend is running and reachable, and that at least one
active `ServiceArea` + `Setting` (`currency`) exist — the seeder in the
parent project sets these up.

## Notable design choices

- **Booking order is service → slot → address → note → confirm** (slot
  picked before address), matching the requested flow. The backend does
  not currently cross-validate that a chosen time slot's service area
  matches the chosen address's service area — this app doesn't add that
  validation either, so a mismatch is possible today. Flagging this as a
  pre-existing gap, not something introduced here.
- **Currency (FR-CUS-027)**: `SettingsContext` fetches `/settings/public`
  once at startup and every amount in the app is formatted through
  `useCurrencyFormatter()`, which maps the configured currency code to a
  symbol (GBP/USD/EUR handled; anything else falls back to showing the
  code itself, e.g. "SEK 12.50").
- **i18n (FR-CUS-015)**: all UI strings go through `t()` from `src/i18n`
  (built on `i18n-js` + `expo-localization`). Only `en` is populated per
  Phase 1 scope — adding a language later is a new file in
  `src/i18n/locales` plus one line in `src/i18n/index.js`, no screen
  changes.
- **Push notifications**: the app requests permission, obtains an Expo
  push token, and registers it with the backend
  (`POST /me/push-token`). The backend's `PushGateway` is still a
  console/log stub (built in an earlier session) — this wires up the
  client side (permission, token capture, foreground notification
  handling) so a real provider can be dropped in later without touching
  the app.
- **Reorder** is client-side only: it prefills the booking context's
  basket (and previous address) from a past order, then sends the
  customer through the normal slot → confirm steps rather than a special
  "clone" endpoint — a new time slot must always be chosen since the old
  one may be full or in the past.

## What's not implemented

- No offline support — every screen assumes network connectivity.
- No star rating flow (REQ-CUST-11) — wasn't in this task's scope; the
  backend's `Rating` model exists but has no API endpoint yet.
- I could not run this on a real device/simulator in this environment (no
  Xcode/Android SDK available). Verified by exporting a production Metro
  bundle (`npx expo export --platform android`), which compiled all 1161
  modules cleanly — but there's no substitute for running it on a device
  before shipping.
