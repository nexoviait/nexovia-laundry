# Clean Quick Laundry — Operational User Guide & System Workflow

This document provides a comprehensive operational guide for **Clean Quick Laundry System**, detailing all portal features, demo credentials, system roles, and step-by-step workflow procedures.

---

## 1. System Overview & Technology Stack

Clean Quick Laundry is built on Laravel 12, Inertia.js (React), and Tailwind CSS. It connects four dedicated web portals and RESTful API endpoints for mobile applications:

- **Customer Web & Mobile Portal**: OTP authentication, dynamic service menu, time slot booking, address coverage gate, real-time order tracking, rating, and complaint logging.
- **Admin Control Desk**: Real-time order pipeline management, manual counter order creation, driver task assignment, price catalogue management, time slots, service area radar scanner, CMS banners, financial reports, and settings.
- **Shop / Facility Floor Portal**: Live Kanban processing board, garment intake weight validation, QR-code garment tag inspection, issue flagging (`on_hold`), and auto-invoice triggering upon completion (`ready`).
- **Driver Logistics App & Web Portal**: Daily route schedules, map navigation deep links, pickup garment count & photo upload, customer OTP delivery verification, and cash-on-delivery (COD) collection.

---

## 2. Environment Setup & Execution

### Installation & Local Run

```bash
# Install PHP dependencies
composer install

# Copy environment config & generate application key
cp .env.example .env
php artisan key:generate

# Configure DB_DATABASE, DB_USERNAME, DB_PASSWORD in .env, then migrate and seed real menu data:
php artisan migrate --seed

# Install JS dependencies and compile assets
npm install
npm run build

# Start local dev server
php artisan serve
```

---

## 3. Demo Accounts & Credentials

| Role | Login / Identifier | Password / OTP | Access Portal / URL |
|---|---|---|---|
| **Super Admin** | `superadmin@cleanquicklaundry.com` | `password` | `/admin/login` |
| **Admin** | `admin@cleanquicklaundry.com` | `password` | `/admin/login` |
| **Shop Staff** | `shop@cleanquicklaundry.com` | `password` | `/admin/login` *(redirects to `/shop/board`)* |
| **Driver** | `driver@cleanquicklaundry.com` | `password` | Driver Mobile App / `/driver/dashboard` |
| **Customer** | Phone: `+447700900555` | OTP: `123456` *(fixed dev OTP)* | Customer Portal `/login` |
| **Business Client** | `business@cleanquicklaundry.com` | `password` | `/admin/login` |

---

## 4. End-to-End Operational Workflow

```
[ Customer Booking / Counter Entry ] 
                 ↓
      [ Status: Awaiting Pickup (Pending) ]
                 ↓
  [ Admin Confirms & Assigns Pickup Slot ] ──→ [ Status: Confirmed ]
                 ↓
   [ Driver Assigned & Performs Pickup ]  ──→ [ Status: Assigned ➔ Picked Up ]
                 ↓
   [ Shop Intake & Garment Tag Scanning ]  ──→ [ Status: Processing (Tag Stages: Washing ➔ Drying ➔ Quality Check) ]
                 ↓
  [ Final Weigh-in & Auto-Invoice Gen ]   ──→ [ Status: Ready ]
                 ↓
[ Driver Out for Delivery & OTP Handover ] ──→ [ Status: Out For Delivery ➔ Delivered ]
                 ↓
   [ Customer Rating & Invoice Receipt ]   ──→ [ Status: Rated / Completed ]
```

### Detailed Workflow Steps:

1. **Step 1 — Booking Creation**:
   - **Customer Web/App**: Enters phone number, receives 6-digit OTP, selects service offerings (e.g. Washers, Dryers, Ironing, Dry Cleaning), chooses delivery address and pickup time slot.
   - **Admin Counter Desk**: Admin opens `/admin/orders/new` for walk-in or phone bookings, selects customer, postcode, slot, and items with live price calculation.

2. **Step 2 — Confirmation & Driver Assignment**:
   - Admin opens `/admin/orders`, confirms pending order, adjusts time slot if needed, and assigns an available driver. This automatically generates **Pickup** and **Delivery** driver task legs.

3. **Step 3 — Driver Pickup Leg**:
   - Driver opens driver app, views scheduled pickup tasks, navigates to address, logs intake item count and optional photo proof, and marks pickup as completed. Order status transitions to `Picked Up`.

4. **Step 4 — Shop Floor Processing & Tagging**:
   - Shop staff opens `/shop/board`. Intake items are validated against driver records.
   - Staff prints/generates QR Garment Tags (`/shop/orders/{id}/tags`) for individual garments and advances tags through stage checkpoints:
     `Received ➔ Washing ➔ Drying ➔ Ironing ➔ Quality Check ➔ Ready for Bagging`
   - *Issue Flagging*: If a stain or damage is found on a tag, staff flags an issue. Order pauses to `Issue Flag (On Hold)` until resolved.

5. **Step 5 — Invoice Auto-Generation & Readying**:
   - When all tags reach `Ready for Bagging`, staff submits final weight. The system auto-generates the official Invoice (`#INV-CL-{id}`) and transitions order status to `Ready`.

6. **Step 6 — Delivery & Customer Handover**:
   - Driver receives dispatch notification, collects bagged garments, and heads to delivery address.
   - Driver verifies customer's 6-digit OTP handover, logs Cash-on-Delivery payment, and completes delivery. Order transitions to `Delivered`.

7. **Step 7 — Customer Receipt & Rating**:
   - Customer receives delivery notification, views printable invoice, and leaves 1–5 star rating and feedback comment (`Rated`).

---

## 5. Portal Feature Directory

### Admin Management Portal (`/admin/*`)
- **Orders Board (`/admin/orders`)**: Real-time polling order pipeline board with status transition overrides, time slot updates, driver leg assignment, and order cancellation.
- **Manual Order Entry (`/admin/orders/new`)**: 2-column operational counter form with real-time financial manifest calculation (Subtotal, Delivery Fee, VAT 20%, Grand Total).
- **Order Details (`/admin/orders/{id}`)**: Complete booking manifest, customer profile, status timeline log, internal notes, printable invoice, and **Human-Readable QR Scan Pass**.
- **Pricing & Catalogue (`/admin/services`)**: Manage 35 real laundry items across categories (`Washers`, `Dryers`, `Ironing`, `Dry Cleaning`), unit prices, turnaround times, and inline custom categories.
- **Time Slots (`/admin/time-slots`)**: Daily pickup/dispatch capacity slots by delivery area.
- **Service Areas (`/admin/service-areas`)**: Delivery zone management with Live Postcode Radar Scanner, delivery charge overrides, and coverage toggles.
- **Customer & Driver Management (`/admin/customers`)**: Contextualized management views for Customers (`?role=customer`) and Driver Fleet (`?role=driver`).
- **Complaints Desk (`/admin/complaints`)**: Customer issue inspection and status resolution tracking.
- **Reports & Settings (`/admin/reports`, `/admin/settings`)**: Daily CSV revenue reports, business logo upload, currency symbols, and fee configurations.

### Shop Operations Board (`/shop/board`)
- Visual Kanban processing board for facility staff.
- Order Inspection modal with **Human-Readable Garment Tag QR Pass**.
- Individual garment tag stage progression and stain issue flagging.

### Driver Logistics Portal (`/driver/dashboard`)
- Daily route task lists filtered by pickup and delivery legs.
- Item count validation, photo uploads, customer OTP verification, and COD collection.

### Customer Portal (`/login`, `/dashboard`, `/book`)
- OTP phone login (no passwords needed).
- Interactive service booking with instant price estimates.
- Address coverage gate (out-of-area postcodes captured as expansion leads).
- Live order timeline tracking, printable invoice view, 1-5 star ratings, and complaint reporting.

---

## 6. System Verification

- Production build status: Verified clean (`✓ built in 1.95s`).
- PHPUnit / Automated tests: `php artisan test` passed with zero errors.
