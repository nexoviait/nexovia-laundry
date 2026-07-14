# Clean Quick Laundry — Build Plan (Step by Step)

Source documents this plan merges:
- `Clean-Quick-Laundry-Solution-Summary.pdf` (business scope, phases, features)
- `requirements.md` (data model / entities)
- ER diagram (Customer / Order flow / Catalogue & settings / B2B tables)

Project starting point: fresh Laravel app (`app/`, `database/migrations/` only has the default `users`, `cache`, `jobs` tables — nothing else built yet).

---

## 0. Confirm inputs before coding (business owner deliverables)

Cannot start Phase 1 for real until these arrive — build placeholders/seed data in the meantime:

- [ ] Final price list in £ (per kg and per item) + VAT registration status
- [ ] Opening time slots, launch service areas (Lozells, Handsworth, Newtown), delivery fee rules
- [ ] Logo, brand colours, Stripe account confirmation

---

## 1. Data model foundation (do first — everything depends on this)

Build migrations + Eloquent models in this order, matching `requirements.md`:

1. **Users & auth**
   - Extend `users` table: `phone`, `name`, `role` (customer/driver/shop/admin), `language`
2. **Address** — `user_id`, `label`, `map pin` (lat/lng), `area`, `directions`
3. **Service area** — `name`, `postcode`, `active` (on/off toggle)
4. **Time slot** — `service_area_id`, `date`, `window`, `capacity`
5. **Service** (catalogue) — `name`, `unit` (kg/item), `price`, `TAT`, `active`
6. **Package** + **Package purchase** — `plan`, `balance`, `expiry_date`, `user_id`
7. **Business account** — `company`, `vat_no`, contract pricing flag (B2B)
8. **Property** — belongs to `business_account` (multiple properties per B2B client)
9. **Order** — `user_id`, `address_id`, `time_slot_id`, `status`, `totals`, `note`, `promo_code_id`
10. **Order item** — `order_id`, `service_id`, `qty/kg`, `unit_price`
11. **Driver / Rider** — profile, vehicle, active status
12. **Driver task** — `order_id`, `driver_id`, `pickup/delivery` type, `photos`, `OTP`, `GPS`
13. **Garment tag** — `order_item_id`, `qr_code`, `stage` (wash/dry/iron/QC), `issue_flag`
14. **Invoice** — `order_id`, `VAT`, `total`, `method`, `status`
15. **Supporting tables**: `StatusHistory`, `OrderNote`, `RecurringSchedule`, `ContractPrice`, `PromoCode`, `Rating`, `Complaint`, `Setting`, `Banner`, `CmsPage`, `Notification`

Deliverable: migrations + models + factories/seeders for dev data.

---

## 2. Phase 1 — Go live (~8–10 weeks target)

Goal: take a booking end-to-end and run it through pickup → wash → delivery.

### 2.1 Admin dashboard (build early — everything else is configured through it)
- [ ] Manage services & prices (e.g. Shirt — £2.50)
- [ ] Manage service areas (on/off) and time slots
- [ ] Settings: currency (£ default), VAT, delivery charges, opening hours, business details
- [ ] Pending order queue with instant alert on new order
- [ ] Assign driver to order
- [ ] Order status tracking (per `StatusHistory`)

### 2.2 Customer booking (web first, matches "website booking")
- [ ] Booking flow: service → pickup time slot → address → note (under 2 minutes)
- [ ] Service-area gating: outside launch areas → capture as lead, block booking
- [ ] Saved addresses, order history, one-tap reorder
- [ ] Order confirmation + status notifications (app/SMS stub in Phase 1, real SMS in Phase 2 if needed sooner)

### 2.3 Driver app / portal
- [ ] Daily task list (pickup/delivery)
- [ ] Item count + photo capture at pickup
- [ ] OTP-confirmed handover at delivery
- [ ] Navigation link (map deep-link is enough for Phase 1; live GPS is Phase 2)

### 2.4 Shop panel
- [ ] QR tag generation per order/garment
- [ ] Stage tracking: washing → drying → ironing → quality check
- [ ] Auto-generate invoice when order reaches "ready"

### 2.5 Customer apps (Android + iPhone)
- [ ] Can reuse the web booking API — build native/wrapped clients once the web flow is stable

**Phase 1 exit criteria:** a real order can be booked on the website, confirmed by admin, picked up by a driver, tracked through the shop, invoiced, and delivered with OTP proof.

---

## 3. Phase 2 — Grow (~6–8 weeks target)

- [ ] Stripe integration (card, Apple Pay, Google Pay) + cash-on-delivery
- [ ] Live GPS tracking on delivery map for customers
- [ ] Packages & promo codes (uses `Package purchase`, `PromoCode`)
- [ ] Business accounts (B2B): multiple properties, contract prices per property, recurring collections (`RecurringSchedule`), one consolidated monthly invoice, priority-turnaround flag
- [ ] Star rating + one-tap Google review prompt after delivery
- [ ] Reports: revenue vs £10,000/month target, online bookings, on-time rate, repeat customers, best areas

---

## 4. Phase 3 — Automate (ongoing)

- [ ] Loyalty & referral rewards
- [ ] AI booking/support assistant
- [ ] Extra app languages
- [ ] Marketing broadcasts (notifications, banners, CMS pages)

---

## 5. Suggested build order (practical sequencing)

1. Data model (Section 1) — migrations, models, seeders
2. Admin: settings, service areas, time slots, services/pricing (unblocks everything else with real config data)
3. Customer booking flow (web) → Order + Order item creation
4. Admin order queue + driver assignment
5. Driver task flow (pickup, photos, OTP)
6. Shop panel (QR tags, stage tracking, auto-invoice)
7. Delivery + OTP + payment (cash first, Stripe next)
8. Notifications (in-app first, SMS/email next)
9. Phase 2 items in priority order: Stripe → live GPS → packages/promo → B2B → reviews → reports
10. Native mobile apps once web API is stable
11. Phase 3 items as ongoing backlog

---

## 6. Open questions to resolve with the business owner

- SMS provider preference (Twilio, etc.) and budget
- Stripe account: test vs live keys, who owns the account
- Native app strategy: full native (Swift/Kotlin) vs cross-platform (e.g. Flutter/React Native) wrapping the web booking flow
- VAT calculation rules (flat rate vs itemized) once VAT status is confirmed
