# Plan Videos

YouTube videos shown to patients by **plan** (Basic / Pro / Elite) and **trimester**. Admins paste a link — nothing is uploaded. Admin UI: Gallery → **YouTube** tab (`/gallery/videos`).

---

## 1. Who sees what

| Viewer | Videos |
|---|---|
| Not logged in | Basic videos |
| Logged in, no live plan (none, expired) | Basic videos |
| Live **Basic** plan | Basic videos |
| Live **Pro** plan | Basic videos + Pro videos for the trimesters covered |
| Live **Elite** plan | Basic videos + Elite videos for the trimesters covered |

**Trimesters covered** come from the trimester the plan was bought in — that one and every one after it:

| Plan bought in | Covers |
|---|---|
| `all` / `first` | first, second, third |
| `second` | second, third |
| `third` | third |

Rules that fall out of this:

- **Basic videos ignore trimesters.** Everyone can see them, including people with no trimester at all.
- **Elite does not include Pro.** A video reaches a tier only when that tier is ticked on it. Tick both for both.
- **"Live" is `getEntitlement`'s rule**: `ACTIVE` or `CANCELLED` with `endDate` still ahead. The 3 grace days after `endDate` drive the renewal banner but do not extend access — same as every other gated screen.
- **Renewing in a later trimester narrows access.** The renewal row carries the trimester it was bought in, so a Pro patient who renews in the third trimester sees third-trimester Pro videos from then on.
- **Matched by tier, not package id.** If the admin deletes the Pro package and creates a new one, videos ticked for the new Pro still reach patients who bought the old one. A video whose only package was deleted reaches nobody (the admin card says so).

Inactive and deleted videos never reach the feed.

---

## 2. Data model — `PlanVideo` (`planvideos`)

```js
{
  name:          String,   // 3–30, unique among live videos (case-insensitive)
  description:   String,   // 1–300, kept as typed — links in it are case-sensitive
  videoUrl:      String,   // as pasted, https:// added if missing — for "Open in YouTube"
  youtubeId:     String,   // parsed from videoUrl; players and thumbnails use it
  packageIds:    [ObjectId → Subscription],  // ≥1, main packages only (no bonus courses)
  trimesters:    ["first" | "second" | "third"],  // ≥1; a whole-pregnancy video lists all three
  subCategoryId: ObjectId → SubCategory,     // optional, must belong to the Gallery category
  isActive, isDeleted, createdAt, updatedAt
}
```

Not a `Banner`: gallery banners are served publicly, so a separate collection means no gallery query can ever leak a plan video.

Accepted links: `youtube.com/watch?v=`, `youtu.be/`, `/shorts/`, `/live/`, `/embed/`, on `www.`, `m.`, `music.` and `youtube-nocookie.com`. The `https://` is optional. Anything else is refused with `Paste a valid YouTube video link`. The video must be **Public or Unlisted** on YouTube to play.

---

## 3. API

Mounted at `/hiranyagarbha/plan-videos`.

### Admin — `isAdmin`

| Method | Path | Body / query |
|---|---|---|
| `POST` | `/create` | `{ name, description, videoUrl, packageIds[], trimesters[], subCategoryId?, isActive? }` |
| `GET` | `/getAll` | `page, limit (≤100), search, categoryId, subCategoryId, packageId, trimester, isActive, fromDate, toDate, sortBy (createdAt\|updatedAt\|name), sortOrder` |
| `GET` | `/get/:id` | — |
| `PUT` | `/update/:id` | any create field; `subCategoryId: null` clears it |
| `DELETE` | `/delete/:id` | soft delete |

The body is JSON — there are no files. Admin responses include `isActive` on the video and on each package.

### Patient app — public, token optional

| Method | Path | Query |
|---|---|---|
| `GET` | `/feed` | `page, limit (≤100), search, categoryId, subCategoryId, trimester, sortBy, sortOrder` |
| `GET` | `/feed/:id` | — |

- **No `Authorization` header** (or `Bearer null` / `Bearer undefined`) → treated as logged out.
- **A patient token** → their plan is applied (section 1).
- **An expired or malformed token** → `401` / `403`, like every other route, so the app can send the user to log in instead of silently showing them less.
- `trimester` here filters *within* what the viewer may see; it never widens it.
- `/feed/:id` answers `404 Video not found` both for a missing video and for one the viewer's plan does not include — it never confirms a locked video exists.
- No match answers `404` (`No any planvideo found`), as every paginated list in this API does.

`GET /feed` response:

```json
{
  "success": true,
  "message": "Videos fetched successfully",
  "data": {
    "total": 3, "totalPages": 1, "page": 1, "limit": 10,
    "access": { "tier": "pro", "trimesters": ["second", "third"] },
    "data": [
      {
        "_id": "…",
        "name": "Prenatal Yoga",
        "description": "Gentle flow. Full playlist: https://youtube.com/playlist?list=…",
        "videoUrl": "https://youtu.be/dQw4w9WgXcQ",
        "youtubeId": "dQw4w9WgXcQ",
        "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        "packages": [{ "_id": "…", "name": "Pro", "tier": "pro" }],
        "trimesters": ["second", "third"],
        "subCategory": { "_id": "…", "name": "yoga" },
        "category": { "_id": "…", "name": "gallery" },
        "createdAt": "2026-10-22T05:12:00.000Z"
      }
    ]
  }
}
```

`access.tier` is `null` when logged out; `access.trimesters` is empty unless a Pro or Elite plan applies. To play a video, embed `https://www.youtube-nocookie.com/embed/<youtubeId>` (send a referrer — YouTube refuses embeds without one) or open `videoUrl`.

`GET /patient-subscriptions/my/entitlement` now also returns `trimester`.

---

## 4. File map

```
models/PlanVideo.js
helpers/youtube/                  link → video id (mirrored in Client/src/utils/youtube.js)
validator/planVideos.js           limits mirrored in Client/src/constants/planVideo.js
middlewares/optionalJwtToken.js   public route, patient token optional
services/planVideos/
  access.js                       section 1 as a Mongo filter
  pipeline.js                     filters, lookups, admin vs feed fields
  references.js                   unique name, main packages, gallery subcategory
  create / update / delete / getPlanVideo / getAllPlanVideos / getPlanVideoFeed
controllers/planVideos/
routes/planVideos.js
```
