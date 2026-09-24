# Notification System — Architecture & Delivery Plan

**Status:** Phase 1 (admin bulk broadcast) implemented. Phases 2 and 3 designed, not built.
**Owner:** backend
**Last updated:** 2026-09-25

---

## 1. Why this document exists

Three separate features need to send notifications:

1. **Admin broadcast** — one update to a role, a filtered segment or a hand-picked list.
2. **Appointments** — booked / confirmed / rescheduled / cancelled / reminder, to **both** the patient and the doctor.
3. **Subscriptions** — activated / renewed / expiring / expired / cancelled, to the patient. Activation is live; see [SUBSCRIPTIONS.md](./SUBSCRIPTIONS.md).

If each of those grows its own sending code, we end up with three copies of "look up the user, find their FCM token, build a payload, catch the error so the booking does not fail". This document defines **one** delivery layer that all three call, and the order in which they get built.

The rule this whole design follows:

> **Domain code says _who_ and _what_. It never says _how_.**
> A caller writes `notify({ userId, type, title, body })`. It never touches FCM, nodemailer, tokens or retries.

---

## 2. Layer map

```
┌──────────────────────────────────────────────────────────────────────┐
│  DOMAIN CALLERS                                                      │
│  appointments/*  ·  subscriptions/*  ·  admin broadcast controller   │
│  — describe WHO and WHAT. Never import a provider.                   │
└───────────────────────────┬──────────────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────────┐
│  NOTIFICATION LAYER   helpers/notifications/                         │
│                                                                      │
│   notify()          one recipient   → 1 row  + delivery              │
│   notifyAudience()  many recipients → N rows + bulk delivery         │
│   resolveAudience() declarative target → concrete user list          │
│   renderTemplate()  {{name}} / {{doctor}} substitution               │
│                                                                      │
│  Writes the Notification row FIRST, then delivers. Never throws for  │
│  a delivery failure.                                                 │
└───────────┬──────────────────────┬───────────────────┬───────────────┘
            │                      │                   │
┌───────────▼─────────┐ ┌──────────▼────────┐ ┌────────▼──────────────┐
│ helpers/push        │ │ helpers/nodeMailer│ │ (phase 4) sms /       │
│  dispatchPush()     │ │  sendMail()       │ │  whatsapp adapters    │
│  fcmClient.sendPush │ │                   │ │                       │
└───────────┬─────────┘ └───────────────────┘ └───────────────────────┘
            │
┌───────────▼──────────────────────────────────────────────────────────┐
│  PROVIDERS   FCM HTTP v1  ·  Gmail SMTP                              │
└──────────────────────────────────────────────────────────────────────┘
```

### The one boundary that matters

`dispatchPush(userIds, message)` is the **only** place that knows where a push token lives.

Today it reads `User.fcmToken`. When we move to a `DeviceToken` collection (§9), **only that one file changes**. Nothing above it — not `notify`, not `notifyAudience`, not a single appointment or subscription notice — is aware that a token store exists.

That is the whole reason callers pass **user ids** and never tokens.

---

## 3. Design rules

These are not style preferences. Each one exists because its opposite has a specific failure mode.

| Rule | Why |
|---|---|
| **Persist first, deliver second** | The in-app row is the record. An FCM outage costs a delivery, not the fact that it happened. |
| **Delivery never throws** | `notify()` runs inside appointment booking. A dead push token must not roll back a confirmed appointment. Every delivery helper returns a result object; none reject. |
| **One row per recipient** | Read state is per person. A broadcast one patient has read and another has not cannot be a single document. |
| **`dedupeKey` for anything a job can re-run** | The reminder sweep runs every few hours. `APPOINTMENT_REMINDER:<appointmentId>:24H` as a unique key makes a re-run a no-op instead of a second alert. |
| **Callers name users, not tokens** | See §2. It is what makes the DeviceToken migration a one-file change. |
| **Unconfigured provider = skip, not crash** | With no `FCM_*` env vars the system still records notifications and sends email. `sendPush` returns `{ skipped: true, reason }`. Local dev needs no Firebase project. |
| **Bounded concurrency everywhere** | A broadcast to 5,000 devices must not open 5,000 sockets. Push batches at 25, email at 5 (Gmail is slow and rate-limited). |
| **Preview count and send count use the same code** | The admin panel's "≈ 1,284 recipients" calls the same `resolveAudience()` the send calls. If they diverged, the number on the confirm dialog would be a lie. |

---

## 4. Data model

### 4.1 `Notification` — one per recipient, the in-app feed

| Field | Notes |
|---|---|
| `userId` | who reads it |
| `audience` | `PATIENT` / `DOCTOR` / `STAFF` / `ADMIN` — derived from the recipient's role, so each app queries its own feed |
| `type` | `NOTIFICATION_TYPES` enum — `ANNOUNCEMENT`, `APPOINTMENT_BOOKED`, … |
| `severity` | `INFO` / `SUCCESS` / `WARNING` / `CRITICAL` — drives the icon colour in the app |
| `title`, `body` | already merge-tag-substituted, per recipient |
| `channels[]` | where it actually landed. `IN_APP` always; `PUSH` / `EMAIL` appended when that delivery succeeds |
| `emailSentAt` / `emailError` / `pushSentAt` / `pushError` | delivery bookkeeping |
| `meta` | free-form; carries `deepLink`, `appointmentId`, `campaignId` |
| `dedupeKey` | unique + sparse. Idempotency for job-driven sends |
| `campaignId` | set when the row came from an admin broadcast, so the campaign can report its own rows |
| `isRead` / `readAt` / `isDeleted` | per-person state |

**Indexes**
```
{ userId: 1, isDeleted: 1, createdAt: -1 }   // the bell list
{ userId: 1, isRead: 1, isDeleted: 1 }       // the unread badge — runs on every app open
{ campaignId: 1 }                            // campaign drill-down
{ dedupeKey: 1 } unique sparse               // idempotency
```

### 4.2 `NotificationCampaign` — one per admin broadcast

The thing the admin panel's History tab lists. Holds what was composed, who it was aimed at, when it goes out, and what happened.

| Field | Notes |
|---|---|
| `title`, `body`, `imageUrl`, `deepLink` | push / in-app content |
| `subject`, `emailBody` | email content |
| `channels[]` | which channels this campaign uses |
| `audience` | the **declarative target**, stored verbatim: `{ mode, roles, userIds, segment, contacts }` |
| `audienceLabel` | human string for the history table |
| `status` | `SCHEDULED` → `SENDING` → `SENT` / `PARTIAL` / `FAILED` / `CANCELLED` |
| `scheduledAt` | null for send-now |
| `stats` | `{ targeted, created, push: {sent, failed, devices}, email: {sent, failed}, duplicates }` |
| `createdBy` | admin user id |
| `startedAt`, `completedAt`, `error` | run bookkeeping |

The audience is stored **declaratively, not as a frozen id list**. A campaign scheduled for next week and aimed at "all active patients" should reach the patients who exist when it runs, not the ones who existed when it was composed.

### 4.3 `NotificationTemplate` — reusable copy

`name`, `description`, `channels[]`, `title`, `body`, `subject`, `emailBody`, `audienceHint`, `createdBy`, `isDeleted`.

Plain CRUD. No delivery logic.

---

## 5. Configuration

### 5.1 FCM (required for push)

Firebase Console → **Project settings → Service accounts → Generate new private key**. That downloads a JSON. Three of its fields go into `.env`:

```env
FCM_PROJECT_ID=your-firebase-project-id
FCM_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
```

⚠️ **The private key must be quoted and keep its literal `\n` escapes.** `.env` files cannot hold real newlines. `configs/fcm.js` converts them back. A key pasted with real line breaks, or without quotes, fails signing with an unhelpful `error:0909006C` and no indication why.

**We deliberately do not use `firebase-admin`.** It pulls tens of megabytes of dependencies to do one OAuth exchange and one HTTP POST. `axios` and `jsonwebtoken` are already in `package.json`, and `helpers/push/fcmClient.js` does the whole thing in ~120 lines: sign a short-lived JWT with the service-account key, trade it for an access token, cache it for an hour, POST to `fcm.googleapis.com/v1/projects/<id>/messages:send`.

**Health check:** `GET /hiranyagarbha/notifications/health` (admin) proves the credentials mint a token without sending anything.

### 5.2 Email

Already configured — `NODEMAILER_EMAIL` / `NODEMAILER_PASSWORD` (Gmail app password). `helpers/nodeMailer/sendMail.js` is the new generic sender; the existing OTP helpers are untouched.

⚠️ Gmail SMTP is ~3–5 s per message and rate-limited (500/day on a free account). **Bulk email is a stop-gap.** Before a broadcast to thousands of addresses, move to a transactional provider (SES / SendGrid / Resend) — that is a change inside `sendMail.js` only.

### 5.3 Limits

`constants.js → NOTIFICATION_LIMITS`:

| Key | Value | Why |
|---|---|---|
| `MAX_RECIPIENTS_PER_DISPATCH` | 10000 | A broadcast bigger than this is almost always a mistargeted filter. Returns 422 with the resolved count so the admin can see what they asked for. |
| `PUSH_CONCURRENCY` | 25 | FCM HTTP v1 has no multicast endpoint — one request per token. |
| `EMAIL_CONCURRENCY` | 5 | Gmail drops connections above this. |
| `INSERT_BATCH_SIZE` | 1000 | `insertMany` chunk size, keeps a single write under the 16 MB BSON cap. |

---

## 6. API surface (Phase 1)

Base: `/hiranyagarbha/notifications`

### Admin — broadcast

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/audience/count` | Resolve a declarative audience → `{ total, label, breakdown, truncated }`. What the compose screen's live count calls. |
| `POST` | `/campaigns` | Create + send (or schedule). Returns **202** immediately with the campaign row; delivery runs in the background. |
| `GET` | `/campaigns` | Paginated history. Filters: `status`, `channel`, `search`, date range. |
| `GET` | `/campaigns/:id` | One campaign with full stats. |
| `PATCH` | `/campaigns/:id/cancel` | Cancel a `SCHEDULED` campaign. 409 if it has already started. |
| `GET` | `/campaigns/stats` | Totals for the dashboard stat cards. |
| `GET/POST/PUT/DELETE` | `/templates…` | Template CRUD. |
| `GET` | `/health` | FCM credential probe. |

**Why 202 and background delivery:** a broadcast to 1,284 devices is ~1,284 HTTPS requests to FCM. At concurrency 25 that is well over a minute — far past any sane HTTP timeout. The campaign row is written synchronously (so the admin immediately sees it in History with status `SENDING`), and the client re-polls while any campaign is in that state.

### Any logged-in user — their own feed

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/my` | Paginated feed for the caller. `?isRead=false` for unread only. |
| `GET` | `/my/unread-count` | Badge count. |
| `PATCH` | `/my/:id/read` | Mark one read. |
| `PATCH` | `/my/read-all` | Mark all read. |
| `DELETE` | `/my/:id` | Soft-delete one from the feed. |

### Device registration

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/device/register` | Body `{ fcmToken, platform? }`. The mobile app calls this **after login** and on every token refresh. |
| `POST` | `/device/unregister` | Clears the caller's token. The app calls this **on logout** — see §9.2. |

---

## 7. Audience resolution

`resolveAudience(target)` turns a declarative description into a concrete recipient list. Four modes, matching the admin UI:

```js
// everyone in a role
resolveAudience({ mode: "ROLE", roles: ["user", "doctor"] })

// a filtered slice of patients or doctors
resolveAudience({
  mode: "SEGMENT",
  segment: { group: "PATIENTS", isActive: true, search: "", fromDate, toDate },
})

// hand-picked
resolveAudience({ mode: "MANUAL", userIds: ["..."] })

// pasted emails / phone numbers
resolveAudience({ mode: "CSV", contacts: { emails: [...], phones: [...] } })
```

Returns:

```js
{
  users: [{ userId, role, name, email, mobile, fcmToken }],
  total,          // matched users
  externalEmails, // CSV emails with no account — email-only, no in-app row possible
  unmatched,      // CSV entries that reach nobody, reported back to the admin
  truncated,      // true if the cap in §5.3 clipped the result
  label,          // "All patients, all doctors"
}
```

**Role ↔ audience mapping** (`ROLES` in `constants.js`):

| `User.role` | Notification audience | Profile collection |
|---|---|---|
| `user` | `PATIENT` | `Patient` (`Patient.userId`) |
| `doctor` | `DOCTOR` | `Doctor` (`Doctor.userId`) |
| `staff` | `STAFF` | — |
| `admin` | `ADMIN` | — |

⚠️ `SEGMENT` mode queries the **profile** collection (`Patient` / `Doctor`) and maps to `userId`, because that is what the admin filtered on in the UI. `ROLE` mode queries `User` directly. They can return slightly different totals — a `User` with role `user` but no `Patient` profile exists during onboarding — and that is correct: "all patients" and "patients matching a filter" are genuinely different questions.

---

## 8. Delivery semantics

### What happens on `POST /campaigns` (send now)

```
1. Validate body (Joi)                                 → 422 on failure
2. resolveAudience(target)                             → 422 if empty or over the cap
3. Create NotificationCampaign  status = SENDING       → respond 202 here
   ─────────────────── response sent ───────────────────
4. runCampaign() in the background:
   a. atomically claim the campaign (guards double-run)
   b. render per-recipient title/body (merge tags)
   c. insertMany Notification rows, unordered, in batches of 1000
   d. dispatchPush() to everyone who got a row and has a token
   e. sendMail() to everyone who got a row and has an email  (if EMAIL selected)
   f. write stats, set status SENT / PARTIAL / FAILED
```

**Unordered `insertMany`** so one duplicate `dedupeKey` does not abandon the rest of the batch.

**Push only goes to recipients who actually got a row on this run.** Someone skipped as a duplicate has already been notified; pushing again is exactly what dedupe exists to prevent.

### Failure classification

| Outcome | Campaign status |
|---|---|
| every row written, no delivery failures | `SENT` |
| rows written, some deliveries failed | `PARTIAL` |
| nothing written, or the run threw | `FAILED` (with `error`) |
| `SCHEDULED` and cancelled before it ran | `CANCELLED` |

### Dead push tokens

`fcmClient` classifies FCM errors. `UNREGISTERED`, `INVALID_ARGUMENT`, `NOT_FOUND` and HTTP 404 mean the token is permanently gone — app uninstalled or token rotated. `dispatchPush` clears `User.fcmToken` for those users rather than retrying them forever. Anything else (a 500, a quota error) is transient and the token is kept.

### Scheduling

`jobs/scheduledCampaigns.js` sweeps every 60 s for `status: SCHEDULED, scheduledAt <= now`, and claims each one with an atomic `findOneAndUpdate({ status: SCHEDULED } → { status: SENDING })`.

**The atomic claim, not the interval, is what makes this safe.** Two server instances both running the sweep will race on the same campaign; exactly one wins the update and the other's `findOneAndUpdate` returns null. No Redis, no lock table, no cron-expression dependency.

Due campaigns are run **sequentially**, not with `Promise.all`. Each one is itself a bounded-concurrency fan-out to thousands of devices, and running five at once multiplies the open socket count by five.

The same sweep reaps abandoned runs: a campaign left in `SENDING` for more than 30 minutes means the process that claimed it died, so it is marked `FAILED` rather than sitting in the history looking busy forever.

---

## 9. Push token storage

### 9.1 Today — `User.fcmToken`

One token per user, on the `User` document. `dispatchPush` reads it, and clears it when FCM rejects it.

**What this cannot do:**

- **Multi-device.** A mother with a phone and a tablet gets the push on whichever registered last. The other device silently receives nothing.
- **Delivery history.** A cleared token leaves no trace, so "why did this user not get it" is unanswerable.
- **Per-platform payloads.** No `platform` field, so Android and iOS get identical payloads.
- **Role-targeted push without a join.** Every push to "all doctors" reads the `User` collection; a denormalised `role` on the token row would not.

### 9.2 Logout must de-register the token

⚠️ **There is no logout endpoint in `routes/auth.js` today.** Until there is, the mobile app calls `POST /notifications/device/unregister` as part of its own logout flow.

This is not optional cleanup. A token left registered after logout means:

- the **next person** to log in on a shared device receives the previous user's notifications, and
- the device keeps receiving pushes for an account nobody is signed into.

When a real `POST /auth/logout` is added, it must call the same `unregisterDevice(userId)` service — not re-implement it.

### 9.3 Migration to a `DeviceToken` collection

**This is the intended end state**, deferred only to keep Phase 1 small.

```js
// models/DeviceToken.js
{
  userId, role,                    // role denormalised → role-targeted push needs no join
  token: { unique: true },         // unique on TOKEN, not (userId, token) — see below
  platform,                        // android | ios | web
  deviceId, deviceName, appVersion,
  isActive, deactivatedAt, deactivatedReason,
  lastSeenAt, lastPushAt, failureCount,
}
```

⚠️ **`token` is unique on its own, not paired with `userId`.** A provider token identifies a *device install*, and an install changes hands — a shared phone, a reinstall, a logout-and-login as someone else. Registering an existing token must **reassign** it, otherwise the previous owner keeps receiving the new owner's notifications.

**Migration steps, in order:**

1. Add `models/DeviceToken.js` and its indexes.
2. Backfill: one row per `User` that has a non-empty `fcmToken` (`scripts/backfillDeviceTokens.js`).
3. Rewrite `helpers/push/dispatchPush.js` to read `DeviceToken` and to deactivate rows instead of clearing a field. **Add the soft-failure counter** — a token that fails `MAX_CONSECUTIVE_FAILURES` (5) times without an explicit provider rejection is deactivated too.
4. Rewrite `services/notifications/registerDevice.js` / `unregisterDevice.js` to upsert / deactivate rows. Keep the same route paths and request bodies so **the mobile app needs no change**.
5. Leave `User.fcmToken` in place for one release, writing to both. Then drop it.

**Nothing else changes.** Not `notify`, not `notifyAudience`, not a single appointment or subscription notice. That is the payoff of the boundary in §2.

---

## 10. Phase plan

### ✅ Phase 1 — Admin bulk broadcast *(done)*

Everything in §4–§8. Channels: **in-app, push, email**. SMS and WhatsApp are declared in the channel enum and shown in the admin UI, but disabled — see Phase 4.

### Phase 2 — Appointments *(next)*

Both ends of every appointment event. All of these are **one-line calls to `notify()`** — no new delivery code.

| Event | → Patient | → Doctor | Type |
|---|---|---|---|
| booked | "Your appointment with Dr. X is confirmed for …" | "New appointment booked by …" | `APPOINTMENT_BOOKED` |
| confirmed | "Dr. X has confirmed your appointment" | — | `APPOINTMENT_CONFIRMED` |
| rescheduled | new time | new time | `APPOINTMENT_RESCHEDULED` |
| cancelled | who cancelled + reason | who cancelled + reason | `APPOINTMENT_CANCELLED` |
| reminder, T-24h | "Tomorrow at 10:30 AM" | "3 appointments tomorrow" (digest) | `APPOINTMENT_REMINDER` |
| reminder, T-1h | "In an hour" | — | `APPOINTMENT_REMINDER` |
| completed | "Consultation complete — view your prescription" | — | `APPOINTMENT_COMPLETED` |

**Implementation shape** — `helpers/notifications/appointmentNotices.js`:

```js
exports.notifyAppointmentBooked = async (appointment) =>
  Promise.all([
    notify({
      userId: appointment.patientUserId,
      audience: AUDIENCE.PATIENT,
      type: TYPES.APPOINTMENT_BOOKED,
      title: "Appointment confirmed",
      body: `Your appointment with ${doctorName} is on ${when}.`,
      deepLink: `app://appointments/${appointment._id}`,
      meta: { appointmentId: appointment._id },
    }),
    notify({
      userId: appointment.doctorUserId,
      audience: AUDIENCE.DOCTOR,
      type: TYPES.APPOINTMENT_BOOKED,
      title: "New appointment",
      body: `${patientName} booked ${when}.`,
      deepLink: `app://appointments/${appointment._id}`,
      meta: { appointmentId: appointment._id },
    }),
  ]);
```

Called from `services/appointments/*` wrapped in `sendQuietly()` — **a notification failure must never roll back a booking.**

⚠️ Reminders run from a job and therefore **need `dedupeKey`**: `APPOINTMENT_REMINDER:<appointmentId>:24H`. Without it, a sweep that runs every 30 minutes sends the same reminder 48 times.

Reminder times are computed in `Asia/Kolkata` (`moment-timezone` is already a dependency), matching how appointment slots are stored.

### Phase 3 — Subscriptions *(started)*

| Event | Type | Trigger | Status |
|---|---|---|---|
| activated | `SUBSCRIPTION_ACTIVATED` | payment captured, or a free / granted plan | ✅ done |
| renewed | `SUBSCRIPTION_RENEWED` | renewal payment captured | with the lifecycle phase |
| cancelled | `SUBSCRIPTION_CANCELLED` | user or admin action | with the lifecycle phase |
| expiring in 7 / 3 / 1 days | `SUBSCRIPTION_EXPIRING` | daily job, `dedupeKey` per day-bucket | with the jobs phase |
| expired | `SUBSCRIPTION_EXPIRED` | daily job | with the jobs phase |

Same shape as phase 2: `helpers/notifications/subscriptionNotices.js`, thin wrappers over `notify()`, called from `services/patientSubscriptions/*` inside `sendQuietly()`.

`SUBSCRIPTION_ACTIVATED` is the one notice in the system that sets `email: true` — a paid purchase deserves a receipt the patient can keep, carrying the plan, the amount and the validity window.

⚠️ Backfills pass `notify: false`. Granting a plan a patient should have had all along is bookkeeping, not news; without the flag, a backfill mails every existing patient at once. See `scripts/backfillFreeBasic.js`.

The remaining rows and the phasing behind them live in [SUBSCRIPTIONS.md](./SUBSCRIPTIONS.md) §9.

### Phase 4 — SMS & WhatsApp

- **SMS** — 2Factor is already a dependency (`TWO_FACTOR_API_KEY`) but only used for OTP. Transactional SMS needs a **DLT-registered sender ID and template** on the account; confirm before building.
- **WhatsApp** — needs a Meta Business account and pre-approved templates. Template variables are positional, so the caller supplies `params` and a message with no params is skipped rather than sent half-filled.

Both slot in as adapters beside `helpers/push/`. `notify()` gains two more gated blocks; **no caller changes**.

### Phase 5 — Per-user preferences

`User.notificationPreferences = { push, email, sms, whatsapp }`, checked in one place (`helpers/notifications/channelPreferences.js`) by both `notify` and `notifyAudience`.

⚠️ The preference governs **delivery only** — the in-app row is always written. And a small `ALWAYS_DELIVER_TYPES` list (appointment cancelled, payment failed) outranks it, because a person muting marketing has not asked to miss the fact that their consultation was called off.

---

## 11. Known gaps / follow-up work

1. **No open/click tracking.** The panel deliberately shows "recorded in-app" rather than an open rate, because nothing reports opens yet. Real numbers need the mobile app to call `PATCH /my/:id/read` when a notification is opened — the endpoint exists, the app does not call it.
2. **Gmail for bulk email.** See §5.2. Move to a transactional provider before any large email broadcast.
3. **No retry for soft failures.** A transient FCM 500 loses that one push. A retry queue is the natural home for this — and the point at which BullMQ + Redis stops being over-engineering.
4. **`MAX_RECIPIENTS_PER_DISPATCH` is a constant.** Should move to a settings document once there is one, so raising it does not need a deploy.
5. **No per-user preferences yet** (Phase 5). Every user currently receives everything.
6. **Push payloads are not personalised.** Merge tags resolve per recipient in the in-app row, but a broadcast sends one payload to all tokens, so the push itself shows the fallback ("Hi there"). Personalising it means one FCM request per person with different text — worth doing only when open rates justify it.
7. **One push token per user.** See §9.1. A second device silently receives nothing until the `DeviceToken` migration.

### Verified in this phase

Run against the live database with a throwaway account, cleaned up afterwards:

- role / segment / manual / pasted-list resolution, and their counts
- an audience of deleted or non-existent ids resolving to zero *before* the confirm dialog sees it
- merge-tag substitution, including the readable fallback for a tag with no value
- one row per recipient, in the feed matching that recipient's role
- unread badge, mark-all-read
- push skipping cleanly with no FCM credentials while the in-app row is still written
- schedule → cancel, and a cancelled campaign refusing to run
- re-registering a token reassigning it away from its previous owner
- an SMS-only send and an empty audience both refused with a 422

---

## 12. File map

```
server/
├── configs/fcm.js                        FCM credentials + isFcmConfigured()
├── constants.js                          NOTIFICATION_* enums, limits, defaults
├── docs/NOTIFICATIONS.md                 this file
├── models/
│   ├── Notification.js                   per-recipient in-app row
│   ├── NotificationCampaign.js           admin broadcast record
│   └── NotificationTemplate.js           reusable copy
├── helpers/
│   ├── push/
│   │   ├── fcmClient.js                  OAuth + send. Never throws.
│   │   ├── dispatchPush.js               userIds → tokens. THE migration boundary.
│   │   └── index.js
│   ├── nodeMailer/sendMail.js            generic mail sender. Never throws.
│   └── notifications/
│       ├── notify.js                     single recipient
│       ├── notifyAudience.js             bulk fan-out
│       ├── resolveAudience.js            declarative target → user list
│       ├── renderTemplate.js             merge tags
│       ├── sendQuietly.js                swallow + log, for domain callers
│       ├── subscriptionNotices.js        phase 3 wrappers (activated)
│       └── index.js                      the public barrel
├── services/notifications/               campaign lifecycle, feed, devices, templates
├── controllers/notifications/            thin, one file per action
├── routes/notifications.js
├── validator/notifications.js
└── jobs/
    ├── scheduledCampaigns.js             60 s sweep, atomic claim
    └── index.js                          started from index.js
```

**Client** — `Client/src/pages/notifications/` + `Client/src/components/notifications/`, wired to the endpoints in §6 through `API_ENDPOINTS.NOTIFICATIONS`.
