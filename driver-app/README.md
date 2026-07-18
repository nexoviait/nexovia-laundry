# Clean Quick Laundry — Driver App

Expo (React Native) app for drivers, covering FR-RID-001 to 008: login, today's
task list (sorted by slot then area), task detail with map-pin handoff to the
device's native navigation app, the pickup flow (item count, weight, 1–4
photos), the delivery flow (customer OTP handover + cash-on-delivery
recording), and failed pickup/delivery reporting with reasons.

It talks to the real Laravel backend in the parent project — no mocked data.

## Setup

```bash
cd driver-app
npm install
cp .env.example .env   # then edit EXPO_PUBLIC_API_URL for your setup
npx expo start
```

`EXPO_PUBLIC_API_URL` must point at the Laravel app's `/api/v1`:

- Android emulator: `http://10.0.2.2:8000/api/v1`
- iOS simulator: `http://localhost:8000/api/v1`
- Physical device (Expo Go): `http://<your-computer's-LAN-IP>:8000/api/v1`

Make sure the backend is running (`php artisan serve` or your XAMPP vhost)
and reachable from wherever the app runs.

## Test account

The backend seeder creates a driver at `driver@cleanquicklaundry.com`. Set a
password for it (or create a new driver) via `php artisan tinker` in the
parent project:

```php
$user = \App\Models\User::where('email', 'driver@cleanquicklaundry.com')->first();
$user->update(['password' => 'password']);
```

## What's not implemented

- No offline queueing — the app assumes network connectivity. If a request
  fails (e.g. driver is out of signal at a pickup), the driver sees an error
  and must retry once back online.
- No push notifications for new task assignments — the driver pulls the task
  list (pull-to-refresh / on screen focus) rather than being pushed updates.
- Payment method is hardcoded to cash, matching the backend's Phase-1 scope
  (`payment_method` only accepts `cash` — card payment is Phase 2 per the
  SRS).
- I could not run this on a real device/simulator in this environment (no
  Xcode/Android SDK available); I verified it by exporting a production
  Metro bundle (`npx expo export --platform android`), which compiled all
  844 modules cleanly, catching any import/syntax errors — but there's no
  substitute for actually running it on a device before shipping.
