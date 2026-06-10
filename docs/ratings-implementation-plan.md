# Frontend Implementation Plan: Ratings & Reviews System

> **Status:** Ready for implementation
> **Date:** 2026-06-04 (updated 2026-06-04)
> **Backend ADR:** `~/projects/gimlee-backend/docs/adr/0004-user-ratings-and-reviews.md`
> **Backend Response:** `~/projects/gimlee-backend/docs/adr/0004-frontend-response.md`
> **API Specs:** `http://localhost:12060/api/v3/api-docs/ratings` + `admin`

---

## 1. Gap Resolution — All Resolved ✅

All original gaps have been addressed by the backend team:

| # | Original Gap | Status | Resolution |
|---|---|---|---|
| G1 | All rating endpoints returned `type: "object"` with no typed response schemas | ✅ Fixed | `@ApiResponse` annotations added to all 15 endpoints. Response DTOs confirmed (see §3). |
| G2 | No admin rating moderation endpoints | ✅ Fixed | `AdminRatingController` at `/admin/ratings` with 3 endpoints (hide, restore, list reported). Requires `SUPPORT` role. |
| G3 | No public "reviews written by user" endpoint | ✅ Fixed | `GET /ratings/user/{userId}/written` — returns paginated PUBLISHED ratings by the specified user. |
| G4 | Missing buyer partial index | ✅ Fixed | V002 Flyway migration added. |
| G5 | Eligibility sweeper not wired | ✅ Fixed | `@Scheduled` runs every 5 min (configurable). |
| G6 | Missing i18n messages for moderation | ✅ Fixed | Added in both `messages.properties` and `messages_pl.properties`. |

### Remaining Notes from Backend Response

- **User data join is client-side.** Rating responses contain `raterId` / `rateeId` as plain user IDs only. No `raterUsername`, `raterAvatarUrl`, etc. The frontend must fetch user details separately and join client-side. This is intentional — keeps the rating subsystem decoupled.
- **Eligibility endpoint returns only PENDING.** Once consumed, the eligibility is removed from the list. To check if a context was already rated, attempt `POST /ratings` — a `RATING_ALREADY_EXISTS` (409) confirms it.
- **Snapshot always included.** Both `GET /ratings/user/{userId}` and `GET /ratings/mine` return the same shape with full snapshot. Client-side redaction of sensitive fields (e.g., `unitPrice`) for non-owner views is the frontend's responsibility.
- **Timestamps are server-side epoch micros.** Compare against `Date.now() * 1000` for edit-window / cooldown / dwell calculations. No separate server-time endpoint needed.
- **Eligibility consumed status short-name is `"CSD"`** (not `"CONSUMED"`).

---

## 2. Complete API Endpoint Map

### RatingController (`/ratings`) — 12 endpoints

| Method | Path | Auth | Response Shape | Key Error Codes |
|--------|------|------|----------------|-----------------|
| `POST` | `/ratings` | `USER` | `StatusResponseDto` (data: `RatingResponseDto`) | `RATING_INVALID_SCORE`, `RATING_BODY_NOT_SANITIZED`, `ELIGIBILITY_NOT_FOUND`, `RATING_ALREADY_EXISTS`, `RATING_DWELL_NOT_ELAPSED` |
| `PATCH` | `/ratings/{ratingId}` | `USER` | `StatusResponseDto` (data: `RatingResponseDto`) | `RATING_INVALID_SCORE`, `RATING_BODY_NOT_SANITIZED`, `RATING_NOT_AUTHORIZED`, `RATING_NOT_FOUND`, `RATING_EDIT_WINDOW_CLOSED` |
| `DELETE` | `/ratings/{ratingId}` | `USER` | `StatusResponseDto` | `RATING_NOT_AUTHORIZED`, `RATING_NOT_FOUND` |
| `POST` | `/ratings/{ratingId}/supplements` | `USER` | `StatusResponseDto` (data: `RatingResponseDto`) | `RATING_BODY_NOT_SANITIZED`, `RATING_NOT_AUTHORIZED`, `RATING_NOT_FOUND`, `RATING_SUPPLEMENT_TOO_SOON`, `RATING_SUPPLEMENT_LIMIT_REACHED` |
| `PATCH` | `/ratings/{ratingId}/supplements/{supplementId}` | `USER` | `StatusResponseDto` (data: `RatingResponseDto`) | `RATING_BODY_NOT_SANITIZED`, `RATING_NOT_AUTHORIZED`, `RATING_NOT_FOUND`, `RATING_EDIT_WINDOW_CLOSED` |
| `POST` | `/ratings/{ratingId}/response` | `USER` | `StatusResponseDto` (data: `RatingResponseDto`) | `RATING_BODY_NOT_SANITIZED`, `RATING_NOT_AUTHORIZED`, `RATING_NOT_FOUND` |
| `GET` | `/ratings/public/{ratingId}` | — | `StatusResponseDto` (data: `RatingResponseDto`) | `RATING_NOT_FOUND` |
| `GET` | `/ratings/user/{userId}` | — | `Page<RatingResponseDto>` | — |
| `GET` | `/ratings/user/{userId}/written` | — | `Page<RatingResponseDto>` | — |
| `GET` | `/ratings/mine` | `USER` | `Page<RatingResponseDto>` | — |
| `GET` | `/ratings/eligibility` | `USER` | `Page<EligibilityResponseDto>` | — |
| `GET` | `/ratings/aggregate/{userId}` | — | `StatusResponseDto` (data: `RatingAggregateResponseDto`) | `RATING_NOT_FOUND` |

### AdminRatingController (`/admin/ratings`) — 3 endpoints

| Method | Path | Auth | Response Shape | Key Error Codes |
|--------|------|------|----------------|-----------------|
| `GET` | `/admin/ratings/reported` | `SUPPORT` | `Page<RatingResponseDto>` | — |
| `POST` | `/admin/ratings/{ratingId}/hide` | `SUPPORT` | `StatusResponseDto` (data: `RatingResponseDto`) | `RATING_NOT_FOUND`, `RATING_ALREADY_HIDDEN` |
| `POST` | `/admin/ratings/{ratingId}/restore` | `SUPPORT` | `StatusResponseDto` (data: `RatingResponseDto`) | `RATING_NOT_FOUND` |

### Complete Error Status Codes

| Status Code | HTTP | Description |
|-------------|------|-------------|
| `RATING_CREATED` | 201 | Rating submitted successfully |
| `RATING_UPDATED` | 200 | Rating updated successfully |
| `RATING_DELETED` | 200 | Rating deleted |
| `RATING_SUPPLEMENT_ADDED` | 200 | Supplement added |
| `RATING_RESPONSE_ADDED` | 200 | Ratee response added |
| `RATING_HIDDEN` | 200 | Rating hidden by moderation |
| `RATING_RESTORED` | 200 | Rating restored to public view |
| `RATING_NOT_FOUND` | 404 | Rating not found |
| `ELIGIBILITY_NOT_FOUND` | 404 | No pending eligibility found |
| `RATING_ALREADY_EXISTS` | 409 | Rating already exists for this context |
| `RATING_EDIT_WINDOW_CLOSED` | 409 | Free-edit window has elapsed |
| `RATING_DWELL_NOT_ELAPSED` | 409 | Dwell period not yet elapsed |
| `RATING_SUPPLEMENT_TOO_SOON` | 409 | Supplement cooldown not yet elapsed |
| `RATING_SUPPLEMENT_LIMIT_REACHED` | 409 | Max supplements reached |
| `RATING_ALREADY_HIDDEN` | 409 | Rating is already hidden |
| `RATING_BODY_NOT_SANITIZED` | 400 | Content contains disallowed markup |
| `RATING_INVALID_SCORE` | 400 | Score must be 1–5 |
| `RATING_INVALID_BODY` | 400 | Body is invalid |
| `RATING_NOT_AUTHORIZED` | 403 | Not authorized for this action |

---

## 3. Confirmed TypeScript Types (`src/ratings/types/ratings.ts`)

Based on the backend team's confirmed DTOs:

```typescript
// --- Enums / Constants ---
export type RepKind = 'SEL' | 'BUY';
export type RatingStatus = 'PUB' | 'HID' | 'DEL';
export type EligibilityStatus = 'PND' | 'CSD';  // CSD = consumed (short-name)
export type ContextType = 'ORDER'; // extensible

// --- Embedded: Snapshot ---
export interface RatingSnapshotItemDto {
  adId: string;
  name: string;          // ad title at transaction time
  quantity: number;
  unitPrice: string;     // Decimal128 string
  currency: string;
  thumbPath: string | null;
}

export interface RatingSnapshotDto {
  refType: string;       // e.g. "ORDER_ITEMS"
  items: RatingSnapshotItemDto[];
}

// --- Embedded: Supplement ---
export interface SupplementResponseDto {
  id: string;
  body: string;          // markdown
  status: RatingStatus;
  editableUntil: number; // epoch micros
  createdAt: number;     // epoch micros
}

// --- Embedded: Ratee Reply (named to avoid collision with RatingResponseDto) ---
export interface RateeReplyDto {
  body: string;
  createdAt: number;     // epoch micros
  updatedAt: number;     // epoch micros
}

// --- Rating (full response from API) ---
export interface RatingResponseDto {
  id: string;
  contextType: string;   // e.g. "ORDER"
  contextId: string;     // e.g. purchase ID
  repKind: RepKind;
  raterId: string;
  rateeId: string;
  score: number;         // 1–5
  title: string | null;
  body: string | null;   // markdown
  photoPaths: string[] | null;
  snapshot: RatingSnapshotDto | null;
  status: RatingStatus;
  edited: boolean;
  editableUntil: number; // epoch micros
  supplements: SupplementResponseDto[] | null;
  response: RateeReplyDto | null;  // ratee's reply
  helpfulCount: number;
  createdAt: number;     // epoch micros
  updatedAt: number;     // epoch micros
  publishedAt: number | null;
}

// --- Eligibility ---
export interface EligibilityResponseDto {
  id: string;
  contextType: string;
  contextId: string;
  raterId: string;
  rateeId: string;
  repKind: RepKind;
  status: EligibilityStatus;
  activeFrom: number;    // epoch micros — dwell end
  expiresAt: number;     // epoch micros — hard-delete time
  snapshot: RatingSnapshotDto | null;
  createdAt: number;     // epoch micros
}

// --- Reputation Aggregate ---
export interface RatingAggregateResponseDto {
  rateeId: string;
  repKind: RepKind;
  count: number;
  average: number;
  dist: Record<string, number>;  // {"1": 2, "2": 1, "3": 5, "4": 12, "5": 30}
  lastRatingAt: number | null;   // epoch micros
}

// --- Pagination wrappers ---
// Note: OpenAPI returns PagedModel with content: object[].
// The frontend must cast to the correct typed array.
export interface PageRatingResponseDto {
  content: RatingResponseDto[];
  page: PageMetadata;
}

export interface PageEligibilityResponseDto {
  content: EligibilityResponseDto[];
  page: PageMetadata;
}

// --- Request DTOs (from OpenAPI — confirmed) ---
export interface CreateRatingRequestDto {
  contextType: ContextType;
  contextId: string;
  score: number;          // 1-5, required
  title?: string;         // max 200
  body?: string;          // max 5000, sanitized markdown
  photoPaths?: string[];  // max 5
}

export interface EditRatingRequestDto {
  score: number;          // required
  title?: string;
  body?: string;
  photoPaths?: string[];
}

export interface AddSupplementRequestDto {
  body: string;           // max 5000, sanitized markdown, required
}

export interface AddRatingResponseRequestDto {
  body: string;           // max 5000, sanitized markdown, required
}
```

### ⚠️ Naming Note

The backend uses `RatingResponseDto` for the full rating object AND `RatingResponseResponseDto` for the ratee's reply embedded within it. To avoid confusion in the frontend:
- **`RatingResponseDto`** = the full rating (matches backend name)
- **`RateeReplyDto`** = the embedded ratee reply (renamed from backend's `RatingResponseResponseDto` for clarity)

---

## 4. Service Layer (`src/ratings/services/ratingService.ts`)

```typescript
import { apiClient } from '../../services/apiClient';
import type {
  CreateRatingRequestDto, EditRatingRequestDto,
  AddSupplementRequestDto, AddRatingResponseRequestDto,
  RatingResponseDto, EligibilityResponseDto, RatingAggregateResponseDto,
  PageRatingResponseDto, PageEligibilityResponseDto,
  RepKind,
} from '../types/ratings';

export const ratingService = {
  // --- Write operations (USER) ---
  createRating: (req: CreateRatingRequestDto) =>
    apiClient.post<{ data: RatingResponseDto }>('/ratings', req),

  editRating: (ratingId: string, req: EditRatingRequestDto) =>
    apiClient.patch<{ data: RatingResponseDto }>(`/ratings/${ratingId}`, req),

  deleteRating: (ratingId: string) =>
    apiClient.delete<void>(`/ratings/${ratingId}`),

  addSupplement: (ratingId: string, req: AddSupplementRequestDto) =>
    apiClient.post<{ data: RatingResponseDto }>(`/ratings/${ratingId}/supplements`, req),

  editSupplement: (ratingId: string, supplementId: string, req: AddSupplementRequestDto) =>
    apiClient.patch<{ data: RatingResponseDto }>(`/ratings/${ratingId}/supplements/${supplementId}`, req),

  addResponse: (ratingId: string, req: AddRatingResponseRequestDto) =>
    apiClient.post<{ data: RatingResponseDto }>(`/ratings/${ratingId}/response`, req),

  // --- Read operations ---
  getRatingsReceived: (userId: string, repKind: RepKind = 'SEL', page = 0, size = 20) =>
    apiClient.get<PageRatingResponseDto>(
      `/ratings/user/${userId}?repKind=${repKind}&page=${page}&size=${size}`
    ),

  getRatingsWrittenByUser: (userId: string, page = 0, size = 20) =>
    apiClient.get<PageRatingResponseDto>(
      `/ratings/user/${userId}/written?page=${page}&size=${size}`
    ),

  getRating: (ratingId: string) =>
    apiClient.get<{ data: RatingResponseDto }>(`/ratings/public/${ratingId}`),

  getMyRatings: (page = 0, size = 20) =>
    apiClient.get<PageRatingResponseDto>(`/ratings/mine?page=${page}&size=${size}`),

  getPendingEligibility: (page = 0, size = 20) =>
    apiClient.get<PageEligibilityResponseDto>(`/ratings/eligibility?page=${page}&size=${size}`),

  getUserReputation: (userId: string, repKind: RepKind = 'SEL') =>
    apiClient.get<{ data: RatingAggregateResponseDto }>(
      `/ratings/aggregate/${userId}?repKind=${repKind}`
    ),

  // --- Admin operations (SUPPORT) ---
  getReportedRatings: (page = 0, size = 20) =>
    apiClient.get<PageRatingResponseDto>(`/admin/ratings/reported?page=${page}&size=${size}`),

  hideRating: (ratingId: string) =>
    apiClient.post<{ data: RatingResponseDto }>(`/admin/ratings/${ratingId}/hide`, {}),

  restoreRating: (ratingId: string) =>
    apiClient.post<{ data: RatingResponseDto }>(`/admin/ratings/${ratingId}/restore`, {}),
};
```

### Response Unwrapping Note

Mutation endpoints return `StatusResponseDto` with the rating in the `data` field:
```json
{ "success": true, "status": "RATING_CREATED", "data": { /* RatingResponseDto */ } }
```

Read-list endpoints return `PagedModel` directly:
```json
{ "content": [ /* RatingResponseDto[] */ ], "page": { /* PageMetadata */ } }
```

Aggregate endpoint returns `StatusResponseDto` with the aggregate in `data`:
```json
{ "success": true, "status": "...", "data": { /* RatingAggregateResponseDto */ } }
```

---

## 5. User Data Join Strategy

Since ratings only contain `raterId` / `rateeId` (no usernames/avatars), the frontend needs a strategy for resolving user details:

### Approach: Batch User Lookup

Create a utility/hook that resolves user IDs to `UserSummaryDto` (username + avatarUrl):

```typescript
// src/ratings/hooks/useUserLookup.ts
// - Accepts an array of user IDs
// - Fetches user details (from existing user/profile endpoints)
// - Returns a Map<string, UserSummaryDto>
// - Caches results to avoid redundant fetches
```

**Where this is needed:**
- `RatingCard` — resolve rater username/avatar for display
- `EligibilityCard` — resolve ratee username/avatar
- `UserSpacePage` reputation section — resolve rater details for latest reviews
- Admin reported ratings list — resolve both rater and ratee

**Alternative considered:** Fetching user details individually per card. Rejected due to N+1 problem on paginated lists.

---

## 6. Module Structure

```
src/ratings/
├── types/
│   └── ratings.ts              # All DTOs, enums, request/response types
├── services/
│   └── ratingService.ts        # API client wrapper (see §4)
├── components/
│   ├── StarRating/             # Interactive + display star rating
│   │   ├── StarRating.tsx
│   │   ├── StarRating.stories.tsx
│   │   └── StarRating.module.scss
│   ├── ReputationBadge/        # Compact score display (e.g., "4.7 ★ (23)")
│   │   ├── ReputationBadge.tsx
│   │   ├── ReputationBadge.stories.tsx
│   │   └── ReputationBadge.module.scss
│   ├── ReputationSummary/      # Full summary: avg, histogram, count
│   │   ├── ReputationSummary.tsx
│   │   ├── ReputationSummary.stories.tsx
│   │   └── ReputationSummary.module.scss
│   ├── RatingCard/             # Single review card (display)
│   │   ├── RatingCard.tsx
│   │   ├── RatingCard.stories.tsx
│   │   └── RatingCard.module.scss
│   ├── RatingForm/             # Create/edit rating form (modal)
│   │   ├── RatingForm.tsx
│   │   ├── RatingForm.stories.tsx
│   │   └── RatingForm.module.scss
│   ├── SupplementForm/         # Add/edit supplement form
│   │   ├── SupplementForm.tsx
│   │   └── SupplementForm.module.scss
│   ├── ResponseForm/           # Ratee response form
│   │   ├── ResponseForm.tsx
│   │   └── ResponseForm.module.scss
│   └── EligibilityCard/        # Pending eligibility card with countdown
│       ├── EligibilityCard.tsx
│       ├── EligibilityCard.stories.tsx
│       └── EligibilityCard.module.scss
├── pages/
│   ├── PendingReviewsPage.tsx  # "Reviews to write" (eligibility list)
│   ├── MyReviewsPage.tsx       # "Reviews I've written"
│   ├── UserReviewsPage.tsx     # Public reviews for a user
│   └── RatingDetailPage.tsx    # Single rating detail (deep link)
├── hooks/
│   ├── useReputation.ts        # Fetch + cache reputation aggregate
│   ├── useRatingLifecycle.ts   # Edit window / supplement cooldown timers
│   └── useUserLookup.ts        # Batch resolve user IDs → usernames/avatars
└── utils/
    └── ratingTimeUtils.ts      # Epoch micros ↔ display time helpers
```

---

## 7. Shared Components

### 7.1 `StarRating` — The Core Building Block

Two modes:
- **Display mode**: Shows filled/half/empty stars, read-only. Used in cards, badges, summaries.
- **Interactive mode**: Clickable stars with hover preview. Used in forms. Uses spring animations on selection (per AGENTS.md: `stiffness: 400, damping: 40`).

Props: `value: number`, `maxStars?: number` (default 5), `size?: 'sm'|'md'|'lg'`, `interactive?: boolean`, `onChange?: (value: number) => void`, `className?: string`

### 7.2 `ReputationBadge` — Compact Inline Display

Compact component for embedding in profiles, cards, etc. Shows: `★ 4.7 (23)` with the average score, star icon, and review count. Color-coded by score tier.

Props: `aggregate: RatingAggregateResponseDto`, `size?: 'sm'|'md'`, `className?: string`

### 7.3 `ReputationSummary` — Full Reputation Panel

Full summary shown on profile pages. Includes:
- Large average score with stars
- Total count
- Star distribution histogram (horizontal bars for 5★→1★)
- RepKind toggle (Seller / Buyer tabs)

Props: `userId: string`, `initialRepKind?: RepKind`, `className?: string`

### 7.4 `RatingCard` — Review Display

Card-based layout (per AGENTS.md: "Cards Over Tables"). Shows:
- Rater avatar + username + date (resolved via `useUserLookup`)
- Star rating
- Title (if present)
- Body (rendered via `Markdown` component)
- Photo gallery (via `Image` component with progressive loading)
- Snapshot items (item names + thumbnails; prices only for owner/admin — client-side redaction)
- "Verified purchase" badge (context: ORDER)
- "Edited" indicator
- Supplements section (collapsible, each with date + markdown body)
- Ratee response (highlighted differently)
- Action buttons: Report (via `ReportButton` with `targetType="RATING"`), Edit/Delete (own ratings only), Hide/Restore (admin/support only)

Context-aware projection (client-side):
- **Public view**: item names + thumbnails only (redact `unitPrice`, `quantity`, `adId`)
- **Owner view** (rater or ratee): full snapshot with prices/quantities
- **Admin/Support view**: full snapshot + report count + moderation actions

### 7.5 `RatingForm` — Create/Edit

Modal form (using UIkit Modal with `stack: true` when opened from other modals). Fields:
- Star rating selector (interactive `StarRating`)
- Title input (max 200 chars)
- Body textarea (markdown, max 5000 chars) — use existing `MarkdownEditor`
- Photo upload (max 5, reuse Ad media pipeline)
- Client-side sanitization before submit (defense-in-depth with server validation)
- Edit window countdown timer (when editing)

Form validation:
- Score: required, 1-5
- Title: optional, max 200
- Body: optional, max 5000
- Photos: max 5

Error handling (map backend status codes to user-friendly messages):
- `RATING_DWELL_NOT_ELAPSED` → "You'll be able to review this on {date}"
- `RATING_EDIT_WINDOW_CLOSED` → "The edit window has closed"
- `RATING_BODY_NOT_SANITIZED` → "Please simplify your formatting — avoid raw HTML"
- `RATING_ALREADY_EXISTS` → "You've already reviewed this transaction"
- `ELIGIBILITY_NOT_FOUND` → "No review opportunity found for this transaction"
- Generic fallback: `t('ratings.errors.generic')`

### 7.6 `EligibilityCard` — Pending Review Card

Card showing a pending review opportunity:
- Counterparty avatar + username (resolved via `useUserLookup`)
- Item snapshot (names + thumbnails — public projection)
- Status:
  - "Available now" (when `activeFrom <= Date.now() * 1000`)
  - "Available in X days" (dwell countdown, when `activeFrom > now`)
  - "Expires in X days" (when close to `expiresAt`)
- CTA button: "Write Review" (enabled only when `activeFrom <= now`)

### 7.7 `SupplementForm` / `ResponseForm`

Smaller forms for appending supplements and ratee responses. Both use markdown input with the same sanitization constraints. Supplement form shows remaining supplement count.

---

## 8. Page-Level Integration

### 8.1 UserSpacePage (`/u/:userName`) — Reputation Section

**Changes to `src/spaces/pages/UserSpacePage.tsx`:**

Add a reputation section between the header and the ads grid:

```
┌──────────────────────────────────────┐
│         GeometricAvatar              │
│         username                     │
│         PresenceBadge                │
│         ReportButton                 │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │  Reputation Summary            │  │
│  │  [Seller ★ 4.7 (23)] [Buyer…] │  │  ← tabs for SEL/BUY
│  │  ████████████░░ 5★: 15        │  │
│  │  ████░░░░░░░░ 4★: 5           │  │
│  │  ...                           │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  Latest Reviews                │  │
│  │  RatingCard × 3 (latest)      │  │
│  │  [See all reviews →]          │  │
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤
│  Ads Grid (existing)                 │
└──────────────────────────────────────┘
```

- Fetch `getUserReputation(userId, 'SEL')` on mount
- Fetch `getRatingsReceived(userId, 'SEL', 0, 3)` for latest 3 reviews
- Resolve rater usernames via `useUserLookup`
- Tab switcher for Seller/Buyer reputation
- "See all reviews" → links to `/u/:userName/reviews`

### 8.2 PurchaseDetailPage (`/purchases/:id`) — Rating CTA

**Changes to `src/purchases/pages/PurchaseDetailPage.tsx`:**

For purchases with `status === 'COMPLETE'`:
- Check eligibility list to determine if user has a pending or consumed eligibility for this purchase
- If pending eligibility exists and `activeFrom <= now`: show "Rate this transaction" CTA button → opens `RatingForm`
- If pending eligibility exists and `activeFrom > now`: show "You can review this on {date}" with countdown
- If no pending eligibility: already rated — optionally fetch and show the submitted rating inline

### 8.3 New Route: Pending Reviews (`/profile/reviews/pending`)

Add to the Profile sub-router (`ProfilePages.tsx`):

```
/profile/reviews/pending  →  PendingReviewsPage
```

This page shows all pending eligibilities (paginated via `GET /ratings/eligibility`), split into:
- **Actionable** (`activeFrom <= now`): ready to write
- **Upcoming** (`activeFrom > now`): with countdown to when they become active

Each card is an `EligibilityCard` with a "Write Review" CTA that opens the `RatingForm` modal.

### 8.4 New Route: My Reviews (`/profile/reviews`)

Add to the Profile sub-router:

```
/profile/reviews  →  MyReviewsPage
```

Paginated list of ratings written by the current user (`GET /ratings/mine`). Returns all statuses (PUB, HID, DEL) — the author's own view. Each card shows:
- The rating (score, title, body, snapshot with full details)
- The counterparty (ratee) with link to their space
- Edit/Delete actions (if within edit window and status is PUB)
- Supplement/Response actions (based on lifecycle state)
- Status indicator for HID/DEL ratings

### 8.5 New Route: User Reviews Received (`/u/:userName/reviews`)

Public page showing all reviews received by a user:

```
/u/:userName/reviews  →  UserReviewsPage
```

Full paginated list with `ReputationSummary` at top and `RatingCard` list below. Filterable by `repKind` (SEL/BUY) via URL search params.

### 8.6 New Route: User Reviews Written (`/u/:userName/reviews/written`)

Public page showing all reviews written by a user:

```
/u/:userName/reviews/written  →  UserReviewsWrittenPage
```

Uses `GET /ratings/user/{userId}/written`. Similar layout to received reviews but without the reputation summary.

### 8.7 New Route: Rating Detail (`/ratings/:ratingId`)

Deep-linkable detail page for a single rating. Shows full `RatingCard` with all supplements, response, and snapshot.

---

## 9. Admin Integration

### 9.1 New Admin Route: Reported Ratings (`/admin/ratings`)

Add to the Admin sub-router (`AdminPages.tsx`):

```
/admin/ratings  →  AdminRatingsPage
```

Paginated list of ratings with `reportCount > 0` (via `GET /admin/ratings/reported`), sorted by report count descending. Each row shows:
- Rating summary (score, title, body excerpt)
- Rater / ratee usernames (resolved via `useUserLookup`)
- Report count badge
- Status badge (PUB / HID / DEL)
- Actions: Hide / Restore

### 9.2 Admin Rating Detail / Actions

Within the admin ratings page or report detail page:
- **Hide button**: Calls `POST /admin/ratings/{ratingId}/hide`. Handle `RATING_ALREADY_HIDDEN` gracefully.
- **Restore button**: Calls `POST /admin/ratings/{ratingId}/restore`.
- Confirmation dialog before hiding (UIkit modal with `stack: true`).

### 9.3 Report Detail — RATING Target Snapshot

**Changes to `src/admin/components/TargetSnapshotRenderer/`:**

Add a case for `targetType === 'RATING'` that renders:
- The rating content (score, title, body)
- The rater and ratee usernames (resolved via `useUserLookup`)
- The item snapshot (what was purchased)
- Link to the full rating detail page (`/ratings/:ratingId`)

### 9.4 Report Type Badges

**Changes to `src/admin/components/ReportTypeBadge/`:**

Add `RATING` to the enum and styling (already in backend `ReportTargetType`).

### 9.5 Admin User Detail — Reputation Section

**Changes to `src/admin/pages/users/AdminUserDetailPage.tsx`:**

Add a reputation section showing:
- Seller reputation aggregate (count, avg, distribution) via `getUserReputation(userId, 'SEL')`
- Buyer reputation aggregate via `getUserReputation(userId, 'BUY')`
- Recent ratings received (both kinds)

### 9.6 Admin Navigation

**Changes to `src/admin/components/AdminSubNav.tsx`:**

Add a "Ratings" tab for SUPPORT+ roles, linking to `/admin/ratings`.

---

## 10. Navigation & Route Changes

### App.tsx — New top-level routes:
```
/u/:userName/reviews           →  UserReviewsPage (lazy)
/u/:userName/reviews/written   →  UserReviewsWrittenPage (lazy)
/ratings/:ratingId             →  RatingDetailPage (lazy)
```

### ProfilePages.tsx — New sub-routes:
```
/profile/reviews           →  MyReviewsPage
/profile/reviews/pending   →  PendingReviewsPage
```

### AdminPages.tsx — New sub-route:
```
/admin/ratings  →  AdminRatingsPage  (SUPPORT+ role)
```

### Navbar / Sidebar — Add navigation entries:
- Profile section: "My Reviews" link (with pending count badge)
- Admin section: "Ratings" tab (for SUPPORT+ roles)

---

## 11. i18n Keys (`src/i18n.ts`)

New translation namespace `ratings`:

```
ratings.pendingReviews          — "Pending Reviews" / "Oczekujące oceny"
ratings.myReviews               — "My Reviews" / "Moje oceny"
ratings.writeReview             — "Write a Review" / "Napisz ocenę"
ratings.editReview              — "Edit Review" / "Edytuj ocenę"
ratings.deleteReview            — "Delete Review" / "Usuń ocenę"
ratings.deleteConfirm           — "Are you sure you want to delete this review?" / "Czy na pewno chcesz usunąć tę ocenę?"
ratings.score                   — "Score" / "Ocena"
ratings.title                   — "Title" / "Tytuł"
ratings.body                    — "Your review" / "Twoja recenzja"
ratings.photos                  — "Photos" / "Zdjęcia"
ratings.submit                  — "Submit Review" / "Wyślij ocenę"
ratings.update                  — "Update Review" / "Zaktualizuj ocenę"
ratings.verifiedPurchase        — "Verified Purchase" / "Zweryfikowany zakup"
ratings.edited                  — "Edited" / "Edytowano"
ratings.supplement              — "Update" / "Aktualizacja"
ratings.addSupplement           — "Add an update" / "Dodaj aktualizację"
ratings.respond                 — "Respond" / "Odpowiedz"
ratings.addResponse             — "Respond to this review" / "Odpowiedz na tę ocenę"
ratings.reputation              — "Reputation" / "Reputacja"
ratings.sellerReputation        — "Seller Reputation" / "Reputacja sprzedawcy"
ratings.buyerReputation         — "Buyer Reputation" / "Reputacja kupującego"
ratings.noReviews               — "No reviews yet" / "Brak recenzji"
ratings.seeAll                  — "See all reviews" / "Zobacz wszystkie recenzje"
ratings.latestReviews           — "Latest Reviews" / "Najnowsze recenzje"
ratings.dwellWait               — "You'll be able to review this on {{date}}" / "Będziesz mógł wystawić ocenę {{date}}"
ratings.editWindowClosed        — "The edit window has closed" / "Okno edycji zostało zamknięte"
ratings.supplementTooSoon       — "You can add an update after {{date}}" / "Będziesz mógł dodać aktualizację po {{date}}"
ratings.supplementLimitReached  — "Maximum number of updates reached" / "Osiągnięto maksymalną liczbę aktualizacji"
ratings.expired                 — "This review opportunity has expired" / "Ta szansa na recenzję wygasła"
ratings.expiresIn               — "Expires in {{time}}" / "Wygasa za {{time}}"
ratings.availableIn             — "Available in {{time}}" / "Dostępne za {{time}}"
ratings.reviewsCount            — "{{count}} review" / "{{count}} reviews" (with pluralization)
ratings.reportedRatings         — "Reported Ratings" / "Zgłoszone oceny"
ratings.hideRating              — "Hide Rating" / "Ukryj ocenę"
ratings.restoreRating           — "Restore Rating" / "Przywróć ocenę"
ratings.hideConfirm             — "Are you sure you want to hide this rating?" / "Czy na pewno chcesz ukryć tę ocenę?"
ratings.alreadyHidden           — "This rating is already hidden" / "Ta ocena jest już ukryta"
ratings.writtenBy               — "Reviews written by {{username}}" / "Recenzje napisane przez {{username}}"
ratings.receivedBy              — "Reviews received by {{username}}" / "Recenzje otrzymane przez {{username}}"
ratings.errors.generic          — "Something went wrong with your review" / "Coś poszło nie tak z Twoją recenzją"
ratings.errors.notSanitized     — "Please simplify your formatting — avoid raw HTML" / "Proszę uprościć formatowanie — unikaj surowego HTML"
ratings.errors.alreadyExists    — "You've already reviewed this transaction" / "Już wystawiłeś ocenę za tę transakcję"
ratings.errors.notEligible      — "No review opportunity found for this transaction" / "Nie znaleziono możliwości wystawienia oceny dla tej transakcji"
ratings.errors.notAuthorized    — "You are not authorized for this action" / "Nie masz uprawnień do tej akcji"
```

---

## 12. Implementation Phases

### Phase 1: Foundation (Types + Service + Core Components)
1. Define all TypeScript types in `src/ratings/types/ratings.ts` (see §3)
2. Implement `ratingService.ts` (see §4)
3. Implement `ratingTimeUtils.ts` (epoch micros ↔ display helpers)
4. Implement `useUserLookup` hook (see §5)
5. Build `StarRating` component (display + interactive modes)
6. Build `ReputationBadge` component
7. Build `ReputationSummary` component
8. Add all i18n keys (see §11)

### Phase 2: Rating Lifecycle Components
9. Build `RatingForm` (create + edit modes with validation + error handling)
10. Build `RatingCard` (display with context-aware projections + client-side snapshot redaction)
11. Build `EligibilityCard` (with dwell countdown using `Date.now() * 1000`)
12. Build `SupplementForm` + `ResponseForm`
13. Build `useRatingLifecycle` hook (timers for edit windows, cooldowns)

### Phase 3: Pages
14. `PendingReviewsPage` — eligibility list with countdowns
15. `MyReviewsPage` — authored reviews with actions (all statuses)
16. `UserReviewsPage` — public reviews received by a user
17. `UserReviewsWrittenPage` — public reviews written by a user
18. `RatingDetailPage` — deep-linked single rating

### Phase 4: Integration
19. Integrate reputation section into `UserSpacePage`
20. Integrate rating CTA into `PurchaseDetailPage`
21. Add profile navigation links ("My Reviews" with pending badge)
22. Add routes to `App.tsx`, `ProfilePages.tsx`

### Phase 5: Admin
23. Add `RATING` case to `TargetSnapshotRenderer`
24. Add `RATING` to `ReportTypeBadge`
25. Add reputation section to `AdminUserDetailPage`
26. Create `AdminRatingsPage` (reported ratings list with hide/restore)
27. Add "Ratings" tab to `AdminSubNav` (SUPPORT+ role)
28. Add admin route to `AdminPages.tsx`

### Phase 6: Polish
29. Storybook stories for all new components
30. Unit tests for service layer + hooks
31. Accessibility audit (star rating keyboard nav, ARIA labels)
32. Mobile responsiveness pass

---

## 13. Design Decisions Summary

| Decision | Rationale |
|---|---|
| Client-side user data join | Backend intentionally omits usernames/avatars from rating docs to stay decoupled. Batch lookup via `useUserLookup` hook. |
| Client-side snapshot redaction | Backend returns full snapshot to all callers. Frontend redacts `unitPrice`, `quantity`, `adId` for non-owner public views. |
| `Date.now() * 1000` for time comparisons | All timestamps are epoch micros. No server-time endpoint. Client clock is sufficient for display logic. |
| `RateeReplyDto` rename | Backend's `RatingResponseResponseDto` is confusing. Renamed to `RateeReplyDto` in frontend for clarity. |
| Eligibility status `"CSD"` | Backend uses short-name `"CSD"` for consumed (not `"CONSUMED"`). Must match exactly. |
| Mutation responses unwrapped from `StatusResponseDto.data` | Write endpoints wrap the rating in `StatusResponseDto`. Read-list endpoints return `PagedModel` directly. |
| Error handling via `status` field | All error codes are in `StatusResponseDto.status`. Map to i18n keys in the frontend. |
