# Clean Quick Laundry — Software Requirements Specification (SRS)

Status: Draft v1.0 — derived from `Clean-Quick-Laundry-Solution-Summary.pdf` (12 July 2026),
`requirements.md` (data model v2.0), and the entity-relationship diagram.

## 1. Introduction

### 1.1 Purpose
Clean Quick Laundry (Birmingham) currently takes ~10 enquiries/month by phone with no
online booking. This system replaces that with a self-service booking channel (app +
website), a digital pickup/delivery workflow for drivers, a tracked wash/dry/iron/QC
workflow in the shop, and an admin dashboard that puts pricing, service areas, and
settings directly in the owner's hands. A secondary goal is winning recurring B2B
contracts (Airbnb hosts, hotels, restaurants, wedding halls).

### 1.2 Scope of this document
This SRS covers **Phase 1 ("Go live")** in full detail, and lists Phase 2/3 requirements
for context and forward-compatible design. Every requirement below is tagged
`[Phase 1]`, `[Phase 2]`, or `[Phase 3]` per the delivery plan in the source PDF (§4).

### 1.3 Definitions
- **Order** — a single booking from a customer, containing one or more order items.
- **Order item** — one service line (e.g. "Shirt — £2.50 × 3").
- **Garment tag** — a QR-tagged physical tracking unit for an order item as it moves
  through the shop.
- **Service area** — a postcode-based zone the business can switch on/off.
- **Business account** — a B2B client (Airbnb host, hotel, restaurant, wedding hall)
  with one or more properties and contract pricing.

## 2. System Overview

### 2.1 Actors
| Actor | Description |
|---|---|
| Customer | Books, pays, tracks orders via app or website |
| Driver | Executes pickup/delivery tasks |
| Shop staff | Processes garments through wash/dry/iron/QC |
| Admin | Owner/manager — configures pricing, areas, confirms orders, assigns drivers, views reports |
| Business client (B2B) | Airbnb host / hotel / restaurant / wedding hall with a business account (Phase 2) |

### 2.2 The four components
1. **Customer app & website** — Android + iPhone native apps, plus a web booking
   portal on `cleanquicklaundry.com`. Customers book, pay, and track without calling.
2. **Driver app** — daily pickup/delivery task list, navigation, item counts, photo
   proof, OTP-confirmed handovers.
3. **Shop panel** — every order QR-tagged and tracked through washing, drying,
   ironing, and quality check.
4. **Admin dashboard** — control centre for orders, prices, service areas, time slots,
   drivers, customers, settings, and (Phase 2) reports.

All four components sit on top of one shared backend/data model (see `requirements.md`
and the ER diagram) so that a price or setting change made once in the admin dashboard
is reflected instantly everywhere else.

## 3. Functional Requirements

### 3.1 Customer app & website
| ID | Requirement | Phase |
|---|---|---|
| REQ-CUST-01 | Customer can book an order (service, pickup time slot, address, note) in under 2 minutes | Phase 1 |
| REQ-CUST-02 | Booking is only allowed if the delivery address falls inside an **active** service area; otherwise the attempt is captured as a **lead** and booking is blocked | Phase 1 |
| REQ-CUST-03 | Customer can save multiple addresses and select one at booking time | Phase 1 |
| REQ-CUST-04 | Customer can view order history and one-tap reorder a past order | Phase 1 |
| REQ-CUST-05 | Customer receives in-app status notifications at each step of the order lifecycle | Phase 1 |
| REQ-CUST-06 | Customer receives SMS notifications at each step | Phase 1 (see §9 open question — may ship as stub) |
| REQ-CUST-07 | Customer can pay cash on delivery | Phase 1 |
| REQ-CUST-08 | Customer can pay by card / Apple Pay / Google Pay via Stripe | Phase 2 |
| REQ-CUST-09 | Customer can watch the driver on a live map during delivery | Phase 2 |
| REQ-CUST-10 | Customer can apply a package balance or promo code at checkout | Phase 2 |
| REQ-CUST-11 | Customer gives a star rating after delivery | Phase 1 |
| REQ-CUST-12 | Customer is prompted with a one-tap Google review link after rating | Phase 2 |
| REQ-CUST-13 | Native Android + iPhone apps (wrapping the same booking API as the website) | Phase 1 |

### 3.2 Driver app
| ID | Requirement | Phase |
|---|---|---|
| REQ-DRV-01 | Driver sees a daily list of assigned pickup/delivery tasks | Phase 1 |
| REQ-DRV-02 | Driver has a map/navigation link to the task address | Phase 1 (deep-link to external maps; not live GPS broadcast) |
| REQ-DRV-03 | Driver records item count and photo(s) at pickup | Phase 1 |
| REQ-DRV-04 | Driver confirms delivery handover via OTP entered by/shown to the customer | Phase 1 |
| REQ-DRV-05 | Driver's live GPS position is streamed to the customer-facing map | Phase 2 |

### 3.3 Shop panel
| ID | Requirement | Phase |
|---|---|---|
| REQ-SHOP-01 | Every order item gets a QR-coded garment tag on intake | Phase 1 |
| REQ-SHOP-02 | Staff scan/update garment tag stage: received → washing → drying → ironing → quality check → ready | Phase 1 |
| REQ-SHOP-03 | Staff can flag an issue on a garment tag (damage, stain, missing) | Phase 1 |
| REQ-SHOP-04 | Customer is notified as the order's overall stage changes | Phase 1 |
| REQ-SHOP-05 | Invoice auto-generates and sends when the order reaches "ready" | Phase 1 |
| REQ-SHOP-06 | Orders from business accounts show a priority-turnaround flag | Phase 2 |

### 3.4 Admin dashboard
| ID | Requirement | Phase |
|---|---|---|
| REQ-ADM-01 | New orders ring/alert the dashboard instantly and sit in a pending queue until confirmed | Phase 1 |
| REQ-ADM-02 | Admin can confirm an order and adjust the pickup time slot | Phase 1 |
| REQ-ADM-03 | Admin can assign a driver to an order | Phase 1 |
| REQ-ADM-04 | Admin can create/edit services and prices (e.g. "Shirt — £2.50") with instant effect on customer apps | Phase 1 |
| REQ-ADM-05 | Admin can create/edit service areas and toggle them active/inactive | Phase 1 |
| REQ-ADM-06 | Admin can create/edit time slots (date, window, capacity) per service area | Phase 1 |
| REQ-ADM-07 | Admin can edit settings: currency (£ default, switchable), VAT rate, delivery charges, opening hours, business details | Phase 1 |
| REQ-ADM-08 | Admin can manage banners and CMS pages | Phase 1 |
| REQ-ADM-09 | Admin can view/manage customers and drivers | Phase 1 |
| REQ-ADM-10 | Admin can view captured leads (out-of-area booking attempts) | Phase 1 |
| REQ-ADM-11 | Admin can view operational reports: revenue vs. £10,000/month target, online bookings, on-time rate, repeat customers, best-performing areas | Phase 2 |
| REQ-ADM-12 | Admin can create/edit promo codes and packages | Phase 2 |
| REQ-ADM-13 | Admin can manage business accounts, properties, contract prices, and recurring collection schedules | Phase 2 |
| REQ-ADM-14 | Admin can issue one consolidated monthly invoice per business account | Phase 2 |

### 3.5 Phase 3 (context only, not detailed here)
Loyalty/referral rewards, AI booking/support assistant, additional app languages,
marketing broadcast notifications.

## 4. Order Status State Machine

The 7-step flow described in the solution summary (§2 "How an order works") maps to
the following order-level states. This is the authoritative state machine for Phase 1;
Phase 2 does not add new states, only new triggers (e.g. Stripe webhook instead of
manual cash confirmation).

```
 [pending] --admin confirms-->  [confirmed] --admin assigns driver--> [assigned]
                                                                          |
                                                                driver starts pickup
                                                                          v
                                                                    [picked_up]
                                                            (items counted, weighed, photographed)
                                                                          |
                                                              shop receives garment tags
                                                                          v
                                                                    [processing]
                                        (garment tags individually move through
                                         washing -> drying -> ironing -> quality_check;
                                         order stays "processing" until ALL tags reach quality_check)
                                                                          |
                                                          all garment tags ready + invoice generated
                                                                          v
                                                                       [ready]
                                                                          |
                                                                driver starts delivery run
                                                                          v
                                                                [out_for_delivery]
                                                                          |
                                                      OTP confirmed + payment captured
                                                                          v
                                                                     [delivered]
                                                                          |
                                                        customer submits star rating (optional)
                                                                          v
                                                                   [rated] (terminal)

 [cancelled] — reachable from pending / confirmed / assigned / picked_up
               (not reachable once processing has started, without a manual admin override)
```

### 4.1 State definitions
| Status | Entered when | Customer sees |
|---|---|---|
| `pending` | Customer submits booking | "Order received, awaiting confirmation" |
| `confirmed` | Admin confirms (may adjust time slot) | "Order confirmed" |
| `assigned` | Admin assigns a driver | "Driver assigned" |
| `picked_up` | Driver completes pickup (count + photo) | "Items collected" |
| `processing` | Shop intake scans garment tags | "In progress: washing/drying/ironing" (derived from garment tag stages) |
| `ready` | All garment tags reach `quality_check` and invoice is generated | "Ready — invoice sent" |
| `out_for_delivery` | Driver starts the delivery task | "Out for delivery" (map, Phase 2) |
| `delivered` | OTP confirmed and payment captured | "Delivered" + rating prompt |
| `cancelled` | Admin or customer cancels pre-processing | "Order cancelled" |

### 4.2 Notes
- `StatusHistory` (see data model) logs every transition with `changed_by` and an
  optional note, for audit and the "on-time rate" report (Phase 2).
- Garment tag stage is tracked **per item**, independently of order status, but order
  status only advances to `ready` once every garment tag on the order has reached
  `quality_check`.
- Cancellation after `picked_up` requires a manual admin override (not modeled as a
  standard transition) since physical items are already in the pipeline.

## 5. Data Model Reference

Full entity list and relationships live in `requirements.md` and the ER diagram.
Phase mapping of entities:

**Phase 1 entities**: User, Address, ServiceArea, TimeSlot, Service, Order, OrderItem,
Driver, DriverTask, GarmentTag, Invoice, StatusHistory, OrderNote, Setting, Banner,
CmsPage, Rating, UserNotification.

**Phase 2 entities**: Package, PackagePurchase, PromoCode, BusinessAccount, Property,
RecurringSchedule, ContractPrice, Complaint (Phase 1 could also use Complaint for basic
issue logging — see open question in §9).

## 6. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | Admin changes to prices/areas/settings must be reflected in customer apps without a new app release (config is server-driven, not hardcoded) |
| NFR-02 | New-order alert must reach the admin dashboard in near real time (target: < 5s) |
| NFR-03 | System must reject bookings for addresses outside all active service areas, while still capturing the attempt as a lead |
| NFR-04 | Currency, VAT, and delivery-fee calculation must be centrally configurable, defaulting to GBP (£) |
| NFR-05 | OTP codes must be single-use and tied to a specific driver task |
| NFR-06 | Photos captured by drivers must be persisted and retrievable against the order/task |

## 7. Business Rules

- Customers outside active service areas cannot book; their interest is recorded as a
  lead for future area activation.
- Every new order enters a pending queue and requires explicit admin confirmation —
  nothing auto-confirms in Phase 1.
- Pricing shown to a customer is either the standard `Service.price`, or — once Phase 2
  ships — the `ContractPrice` override for their `BusinessAccount`.

## 8. Out of Scope for Phase 1
Stripe/card payments, live GPS tracking, packages, promo codes, business accounts and
recurring collections, monthly consolidated invoicing, Google review prompts, full
analytics reports, loyalty/referral rewards, AI assistant, multi-language apps,
marketing broadcasts.

## 9. Open Questions / Assumptions
1. **SMS provider** — not specified in source docs. Assumed: build the notification
   interface Phase 1, wire a stub/log channel, swap in a real SMS provider (e.g.
   Twilio) once chosen — does not block Phase 1 functional completion.
2. **Complaints** — the ER diagram lists `Complaint` as a supporting table without a
   phase tag in the PDF. Recommend building it in Phase 1 (low cost, high support
   value) even though it's not explicitly called out — confirm with stakeholder.
3. **Native app strategy** — full native (Swift/Kotlin) vs. a cross-platform
   wrapper (Flutter/React Native) around the web booking flow is undecided.
4. **VAT calculation rule** — flat-rate vs. itemized VAT depends on the business's
   VAT registration status, which is a pending input (§5 of the PDF).

## 10. Delivery Plan Reference
See `Clean-Quick-Laundry-Solution-Summary.pdf` §4 for timelines: Phase 1 ~8–10 weeks,
Phase 2 ~6–8 weeks, Phase 3 ongoing.
