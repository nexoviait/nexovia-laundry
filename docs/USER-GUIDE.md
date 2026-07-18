# Clean Quick Laundry — User Guide

How to run the application and what each role can do in it. For the
requirements this was built against, see
[`laundry-management-system-SRS.md`](laundry-management-system-SRS.md); for
build/test status, see [`PROGRESS.md`](PROGRESS.md).

## What this is

One Laravel 12 app serving four browser-based portals (customer, admin,
shop/facility, driver) plus a Bearer-token API used by two Expo mobile apps
(customer, driver). All four portals and both apps talk to the same
database and the same order.

## 1. Running it

```bash
composer install
cp .env.example .env
php artisan key:generate
# set DB_* in .env to a MySQL database, then:
php artisan migrate --seed
npm install
npm run build        # or `npm run dev` while working on the frontend
php artisan serve
```

Or, once `.env` is set up, `composer run dev` starts the PHP server, queue
listener, log tailer, and Vite dev server together.

The app is then reachable at `http://localhost:8000` (or your XAMPP vhost).
SMS and push notifications are stubbed to the log (`storage/logs/laravel.log`)
rather than sent for real — there's no SMS/push provider to configure.

### Demo accounts (from `DatabaseSeeder`)

| Role | Login | Password | Portal |
|---|---|---|---|
| Super Admin | `superadmin@cleanquicklaundry.com` | `password` | `/admin/login` |
| Admin | `admin@cleanquicklaundry.com` | `password` | `/admin/login` |
| Shop staff | `shop@cleanquicklaundry.com` | `password` | `/admin/login` |
| Driver | `driver@cleanquicklaundry.com` | `password` | driver app / API only — see [§5](#5-driver) |
| Customer | phone `+447700900555` | OTP `123456` (fixed test code, always accepted) | `/login` |
| Business Client | `business@cleanquicklaundry.com` | `password` | `/admin/login` |

The seeder also creates 3 active service areas (Lozells/B19, Handsworth/B21,
Newtown/B6), a week of time slots for each, and 6 services (shirts,
trousers, bedsheets, jackets, dresses, duvets).

## 2. Customer

**Web:** `/login` (root of the site — no prefix). **Mobile app:**
`customer-app/`, see its [README](../customer-app/README.md) for setup
(`npx expo start`, point `EXPO_PUBLIC_API_URL` at `/api/v1`).

Login is phone + a 6-digit OTP (no password). The web app sends the code
via `POST /login/request`; entering it against `/login/verify` logs the
customer in — a new account is created automatically on first login. On the
seed data, phone `+447700900555` always accepts OTP `123456`.

Once logged in, a customer can:

- **Book an order** (`/book`) — pick services and quantities, a delivery
  address, and a time slot, add a note, and see a live price estimate
  before confirming.
- **View order history and live status** (`/dashboard`, `/orders/{id}`) —
  every status change (confirmed, assigned, picked up, processing, ready,
  out for delivery, delivered) shows here, and also arrives as an in-app
  notification, SMS, and push message.
- **Cancel an order** while it's still pending/confirmed/assigned/picked up.
- **Rate a delivered order**, 1–5 stars plus an optional comment.
- **Manage saved addresses** (`/addresses`) — booking only accepts
  addresses inside an active service area; addresses outside one are
  rejected and captured as a `Lead` so admin can see where demand exists
  outside current coverage.
- **Pay cash on delivery** — the only payment method in Phase 1; no card
  payment integration exists yet.

The mobile app covers the same flow (OTP login, browse services, book, live
order timeline, reorder, rate, manage addresses, push notifications) — pick
whichever entry point is more convenient.

## 3. Admin

**Web only:** `/admin/login` (email + password) → redirects to the order
board at `/admin/orders`.

- **Orders** (`/admin/orders`) — a live queue (polls every 5s) of incoming
  orders. Confirm a pending order, adjust its pickup time slot, assign a
  driver (this creates both the pickup and delivery tasks), add internal
  notes, and step or override an order's status.
- **Catalogue** — services (`/admin/services`, price + turnaround, plus an
  optional express price/turnaround) and service areas
  (`/admin/service-areas`, postcode coverage, active toggle, delivery
  charge).
- **Time slots** (`/admin/time-slots`) — the pickup/delivery windows
  customers choose from per area/day.
- **Users** (`/admin/customers`) — view/manage customer and driver
  accounts; creating a driver here also captures their vehicle type and
  number.
- **Banners & CMS** (`/admin/banners`, `/admin/cms-pages`) — homepage
  banner images (shown to the customer app via `/api/v1/banners`) and
  simple content pages by slug (`/api/v1/cms-pages/{slug}`), each with an
  active/inactive toggle.
- **Leads** (`/admin/leads`) — postcode/phone-searchable list of booking
  attempts made outside any active service area, for gauging expansion
  demand.
- **Reports** (`/admin/reports`) — daily order report (with export) and a
  revenue report.
- **Settings** (`/admin/settings`) — currency, VAT rate, delivery fee,
  business name/phone, opening hours.

## 4. Shop / facility staff

**Web only**, same login as admin — `/admin/login` with a `shop`-role
account redirects to `/shop/board` instead. (Admin accounts can also open
`/shop/board` directly to cover for shop staff.)

- **Board** (`/shop/board`) — orders that have been picked up and are
  awaiting or undergoing processing.
- **Receive an order** — record the intake item count against what the
  driver logged at pickup.
- **Garment tags** (`/shop/orders/{id}/tags`) — each item gets a QR-coded
  tag; advance it through `received → washing → drying → ironing →
  quality_check → ready`. Flagging an issue on a tag pauses the whole order
  (`on_hold`) until resolved.
- **Finalize** — once every tag is `ready`, record the final weight; this
  auto-generates the invoice and moves the order to `ready` for driver
  pickup.

## 5. Driver

**Primary entry point: the mobile app** (`driver-app/`, see its
[README](../driver-app/README.md)). Drivers log in with the same
email/password staff accounts (`POST /api/v1/login`) — there is currently
no dedicated driver login screen in the browser, so the driver **web**
pages (`/driver/dashboard`, `/driver/tasks/{id}`) are reachable only from an
already-authenticated driver session, not a fresh login. Use the app for
day-to-day driving.

From the app, a driver can:

- See today's pickup/delivery task list, sorted by time slot then area.
- Tap a task for a map/navigation deep link to the address.
- **Pickup**: record item count, weight, and 1–4 photos.
- **Delivery**: confirm the customer's OTP handover and record
  cash-on-delivery, or **fail** a pickup/delivery with a reason if the
  customer isn't available.

## 6. Order lifecycle reference

```
pending → confirmed → assigned → picked_up → processing ⇄ on_hold
                                                  ↓
                                                ready → out_for_delivery → delivered → rated
```

`cancelled` is reachable from `pending`/`confirmed`/`assigned`/`picked_up`
by the customer, or by admin override from `processing`/`on_hold`/`ready`/
`out_for_delivery`. Every transition fires three things at once: an in-app
notification, a (stubbed) SMS, and a (stubbed) push message.

## Known gaps

- **Card payments, maps, and repository-pattern rebuilds are intentionally
  out of scope** — cash on delivery is the only payment method, and
  navigation is a deep link to the device's own maps app, not an embedded
  map.
- **No dedicated driver web login** (see [§5](#5-driver)) — use the mobile
  app.
- **Complaints** have a database model but no screen or endpoint on either
  side yet — customers can't file one, admins can't view one.
- The mobile apps are code-complete and build cleanly but have not been
  run on a physical device or emulator in this environment.
