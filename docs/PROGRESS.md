# Clean Quick Laundry — Phase 1 Progress

_Last verified: 2026-07-16, `php artisan test` — 182 tests, all passing._

## What "verified end-to-end" means here

`tests/Feature/EndToEnd/FullOrderJourneyTest.php` drives the real HTTP layer
(routes → controllers → policies → services → DB) against real seeded launch
data (`DatabaseSeeder`), for every actor, in one continuous run:

1. **Customer** — phone OTP request/verify (creates the account), browses
   `/services` and `/time-slots`, adds an address inside a seeded active
   area, places an order.
2. **Admin** — confirms the order, assigns a driver (which creates both the
   pickup and delivery `DriverTask` rows).
3. **Driver** — records the pickup (item count, weight, photo).
4. **Shop** — receives the order (intake count vs. expected), advances one
   garment tag through washing → drying → ironing → quality_check, finalizes
   with a weight reading.
5. **Driver** — starts the delivery run (SMSes a real generated OTP to the
   fake gateway), delivers using that OTP, records cash-on-delivery.
6. **Assertions** — order ends in `delivered`, invoice is `paid`/`cash`, and
   at every one of the 8 status transitions all three notification channels
   fired with the exact §4.1 "Customer sees" copy: an in-app
   `UserNotification` row, an SMS (`SmsGateway` stub), and a push message
   (`PushGateway` stub).

It passed on the first fix. Two real bugs were found and fixed along the way:

1. **No `shop`-role account in the launch seed data** — `DatabaseSeeder`
   only created `admin` and `driver` accounts. Added a seeded shop user.
2. **`currency`/`business_name`/etc. settings were never seeded**, only
   `vat_rate`/`delivery_fee`. Added the rest.

(A third issue was a test-authoring pitfall, not a production bug: Laravel's
`actingAs()` silently overrides a later Bearer-token request in the same
test because Sanctum checks the `web` session guard first. Fixed with a
`freshAuth()` helper in the test.)

## A parallel workstream landed mid-session

Independently of the work described above, a large set of changes landed in
the working tree — a session-based **web portal** for customers
(`routes/customer.php`, phone OTP login, dashboard, booking, address
management, order rating) and for drivers (`routes/web.php` driver
dashboard/task pages), a visual overhaul of the admin panel, an expanded
role set (`super_admin`, `business_client` added to `admin/driver/shop/
customer`), per-service express pricing, per-area delivery charges, a
generalized user-management screen that handles driver creation too, and a
revenue-analytics report. All of it is covered by its own passing tests
(`CustomerWebPortalTest`, `DriverWebTaskTest`, `AdminUserManagementTest`,
the revenue test in `AdminCatalogueTest`). This work is treated as a given
baseline for everything below — it's not itemized further here since it
wasn't built or verified by the session that owns this doc.

## Automated test coverage

| Area | Tests |
|---|---|
| Auth (OTP + staff login) | `tests/Feature/Auth/*` |
| Customer APIs (catalogue, addresses, orders, invoices, rating) | `tests/Feature/Customer/*` |
| Customer web portal | `tests/Feature/Customer/CustomerWebPortalTest.php` |
| Order status machine (unit) | `tests/Unit/Services/OrderStatusMachineTest.php` |
| Admin panel (orders, catalogue, users, settings, reports, banners, CMS, leads) | `tests/Feature/Admin/*` |
| Shop/facility panel (receive, stage updates, issue/hold, finalize) | `tests/Feature/Shop/*` |
| Driver API + driver web portal | `tests/Feature/Driver/*` |
| Public settings, banners/CMS, push token registration | `tests/Feature/PublicSettingTest.php`, `tests/Feature/PublicContentTest.php` |
| **Full order journey, every actor, every notification** | `tests/Feature/EndToEnd/FullOrderJourneyTest.php` |

**182 tests, all passing.** (`php artisan test`)

## System map

- **Backend**: Laravel 12. `routes/api.php` (Bearer-token REST API for the
  mobile apps), `routes/admin.php` + `routes/shop.php` + `routes/customer.php`
  + driver web routes in `routes/web.php` (session-based Inertia/React for
  browser use), all in one Laravel app.
- **`driver-app/`**: Expo (React Native) driver app — talks to `/api/v1`.
- **`customer-app/`**: Expo (React Native) customer app — talks to `/api/v1`.
- Every capability in the mobile apps also has a browser-based Inertia
  equivalent (customer web portal, driver web dashboard) built by the
  parallel workstream above.
- Neither mobile app has been run on an actual device/emulator in this
  environment (no Xcode/Android SDK available) — verified by exporting a
  production Metro bundle for each (`npx expo export --platform android`),
  which compiles cleanly, but that's not a substitute for running it.

## Phase 1 gap report

Every requirement the SRS tags `Phase 1` in §3.1–3.4, checked against what's
actually built as of this update.

| REQ | Requirement | Status |
|---|---|---|
| REQ-CUST-01 | Book an order (service, slot, address, note) in <2 min | ✅ Done |
| REQ-CUST-02 | Block booking outside active areas, capture as lead | ✅ Done |
| REQ-CUST-03 | Save multiple addresses, select at booking | ✅ Done |
| REQ-CUST-04 | Order history + one-tap reorder | ✅ Done |
| REQ-CUST-05 | In-app status notifications at each step | ✅ Done |
| REQ-CUST-06 | SMS notifications at each step | ✅ Done (console/log stub, per SRS §9.1's own allowance) |
| REQ-CUST-07 | Cash on delivery | ✅ Done |
| REQ-CUST-11 | Star rating after delivery | ✅ **Done.** Web portal (`CustomerWebOrderController::rate`, parallel workstream) and, as of this update, the mobile API (`POST /api/v1/orders/{order}/rating`) + a rating screen in `customer-app`. |
| REQ-CUST-13 | Native Android + iPhone apps wrapping the booking API | 🟡 **Built, unverified on a device.** Both Expo apps compile for both platforms; never run on an actual simulator/device — no Xcode/Android SDK in this environment. |
| REQ-DRV-01 | Daily pickup/delivery task list | ✅ Done (API + web) |
| REQ-DRV-02 | Map/navigation deep link | ✅ Done |
| REQ-DRV-03 | Item count + photo(s) at pickup | ✅ Done |
| REQ-DRV-04 | OTP-confirmed delivery handover | ✅ Done |
| REQ-SHOP-01 | QR-coded garment tag per order item on intake | ✅ Done |
| REQ-SHOP-02 | Stage tracking (received→washing→drying→ironing→QC→ready) | ✅ Done |
| REQ-SHOP-03 | Flag an issue on a garment tag | ✅ Done (extended to pause the order — ON_HOLD) |
| REQ-SHOP-04 | Customer notified as order's overall stage changes | ✅ Done |
| REQ-SHOP-05 | Invoice auto-generates when order reaches "ready" | ✅ Done |
| REQ-ADM-01 | New-order alert + pending queue | ✅ Done (5s polling) |
| REQ-ADM-02 | Confirm order + adjust pickup time slot | ✅ Done |
| REQ-ADM-03 | Assign a driver to an order | ✅ Done |
| REQ-ADM-04 | Create/edit services & prices | ✅ Done (now with express pricing) |
| REQ-ADM-05 | Create/edit service areas, toggle active | ✅ Done (now with per-area delivery charge) |
| REQ-ADM-06 | Create/edit time slots | ✅ Done |
| REQ-ADM-07 | Settings: currency, VAT, delivery charges, hours, business details | ✅ Done |
| REQ-ADM-08 | Manage banners and CMS pages | ✅ **Done as of this update.** `AdminBannerController`/`AdminCmsPageController` + `Admin/Banners`, `Admin/CmsPages` screens; public read endpoints (`/api/v1/banners`, `/api/v1/cms-pages/{slug}`) for the customer app. |
| REQ-ADM-09 | View/manage customers and drivers | ✅ **Done** (parallel workstream) — `AdminCustomerController` was generalized into full user management, including driver profile fields (vehicle type/number, active toggle). |
| REQ-ADM-10 | View captured leads | ✅ **Done as of this update.** `AdminLeadController` + `Admin/Leads/Index` screen, searchable by postcode/phone. |

**Also out of Phase 1's hard requirements but worth flagging:** `Complaint`
has a model/migration but no API endpoint or UI on either side — customers
can't file one and admins can't see one. Not a numbered SRS requirement
(§9.2 calls it a recommendation), so not counted against Phase 1 completion.

### Bottom line

**Every SRS-numbered Phase 1 requirement is now built and tested**, except
REQ-CUST-13 which is code-complete but unverified on an actual device
(environment limitation, not a code gap). The only remaining loose end
outside the numbered requirements is `Complaint` handling.
