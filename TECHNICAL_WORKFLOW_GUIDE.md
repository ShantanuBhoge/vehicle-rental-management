# Vehicle Rental Management System - Technical Workflow Guide

Welcome to the comprehensive **Technical Workflow Guide** for the **Vehicle Rental Management System**. This document provides an end-to-end technical overview of the architecture, database schema, role-based modules, payment processing flow, maintenance tracking, and API integration.

---

## 1. System Architecture Overview

The system follows a modern **Decoupled Single Page Application (SPA)** architecture consisting of three core layers:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   FRONTEND SPA (HTML5 / Vanilla CSS3 / JS)               │
│                                                                         │
│   ┌─────────────────────┐   ┌─────────────────────┐   ┌──────────────┐  │
│   │   Customer Module   │   │    Owner Module     │   │ Help/Contact │  │
│   │ (Search, Rent, Pay) │   │(Fleet, Maintenance) │   │ (FAQ, Support│  │
│   └──────────┬──────────┘   └──────────┬──────────┘   └──────┬───────┘  │
└──────────────┼─────────────────────────┼─────────────────────┼──────────┘
               │                         │                     │
               │ REST API Requests       │ (JSON via HTTP)     │
               ▼                         ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVER (Node.js & Express.js)                │
│                                                                         │
│   ┌─────────────────────┐   ┌─────────────────────┐   ┌──────────────┐  │
│   │   Auth & RBAC API   │   │ Bookings & Payments │   │ Maintenance  │  │
│   └──────────┬──────────┘   └──────────┬──────────┘   └──────┬───────┘  │
└──────────────┼─────────────────────────┼─────────────────────┼──────────┘
               │                         │                     │
               │ Prepared SQL Queries    │ (MySQL Pool Connection)
               ▼                         ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (MySQL Relational DB)                  │
│                                                                         │
│  [vehicles] [categories] [branches] [owners] [customers]                │
│  [bookings] [payments]   [maintenance_records]                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Red & Black Obsidian Design Tokens (`style.css`)

The frontend styling utilizes a centralized CSS Variable design system:

| CSS Variable | Color / Value | Usage |
| :--- | :--- | :--- |
| `--bg-main` | `#0a0a0e` | Deep obsidian main background |
| `--bg-surface` | `#121218` | Container surfaces & modal backdrops |
| `--bg-card` | `rgba(22, 22, 30, 0.75)` | Glassmorphic card bodies (`backdrop-filter: blur(16px)`) |
| `--primary-red` | `#ff2a4b` | Crimson red primary accent & highlights |
| `--primary-red-hover` | `#e11d48` | Hover state for buttons and links |
| `--red-glow` | `0 0 20px rgba(255, 42, 75, 0.4)` | Glowing border shadow effects |
| `--border-red` | `rgba(255, 42, 75, 0.25)` | Card and navbar bottom borders |
| `--text-bright` | `#ffffff` | Headings & primary titles |
| `--text-muted` | `#9494a3` | Labels, subtitles, and secondary info |

---

## 3. Database Schema & Data Models

### Primary Entities & Relationships

```
                     ┌──────────────────┐
                     │    CUSTOMERS     │
                     └────────┬─────────┘
                              │ 1
                              │
                              │ N
                     ┌────────┴─────────┐         1 ┌──────────────────┐
                     │     BOOKINGS     ├───────────┤     PAYMENTS     │
                     └────────┬─────────┘           └──────────────────┘
                              │ N
                              │
                              │ 1
┌──────────────────┐ 1      N ┌┴────────────────┐ 1      1 ┌──────────────────┐
│VEHICLE_CATEGORIES├──────────┤    VEHICLES     ├──────────┤MAINTENANCE_RECORDS│
└──────────────────┘          └────────┬────────┘          └──────────────────┘
                              │ N
                              │
                              │ 1
                              ┌┴────────────────┐
                              │     OWNERS      │
                              └─────────────────┘
```

### Table Definitions:

1. **`vehicles`**:
   - `VEHICLE_ID` (INT PK)
   - `REGISTRATION_NO` (VARCHAR)
   - `CATEGORY_ID` (FK -> vehicle_categories)
   - `BRANCH_ID` (FK -> branches)
   - `OWNER_ID` (FK -> owners)
   - `STATUS` (`AVAILABLE`, `BOOKED`, `RENTED`, `MAINTENANCE`)

2. **`customers`**:
   - `CUSTOMER_ID` (INT PK)
   - `FIRST_NAME`, `LAST_NAME`, `EMAIL` (UNIQUE), `PHONE`, `PASSWORD`

3. **`owners`**:
   - `OWNER_ID` (INT PK)
   - `FIRST_NAME`, `LAST_NAME`, `EMAIL` (UNIQUE), `PHONE`, `PASSWORD`

4. **`bookings`**:
   - `BOOKING_ID` (INT PK)
   - `VEHICLE_ID` (FK)
   - `CUSTOMER_ID` (FK)
   - `START_DATE`, `END_DATE`
   - `TOTAL_AMOUNT` (DECIMAL)
   - `STATUS` (`CONFIRMED`, `CANCELLED`)

5. **`payments`**:
   - `PAYMENT_ID` (INT PK)
   - `BOOKING_ID` (FK)
   - `CUSTOMER_ID` (FK)
   - `AMOUNT` (DECIMAL)
   - `PAYMENT_METHOD` (`UPI`, `CREDIT_CARD`, `NET_BANKING`)
   - `TRANSACTION_REF` (VARCHAR)

6. **`maintenance_records`**:
   - `MAINTENANCE_ID` (INT PK)
   - `VEHICLE_ID` (INT FK UNIQUE)
   - `INSURANCE_POLICY_NO`, `INSURANCE_EXPIRY` (DATE)
   - `PUC_CERTIFICATE_NO`, `PUC_EXPIRY` (DATE)
   - `NEXT_SERVICE_DATE` (DATE)
   - `VEHICLE_CONDITION` (`EXCELLENT`, `GOOD`, `SERVICING_NEEDED`, `UNDER_REPAIR`)
   - `NOTES` (TEXT)

---

## 4. Module Workflow & Role Access Control (RBAC)

The application dynamically renders navigation tabs and action controls based on the current active user role state (`GUEST`, `CUSTOMER`, or `OWNER`):

```javascript
// State structure in frontend/index.html
let currentUser = {
    role: "GUEST" | "CUSTOMER" | "OWNER",
    id: 1,
    name: "Alex",
    email: "alex@example.com"
};
```

### Module Matrix & Permissions

| View / Feature | Guest Mode | Customer Module | Owner Module |
| :--- | :---: | :---: | :---: |
| **Browse & Search Vehicles** | ✅ View Only | ✅ View & Rent | ✅ View Only |
| **Rental Payment Modal** | ❌ (Prompts Login) | ✅ Full Payment | ❌ Hidden |
| **My Bookings History** | ❌ Hidden | ✅ Full Access | ❌ Hidden |
| **Register New Vehicle** | ❌ Hidden | ❌ Hidden | ✅ Full Access |
| **Fleet Management Table** | ❌ Hidden | ❌ Hidden | ✅ Full Access |
| **Maintenance & Docs Hub** | ❌ Hidden | ❌ Hidden | ✅ Full Access |
| **Help FAQs & Contact Tab** | ✅ Full Access | ✅ Full Access | ✅ Full Access |

---

## 5. Key Sequence Flows

### Sequence A: Customer Booking & Payment Flow

```
User (Customer)          Frontend (JS)               Backend API                MySQL Database
      │                        │                          │                           │
      ├─ Click "Rent Now" ────►│                          │                           │
      │                        ├─ Open Payment Modal ────►│                           │
      │                        │  (Calculate price)       │                           │
      ├─ Pick Dates & Pay ────►│                          │                           │
      │                        ├─ POST /bookings ────────►│                           │
      │                        │  (with payload)          ├─ INSERT INTO bookings ───►│
      │                        │                          ├─ INSERT INTO payments ───►│
      │                        │                          ├─ UPDATE vehicle status ──►│
      │                        │◄─ Return booking ID & ───┤  (STATUS = 'RENTED')      │
      │                        │   Transaction Ref        │                           │
      │◄─ Show Confirmed ──────┤                          │                           │
      │   Receipt & Switch Tab │                          │                           │
```

---

### Sequence B: Owner Maintenance & Document Tracking Flow

```
Owner                    Frontend (JS)               Backend API                MySQL Database
  │                            │                          │                           │
  ├─ Click Maintenance Hub ───►│                          │                           │
  │                            ├─ GET /maintenance ──────►│                           │
  │                            │                          ├─ SELECT * FROM ──────────►│
  │                            │◄─ Return doc records ────┤  maintenance_records      │
  ├─ Fill Insurance/PUC ──────►│                          │                           │
  │  & Service due date        ├─ POST /maintenance ─────►│                           │
  │                            │                          ├─ ON DUPLICATE KEY ───────►│
  │                            │                          │  UPDATE maintenance_      │
  │                            │                          │  records                  │
  │◄─ Instant Feedback ────────┼─ Refresh Table ──────────┤                           │
```

---

## 6. How to Customize Contact Information

To update the support mobile phone number or email address, open `frontend/index.html` and locate the clear HTML comment markers:

### Updating Mobile Helpline Number:
Line position in `frontend/index.html` (inside Contact Tab):
```html
<!-- PLACEHOLDER FOR MOBILE UPDATE: CHANGE PHONE NUMBER BELOW -->
<div id="displayMobileNumber" style="font-size: 16px; font-weight: 700; color: var(--primary-red);">
    +91 98765 43210
</div>
```

### Updating Official Email Address:
Line position in `frontend/index.html` (inside Contact Tab):
```html
<!-- PLACEHOLDER FOR EMAIL UPDATE: CHANGE EMAIL ADDRESS BELOW -->
<div id="displayEmailAddress" style="font-size: 16px; font-weight: 700; color: var(--primary-red);">
    support@velocityrentals.com
</div>
```

---

## 7. Operational & Server Maintenance Commands

### Start Backend Server:
```powershell
cd "c:\Users\USER\OneDrive\Desktop\vehicle Rental Management\backend"
node app.js
```

### Launch Frontend:
Open `c:\Users\USER\OneDrive\Desktop\vehicle Rental Management\frontend\index.html` directly in Google Chrome, Microsoft Edge, or Firefox.

---
*Guide generated for Vehicle Rental Management System.*
