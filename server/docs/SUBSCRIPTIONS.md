# Patient Subscriptions — Architecture & Payment Plan

> **Status:** Phase 1 shipped (patient buys a plan end to end). Phases 2–4 are designed here but not built.

---

## 1. Why this document exists

`Subscription` has always held the *catalogue* — Basic / Pro / Elite and the nine bonus courses, each priced per trimester. Nothing recorded that a patient **bought** one.

This document covers the record that does, and everything that happens to it afterwards:

1. **Purchase** — patient picks a plan, sees what they will pay, pays through Razorpay, gets access.
2. **Lifecycle** — upgrade, downgrade, renew, cancel, expire, refund.
3. **Admin control** — granting plans without payment, buying on a patient's behalf, correcting mistakes.

Two collections carry it: `PatientSubscription` (the entitlement) and `SubscriptionPayment` (the money trail).

---

## 2. Layer map

```
┌──────────────────────────────────────────────────────────────────────┐
│  routes/patientSubscriptions.js  ·  routes/webhooks.js               │
├──────────────────────────────────────────────────────────────────────┤
│  controllers/patientSubscriptions/*  ·  controllers/webhooks/*       │
│      validate → call service → sendSuccess. No business logic.       │
├──────────────────────────────────────────────────────────────────────┤
│  services/patientSubscriptions/*                                     │
│      the only layer that writes PatientSubscription                  │
├──────────────────────────────────────────────────────────────────────┤
│  helpers/patientSubscriptions/*        helpers/payments/razorpay.js  │
│      period · pricing · transitions    the ONLY file that talks      │
│      pure functions, no db, no io      to the Razorpay SDK           │
└──────────────────────────────────────────────────────────────────────┘
```

### The one boundary that matters

`helpers/payments/razorpay.js` is the only file that imports the Razorpay SDK. Services ask it for an order and hand it a webhook body; they never see `razorpay.orders.create` or an HMAC. If the gateway is ever swapped, or recurring mandates are added, **only that file changes**.

The same rule as `helpers/push/` in [NOTIFICATIONS.md](./NOTIFICATIONS.md) §2, for the same reason.

---

## 3. Design rules

1. **The webhook is the source of truth.** A browser callback can be closed, blocked or faked. Only `payment.captured` grants a paid plan.
2. **The client never sends an amount.** Price, discount and credit are computed server-side from the catalogue. The request carries `packageId` and `trimester`, nothing else.
3. **Money is stored in rupees.** Razorpay speaks paise; conversion happens only at the two edges. Mixed units in one codebase is a reliable source of hundred-fold billing errors.
4. **What was sold is frozen.** A `snapshot` of the plan is copied onto the subscription at purchase. Editing the Pro package in September must not rewrite what a patient bought in July.
5. **Every state change goes through one guard.** `helpers/patientSubscriptions/transitions.js` owns the legal moves. No service invents its own.
6. **A notification failure never rolls back a payment.** Every notice is wrapped in `sendQuietly()`.

---

## 4. Data model

### 4.1 `PatientSubscription` — what a patient holds

```js
{
  subscriptionNumber: String,       // SUB-20260925-000148, unique, quotable on a call

  patientId:  ObjectId → Patient,   // indexed
  userId:     ObjectId → User,      // denormalised: entitlement checks start from a JWT

  // ---- what was bought, frozen at purchase ----
  packageId:  ObjectId → Subscription,
  kind:       "PACKAGE" | "BONUS",
  tier:       "basic" | "pro" | "elite" | "bonus",
  trimester:  "all" | "first" | "second" | "third",
  snapshot: { name, subtitle, price, originalPrice,
              durationInDays, modules[], includes[] },

  // ---- period ----
  startDate:  Date,
  endDate:    Date,                 // startDate + snapshot.durationInDays
  graceUntil: Date,                 // endDate + GRACE_DAYS, null when free

  status: "PENDING_PAYMENT" | "ACTIVE" | "EXPIRED" | "CANCELLED"
        | "UPGRADED" | "SCHEDULED" | "REFUNDED",

  // ---- money ----
  currency: "INR",
  listPrice:     Number,
  discount:      Number,            // reserved for coupons
  proration: { creditFrom, creditAmount, daysRemaining },
  amountPayable: Number,            // listPrice - discount - credit, floored at 0
  amountPaid:    Number,
  paymentStatus: "NOT_REQUIRED" | "PENDING" | "PAID" | "FAILED" | "REFUNDED",

  // ---- gateway, nested so recurring can be added without a migration ----
  gateway: { provider, orderId, paymentId, signature },

  // ---- lineage ----
  previousSubscriptionId: ObjectId,  // upgrade chain
  renewedFromId:          ObjectId,

  // ---- provenance ----
  source: "PATIENT" | "ADMIN" | "SYSTEM",
  createdBy: ObjectId → User,
  grantReason: String,
  cancelledBy, cancelledAt, cancelReason,

  remindersSent: [{ daysBefore, at }],
  notes: String,
  isActive: Boolean, isDeleted: Boolean
}
```

**Why `snapshot`.** Prices change. A patient who paid ₹9,999 must keep seeing ₹9,999 and the module list as sold. Live-joining `packageId` would silently rewrite history; `packageId` stays for grouping and reporting.

**Why `userId` is duplicated.** Every entitlement check starts from a JWT. Storing both removes a `Patient` lookup from the hottest path in the app.

### 4.2 `SubscriptionPayment` — one row per attempt

Append-only. One subscription can carry several attempts — a failed card, then a successful UPI.

```js
{
  patientSubscriptionId: ObjectId,   // indexed
  patientId:             ObjectId,

  provider: "razorpay",
  orderId:   String,                 // indexed
  paymentId: String,                 // sparse UNIQUE → the idempotency key
  signature: String,

  amount: Number,                    // rupees
  currency: "INR",
  status: "CREATED" | "AUTHORIZED" | "CAPTURED" | "FAILED" | "REFUNDED",
  method: String,                    // card / upi / netbanking, as reported
  purpose: "NEW" | "RENEWAL" | "UPGRADE" | "BONUS",

  failureReason: String,
  refund: { refundId, amount, reason, at },

  rawEvent: Object,                  // the webhook body, kept for disputes
  receivedAt: Date
}
```

⚠️ The **sparse unique index on `paymentId`** is what makes duplicate webhook delivery harmless. The second insert fails with `E11000`, the handler catches it and returns `200`. Nothing else in the system needs to think about replay.

### 4.3 Indexes

```js
// PatientSubscription
{ patientId: 1, status: 1, endDate: -1 }              // "what does this patient hold"
{ status: 1, endDate: 1 }                             // the expiry sweep (phase 3)
{ "gateway.orderId": 1 }       unique, sparse         // webhook → subscription
{ subscriptionNumber: 1 }      unique
{ packageId: 1, status: 1 }                           // admin: who is on Elite
{ patientId: 1, kind: 1 }      unique, partial        // one ACTIVE package at a time
      partialFilterExpression: { kind: "PACKAGE", status: "ACTIVE" }

// SubscriptionPayment
{ paymentId: 1 }               unique, sparse         // idempotency
{ orderId: 1 }
{ patientSubscriptionId: 1, createdAt: -1 }
```

The partial unique index enforces *one active package* in the database rather than trusting application code to check first. Two parallel upgrades cannot both win.

---

## 5. State machine

```
  [new] --> PENDING_PAYMENT --(webhook: paid)--> ACTIVE
              |                                    |
              |                                    +--(endDate + grace passed)--> EXPIRED
              |                                    |
              +--(webhook: failed                  +--(patient/admin cancels)---> CANCELLED
              |   or 30 min timeout)               |
              v                                    +--(upgrade paid)------------> UPGRADED
         stays PENDING,                            |
         payment FAILED                            +--(admin refunds)-----------> REFUNDED

  admin grant / free Basic ------------------------> ACTIVE   (no payment step)
  SCHEDULED --(predecessor reaches endDate)--------> ACTIVE   (downgrade, early renewal)
```

| Status | Meaning | Access? |
|---|---|---|
| `PENDING_PAYMENT` | Order created, money not confirmed | No |
| `ACTIVE` | Paid, free or granted, inside the period | **Yes** |
| `SCHEDULED` | Paid, starts when the current one ends | Not yet |
| `EXPIRED` | Past `graceUntil` | No |
| `CANCELLED` | Stopped early | **Until `endDate`** |
| `UPGRADED` | Superseded; its unused value became a credit | No |
| `REFUNDED` | Money returned | No |

### Rules that fall out of this

- **`CANCELLED` keeps access until `endDate`.** The patient paid for that period; cancelling means *do not renew*, not *cut me off today*. Instant revocation is an admin-only override with its own flag.
- **Terminal states never move.** `EXPIRED`, `UPGRADED`, `REFUNDED` are final. A returning patient gets a new row linked by `renewedFromId`.
- **Grace period.** `graceUntil = endDate + GRACE_DAYS` (3). Inside it the row is still `ACTIVE` but the API returns `inGrace: true`, which drives the renewal banner. The sweep only expires past `graceUntil`.

---

## 6. Purchase flow

```
PATIENT APP            OUR API                      RAZORPAY
    |                     |                             |
    |  POST /preview      |   price it, no writes       |
    |<------------------->|                             |
    |                     |                             |
    |  POST /checkout     |                             |
    |-------------------->|  price server-side          |
    |                     |    orders.create(paise)     |
    |                     |---------------------------->|
    |                     |<---------- order_id --------|
    |                     |  write PENDING_PAYMENT      |
    |<-- order_id, keyId -|                             |
    |                                                   |
    |  Razorpay checkout, patient pays                  |
    |-------------------------------------------------->|
    |                     |                             |
    |                     |<== webhook payment.captured =|  <-- SOURCE OF TRUTH
    |                     |  verify signature           |
    |                     |  insert payment (unique)    |
    |                     |  activate  (transaction)    |
    |                     |  notify SUBSCRIPTION_ACTIVATED
    |                     |                             |
    |  POST /verify       |  reads current status       |
    |-------------------->|  (convenience, not authority)
```

### Step 1 — `POST /checkout`

Body is `{ packageId, trimester }`. **No amount comes from the client.** The service:

1. Reads `req.patientId` from the JWT
2. Loads the package, picks the plan for that trimester (`pickPlanForTrimester`, reused from `helpers/subscriptions`)
3. Finds the current active package and computes the proration credit
4. Computes `amountPayable`
5. **If `amountPayable === 0`** — activates immediately, no Razorpay call at all (free Basic, or a credit that fully covers an upgrade)
6. Otherwise creates a Razorpay order for `amountPayable * 100` paise
7. Writes `PatientSubscription` as `PENDING_PAYMENT` plus a `SubscriptionPayment` as `CREATED`
8. Returns `{ orderId, amount, currency, keyId, subscriptionNumber }`

`keyId` is `RAZORPAY_KEY_ID` — public by design. `RAZORPAY_SECRET` never leaves the server.

### Step 2 — the webhook

`POST /webhooks/razorpay`, **unauthenticated** but signature-verified, mounted **before** `express.json()` so the raw body survives for HMAC verification.

⚠️ This is the single most common way this integration is built wrong. `express.json()` consumes the stream; re-serialising the parsed object produces different bytes and the signature will never match.

```js
const expected = crypto
  .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
  .update(rawBody)
  .digest("hex");
// compared with timingSafeEqual against x-razorpay-signature
```

Handled events: `payment.captured`, `payment.failed`, `refund.processed`.

On `payment.captured`:

1. Insert the `SubscriptionPayment` as `CAPTURED`. A duplicate delivery fails on the unique `paymentId` — caught, returns `200`.
2. Find the subscription by `gateway.orderId`. Already `ACTIVE` → `200`, stop.
3. **Cross-check the captured amount** against `amountPayable`. A mismatch is logged and left `PENDING` for a human; never auto-activated.
4. Activate: `ACTIVE`, `startDate = now`, `endDate = now + snapshot.durationInDays`, `paymentStatus: PAID`.
5. Mark a superseded plan `UPGRADED`.
6. Fire `SUBSCRIPTION_ACTIVATED` through `sendQuietly()`.

Steps 1–5 run in one **mongo transaction**, the same way `bookAppointment` does.

⚠️ **Always return `200`** for anything already handled or not of interest. A non-200 makes Razorpay retry for 24 hours.

### Step 3 — `POST /verify` (convenience only)

Verifies the `razorpay_signature` the browser received so the UI can show success without polling. If the webhook has not landed it returns `PENDING_PAYMENT` and the UI says *confirming your payment*.

⚠️ It must never be the only path that activates a subscription — a patient who closes the tab after paying would otherwise never get their plan.

---

## 7. Pricing rules

### Proration on upgrade

```js
credit  = floor(amountPaid × daysRemaining / totalDays)   // never negative
payable = max(newPlanPrice − credit, 0)
```

Worked example — Pro second trimester (₹9,999 / 180 days), 60 days used, upgrading to Elite second trimester (₹17,999):

```
daysRemaining = 120
credit        = 9999 × 120/180 = ₹6,666
payable       = 17,999 − 6,666 = ₹11,333
```

Three properties, each a bug if missed:

- **Free plans earn no credit.** Basic cost nothing, so it offsets nothing.
- **The credit is frozen at checkout** and stored on the new row. A patient quoted ₹11,333 pays ₹11,333 even if they finish paying two days later.
- **The credit cannot exceed the new price.** A fully-covering credit activates with no Razorpay call.

### Downgrade, renew, cancel, refund

| Operation | Money | Old record becomes | New record starts |
|---|---|---|---|
| **New** | Full plan price | — | On payment |
| **Upgrade** | Price − prorated credit | `UPGRADED` | On payment |
| **Downgrade** | Full price, no refund | Runs to `endDate` | `SCHEDULED`, then at old `endDate` |
| **Renew** | Full price of chosen plan | `EXPIRED` | On payment, or `SCHEDULED` if still active |
| **Cancel** | None | `CANCELLED`, access to `endDate` | — |
| **Refund** | Admin-typed amount | `REFUNDED`, access ends now | — |

Renewal is priced off the patient's **current** trimester, not the one they first bought — a patient renewing Pro in their third trimester pays ₹5,999, not the ₹9,999 they paid in the second.

---

## 8. API surface

Mounted at `/hiranyagarbha/patient-subscriptions`.

### Patient — Phase 1, shipped

All behind `verifyJwtToken`, reading `req.patientId`. **No endpoint accepts a patient id or an amount from the body.**

| Method | Path | Does |
|---|---|---|
| `GET` | `/my` | Active package, active bonus courses, grace flag |
| `GET` | `/my/history` | Everything ever held, paginated |
| `GET` | `/my/entitlement` | Lightweight yes/no + tier, for gating screens |
| `POST` | `/preview` | Quote price and credit without writing anything |
| `POST` | `/checkout` | Create the order, return checkout params |
| `POST` | `/verify` | Verify the client signature, return current status |

The catalogue itself is already served by `GET /subscriptions/packages?trimester=second` — the checkout screen reuses it unchanged.

### Webhook — Phase 1, shipped

| Method | Path | Auth |
|---|---|---|
| `POST` | `/webhooks/razorpay` | None — HMAC over the raw body |

### Patient — Phase 2

| Method | Path | Does |
|---|---|---|
| `POST` | `/cancel/:id` | Cancel, access kept to `endDate` |
| `POST` | `/upgrade` | Checkout with a proration credit |
| `POST` | `/renew` | New period, linked by `renewedFromId` |

### Admin — Phase 3

| Method | Path | Does |
|---|---|---|
| `GET` | `/admin/patient-subscriptions` | Filterable, searchable listing |
| `GET` | `/admin/patient-subscriptions/stats` | Status counts, revenue, expiring soon |
| `GET` | `/admin/patient-subscriptions/:id` | One subscription with payments and audit |
| `POST` | `/admin/patient-subscriptions/grant` | Free / sponsored / offline grant |
| `POST` | `/admin/patient-subscriptions/checkout` | Buy for a patient, returns a payment link |
| `PATCH` | `/admin/patient-subscriptions/:id` | Extend, override dates, force status |
| `POST` | `/admin/patient-subscriptions/:id/cancel` | Cancel, optionally revoke now |
| `POST` | `/admin/patient-subscriptions/:id/refund` | Refund through Razorpay |

Admin writes also append a `SubscriptionAudit` row (`action`, `before`, `after`, `reason`, `performedBy`) — written in the service layer so a new route cannot skip it. Patient actions are *not* audited there; `source` and `cancelledBy` already carry that, and mixing the two makes the table useless for reviewing staff.

### Checkout response

```js
// POST /checkout  →  201
{ "success": true, "message": "Checkout created", "data": {
    "subscriptionNumber": "SUB-20260925-000148",
    "status": "PENDING_PAYMENT",
    "listPrice": 17999, "creditApplied": 6666, "amountPayable": 11333,
    "razorpay": { "orderId": "order_Q1x...", "amount": 1133300,
                  "currency": "INR", "keyId": "rzp_test_..." } } }
```

When `amountPayable` is 0 the `razorpay` object is absent and `status` is already `ACTIVE`. The client checks for that instead of always opening checkout.

---

## 9. Notifications

Phase 3 of [NOTIFICATIONS.md](./NOTIFICATIONS.md) §10. Wrappers live in `helpers/notifications/subscriptionNotices.js` and are thin calls to `notify()` — no delivery code of their own.

| Event | Type | Trigger | Status |
|---|---|---|---|
| activated | `SUBSCRIPTION_ACTIVATED` | payment captured / free grant | ✅ shipped |
| renewed | `SUBSCRIPTION_RENEWED` | renewal payment captured | Phase 2 |
| cancelled | `SUBSCRIPTION_CANCELLED` | patient or admin action | Phase 2 |
| expiring in 7 / 3 / 1 days | `SUBSCRIPTION_EXPIRING` | daily job, `dedupeKey` per bucket | Phase 4 |
| expired | `SUBSCRIPTION_EXPIRED` | daily job | Phase 4 |

`SUBSCRIPTION_ACTIVATED` goes out on **in-app + push + email**, the email carrying the receipt: plan name, amount paid and the validity dates. It is the one notice in the system where email is on, because a paid purchase deserves something the patient can keep.

⚠️ Every call is wrapped in `sendQuietly()`. A payment that was captured must never be unwound because SMTP was slow.

⚠️ The job-driven notices in Phase 4 **need `dedupeKey`** — `SUBSCRIPTION_EXPIRING:<subscriptionId>:7D`. Without it a sweep that runs hourly sends the same reminder 24 times.

---

## 10. Phase plan

### ✅ Phase 1 — Patient purchase *(shipped)*

Patient sees plans, previews the price, pays, gets access.

- `PatientSubscription`, `SubscriptionPayment` models
- `helpers/patientSubscriptions/` — period, pricing, transitions
- `helpers/payments/razorpay.js` — the only file touching the SDK
- `POST /preview`, `/checkout`, `/verify`; `GET /my`, `/my/history`, `/my/entitlement`
- `POST /webhooks/razorpay` with raw-body HMAC verification
- Free Basic auto-granted on profile completion, plus a backfill for existing patients
- `SUBSCRIPTION_ACTIVATED` on in-app, push and email

### Phase 2 — Lifecycle

`cancelSubscription`, `upgradeSubscription`, `renewSubscription`, and the `SCHEDULED` promotion that downgrades need. Adds `SUBSCRIPTION_CANCELLED` and `SUBSCRIPTION_RENEWED`.

### Phase 3 — Admin control

Grant, buy-on-behalf via payment link, adjust, cancel, refund. `SubscriptionAudit` collection. Admin listing and stats sharing one filter builder, the way `findAllAppointments` does.

### Phase 4 — Jobs

Four sweeps in `jobs/subscriptions.js`, registered from the existing `startJobs()`:

| Job | Runs | Does |
|---|---|---|
| `sweepExpiries` | Hourly | `ACTIVE` past `graceUntil` → `EXPIRED` |
| `promoteScheduled` | Hourly | `SCHEDULED` whose predecessor ended → `ACTIVE` |
| `timeoutPendingCheckouts` | 30 min | `PENDING_PAYMENT` older than 30 min → payment `FAILED` |
| `sendRenewalReminders` | Daily 10:00 IST | Notify at 7 / 3 / 1 days before `endDate` |

Sweeps, not timers: a `setTimeout` scheduled at purchase dies with the process, while a sweep reading current state recovers after any restart. All four are idempotent and none of them delete.

⚠️ **A late webhook always wins.** If Razorpay delivers `payment.captured` for a subscription the timeout sweep already failed, it still activates. Money received beats a housekeeping guess.

### Phase 5 — Client

Buy / Upgrade buttons on the packages screen with the Razorpay checkout script, an admin subscribers list, and a subscription tab on the patient detail page.

---

## 11. Edge cases

| Scenario | What could go wrong | Defence |
|---|---|---|
| Razorpay retries a webhook | Double activation | Sparse unique `paymentId`; activation is a no-op when already `ACTIVE` |
| Patient pays, closes the tab | Paid but never activated | The webhook activates, not the browser |
| Webhook arrives before checkout commits | Order id not found | Non-200 → Razorpay retries for 24h |
| Patient double-clicks Buy | Two orders, two charges | The open `PENDING_PAYMENT` row is reused when package and trimester match |
| Two upgrades in parallel | Two actives, credit twice | Partial unique index + transaction |
| Tampered amount in the request | Underpayment | Amount never read from the client; captured amount cross-checked |
| Activation throws after the payment row is written | Money taken, no plan | Both writes share one transaction |
| Clock skew | Wrong `endDate` | Periods computed from our server time, in IST, at activation |
| Admin refunds twice | Double refund | `refund.refundId` on the payment row blocks the second call |
| Plan price edited mid-checkout | Charged ≠ quoted | `snapshot` and `amountPayable` frozen at checkout |

### The two worst outcomes

**Money taken, no plan granted.** Activation and the payment row share one transaction, and the webhook retries for 24 hours on any non-200. If it still fails the row sits `PENDING_PAYMENT` with a `CAPTURED` payment attached — the admin listing should surface that loudly, because it is the one case needing a human.

**Plan granted, no money taken.** Only `payment.captured` activates a paid subscription. The client callback cannot, no sweep can, and the amount is cross-checked first.

---

## 12. Configuration

```bash
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx      # public, also returned to the client
RAZORPAY_SECRET=xxxxxxxxxxxxxxxxxxxxxx     # server only
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxx     # set on the Razorpay dashboard too
```

`configs/razorpay.js` fails loudly at boot if `KEY_ID` or `SECRET` is missing, rather than throwing on the first checkout.

**Webhook setup.** On the Razorpay dashboard → Settings → Webhooks, point at `https://<host>/hiranyagarbha/webhooks/razorpay`, subscribe to `payment.captured`, `payment.failed` and `refund.processed`, and use the same secret. For local work, tunnel with ngrok — the handler needs a public URL.

Also in `constants.js`: `GRACE_DAYS` (3), `CHECKOUT_TIMEOUT_MINUTES` (30).

---

## 13. File map

```
models/
  PatientSubscription.js            the entitlement
  SubscriptionPayment.js            the money trail
  SubscriptionAudit.js              phase 3

helpers/patientSubscriptions/
  period.js                         startDate / endDate / grace from a plan
  pricing.js                        credit, payable, quote — pure functions
  transitions.js                    the legal status moves
  index.js                          barrel

helpers/payments/
  razorpay.js                       THE ONLY FILE THAT IMPORTS THE SDK

helpers/notifications/
  subscriptionNotices.js            thin wrappers over notify()

services/patientSubscriptions/
  previewCheckout.js  createCheckout.js  activateSubscription.js
  verifyPayment.js    getMySubscriptions.js  getEntitlement.js
  grantFreeBasic.js   index.js

controllers/patientSubscriptions/   thin
controllers/webhooks/razorpay.js    signature → dispatch
routes/patientSubscriptions.js
routes/webhooks.js                  raw body, mounted before express.json()
validator/patientSubscriptions.js
scripts/backfillFreeBasic.js        one-off, idempotent
```

---

*Companion documents: [NOTIFICATIONS.md](./NOTIFICATIONS.md) for the delivery layer this leans on.*
