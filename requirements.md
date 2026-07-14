# Nexovia Laundry Requirements

## Overview
This document describes the core domain model for the Nexovia Laundry application, including customer, order, scheduling, delivery, and billing entities.

## Core entities

### User
- Attributes: `phone`, `name`, `role`, `language`
- Relationships:
  - 1 user can have many `Address` records
  - 1 user can have many `Package purchase` records
  - 1 user can place many `Order` records

### Address
- Attributes: `label`, `map pin`, `area`, `directions`
- Relationships:
  - 1 address belongs to 1 `User`
  - 1 address can have many `Order` records

### Service area
- Attributes: `name`, `postcode`, `active on/off`
- Relationships:
  - many `Order` records may be delivered within 1 service area
  - 1 service area can be used by many `Time slot` records

### Time slot
- Attributes: `date`, `window`, `capacity`, `area`
- Relationships:
  - 1 time slot belongs to 1 `Service area`
  - 1 order is assigned to 1 time slot

### Package purchase
- Attributes: `plan`, `balance`, `expiry date`
- Relationships:
  - 1 package purchase belongs to 1 `User`

### Order
- Attributes: `status`, `totals £`, `slot`, `note`, `promo`
- Relationships:
  - 1 order belongs to 1 `User`
  - 1 order belongs to 1 `Address`
  - 1 order may be assigned to 1 `Time slot`
  - 1 order may have many `Order item` records
  - 1 order may generate 1 `Invoice`
  - 1 order may be linked to 1 `Driver task`

### Order item
- Attributes: `service`, `qty / kg`, `unit price £`
- Relationships:
  - 1 order item belongs to 1 `Order`
  - 1 order item references 1 `Service`

### Service
- Attributes: `name`, `unit`, `£`, `TAT`, `active`
- Relationships:
  - 1 service may appear on many `Order item` records

### Business account
- Attributes: `company`, `VAT no`, `contract prices`
- Relationships:
  - 1 business account may be related to many `User` or `Order` records (B2B support)

### Driver task
- Attributes: `pickup / delivery`, `photos`, `OTP`, `GPS`
- Relationships:
  - 1 driver task belongs to 1 `Order`

### Garment tag
- Attributes: `QR code`, `stage`, `issue flag`
- Relationships:
  - 1 garment tag may be attached to many order garments or pieces for tracking

### Invoice
- Attributes: `VAT`, `total £`, `method`, `status`
- Relationships:
  - 1 invoice belongs to 1 `Order`

## Supporting tables
Additional supporting data structures are required for full business flow and administration:
- `StatusHistory`
- `OrderNote`
- `Rider` / `Driver`
- `Package`
- `Property`
- `RecurringSchedule`
- `ContractPrice`
- `PromoCode`
- `Rating`
- `Complaint`
- `Setting`
- `Banner`
- `CmsPage`
- `Notification`

## Notes
- Customer-facing data is highlighted around `User`, `Address`, `Package purchase`, `Order`, and `Order item`.
- Order flow data includes `Order`, `Order item`, `Driver task`, `Garment tag`, and `Invoice`.
- Admin and configuration data includes `Service area`, `Time slot`, and `Service`.
- B2B support is represented by `Business account`.
