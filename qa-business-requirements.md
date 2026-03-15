# Questions & Answers — High-Level Business Requirements

## 1. Feature Summary

The **Questions & Answers (Q&A)** feature adds a public, community-driven knowledge layer to every ad listing on Gimlee. It allows prospective buyers to ask questions about an ad and receive answers from the seller (or, in limited cases, from previous buyers). Answered Q&A pairs become a **permanent, publicly visible knowledge base** attached to the ad, helping future visitors make informed purchase decisions without repeating the same questions.

Think of it as the Amazon-style product Q&A section — not a private messaging channel, but a **public forum scoped to a single ad**.

---

## 2. Actors & Roles

| Actor | Description |
|---|---|
| **Guest** (unauthenticated) | Can **read** all answered questions. Cannot ask or answer. |
| **Authenticated Buyer** | Can **read** all answered questions. Can **ask** new questions (up to a limit). Can **upvote** questions they also want answered. |
| **Previous Buyer** (completed a purchase of this ad) | All Buyer capabilities, plus: can **submit community answers** to other buyers' questions (marked as "Community Answer"). |
| **Seller** (ad owner) | Can **read** all questions (including unanswered). Can **answer** any question. Can **pin** important Q&A pairs. Can **report** inappropriate questions. |
| **Moderator / Admin** | Can **remove** questions or answers that violate platform guidelines. Can **suspend** Q&A privileges for abusive users. |

---

## 3. Core User Stories

### 3.1 Asking a Question
- **Who**: Any authenticated user (except the seller of the ad themselves — they wouldn't ask questions on their own listing).
- **What**: A buyer visits an ad detail page and submits a plain-text question.
- **Constraints**:
    - Maximum **3 unanswered questions per user per ad** to prevent spam.
    - Questions have a character limit (e.g., **500 characters**).
    - Questions must pass basic content moderation (profanity filter, spam detection).
    - Duplicate/near-duplicate detection: warn the user if a very similar question already exists.

### 3.2 Answering a Question
- **Primary Answerer**: The **seller** (ad owner). Their answer is labeled as **"Seller's Answer"** and displayed prominently.
- **Community Answers**: **Previous buyers** who completed a purchase of this specific ad may also submit answers, labeled as **"Community Answer"**. This leverages real-world experience ("I bought this — here's what I found").
- **Constraints**:
    - Only **one seller answer** per question (editable).
    - Up to **3 community answers** per question.
    - Answers have a character limit (e.g., **2000 characters**).

### 3.3 Reading Questions & Answers
- **Visibility of Answered Questions**: Fully **public** — visible to guests, buyers, and all authenticated users. This is essential for SEO and for helping visitors decide without logging in.
- **Visibility of Unanswered Questions**: Visible to **the seller** and **the user who asked** them. **Not visible to the general public or other buyers.** This prevents the ad page from being cluttered with a wall of unanswered noise and avoids a negative perception ("this seller doesn't respond"). Once a seller provides an answer, the pair becomes public.
- **Ordering**:
    - Default sort: **Most upvoted** (most helpful to the community).
    - Secondary sort: **Most recent**.
    - Pinned Q&A pairs always appear at the top.

### 3.4 Upvoting Questions
- Any authenticated user can **upvote** a question (whether answered or not, but they can only see unanswered ones if they're the author).
- Upvotes signal to the seller which questions the community most wants answered.
- One upvote per user per question (toggle on/off).
- The upvote count is publicly visible.

### 3.5 Pinning (Seller Only)
- The seller can **pin** up to **3 Q&A pairs** to the top of the Q&A section.
- Use case: Frequently asked logistical questions (e.g., "Do you ship internationally?", "What payment methods do you accept?") stay visible at the top.

### 3.6 Reporting & Moderation
- Any authenticated user can **report** a question or answer for violating guidelines.
- Moderators can remove content and issue warnings/suspensions.
- Sellers can **hide** (soft-delete) a question, but the action is logged for moderation review to prevent abuse (e.g., sellers hiding legitimate complaints disguised as questions).

---

## 4. Visibility Matrix

| Content State | Guest | Buyer (Auth) | Question Author | Previous Buyer | Seller (Ad Owner) | Moderator |
|---|---|---|---|---|---|---|
| Answered Q&A pair | ✅ Read | ✅ Read | ✅ Read | ✅ Read + Answer | ✅ Read + Pin | ✅ Full |
| Unanswered question | ❌ | ❌ | ✅ Read (own only) | ❌ | ✅ Read + Answer | ✅ Full |
| Hidden (by seller) | ❌ | ❌ | ❌ | ❌ | ✅ Read | ✅ Full |
| Removed (by mod) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Full |

---

## 5. Limits & Anti-Abuse

| Parameter | Value | Rationale |
|---|---|---|
| Max unanswered questions per user per ad | 3 | Prevents single-user spam |
| Max total questions per ad | 100 (soft limit) | Beyond this, only top-voted are shown; rest paginated |
| Question character limit | 500 | Forces concise, focused questions |
| Answer character limit | 2,000 | Allows detailed responses with context |
| Community answers per question | 3 | Keeps the thread manageable |
| Pinned Q&A per ad | 3 | Prevents seller from pinning everything |
| Upvote | 1 per user per question | Standard toggle-vote |
| Cooldown between questions (same user, same ad) | 5 minutes | Rate limiting |

---

## 6. Notifications

| Event | Notified Actor | Channel |
|---|---|---|
| New question on your ad | Seller | In-app + optional push |
| Your question was answered | Question author | In-app + optional push |
| Community answer added | Question author + Seller | In-app |
| Question upvote milestone (5, 10, 25…) | Seller | In-app (nudge to answer) |
| Question/answer reported | Moderator | Admin panel |

---

## 7. Relationship to Other Features

- **Chat (existing)**: Chat is **private, 1-on-1** between buyer and seller. Q&A is **public, community-visible**. They serve different purposes. Buyers should use Chat for negotiation/logistics and Q&A for product-specific questions whose answers benefit everyone.
- **Reviews/Ratings (planned)**: Reviews are post-purchase evaluations. Q&A is pre-purchase inquiry. They're complementary — a future "Seller Reputation Score" could factor in Q&A responsiveness (e.g., "average response time to questions").
- **User Spaces**: A seller's Space could display aggregate Q&A stats ("Answers 95% of questions within 24h") as a trust signal.

---

## 8. Data Model (Conceptual)

```
AdQuestion
├── id: UUID
├── adId: ObjectId (FK → Ad)
├── authorId: ObjectId (FK → User)
├── text: string (max 500)
├── upvoteCount: number
├── isPinned: boolean
├── status: PENDING | ANSWERED | HIDDEN | REMOVED
├── createdAt: timestamp
└── updatedAt: timestamp

Answer
├── id: UUID
├── questionId: UUID (FK → Question)
├── authorId: ObjectId (FK → User)
├── type: SELLER | COMMUNITY
├── text: string (max 2000)
├── createdAt: timestamp
└── updatedAt: timestamp

QuestionUpvote
├── questionId: UUID (FK → Question)
├── userId: ObjectId (FK → User)
└── createdAt: timestamp
```

---

## 9. UI/UX Considerations (for Gimlee)

- **Placement**: Below the ad description and seller's other ads, as currently positioned in the placeholder.
- **Empty State**: Current placeholder ("No questions yet. Be the first to ask!") is appropriate.
- **Card-Based Layout**: Each Q&A pair should be a card (per Gimlee's "Cards Over Tables" principle), with the question as the header and answers nested below.
- **Authentication Gate**: The "Ask a Question" button should prompt login for unauthenticated users (with `state.from` preservation so they return to the ad after login).
- **Seller Badge**: Seller answers should be visually distinguished (e.g., a "Seller" badge with primary color) to build trust.
- **Staggered Animation**: Q&A cards should enter with staggered spring animations consistent with the rest of the page.
- **Pagination**: Use `SmartPagination` (0-indexed) once questions exceed a threshold (e.g., 10 per page).

---

## 10. Success Metrics

- **Seller Response Rate**: % of questions answered within 24h / 48h.
- **Conversion Lift**: Do ads with Q&A have higher purchase conversion than those without?
- **Repeat Question Reduction**: Does the public Q&A reduce duplicate inquiries in private chat?
- **Community Engagement**: Number of community answers and upvotes per ad.

---

## 11. Open Questions for Product Discussion

1. **Should sellers be able to pre-populate FAQ-style Q&A pairs?** (Self-ask-and-answer to proactively address common questions.)
2. **Should Q&A be carried over when an ad is relisted or duplicated?**
3. **Should there be a "Was this answer helpful?" vote on individual answers** (beyond question-level upvotes)?
4. **Internationalization**: Should questions/answers support auto-translation, given Gimlee's multilingual nature (`en-US`, `pl-PL`)?
5. **Markdown support**: Should answers support the platform's `Markdown` component, or stay plain-text to reduce moderation complexity?

---

*Note: The hardcoded "4.9 ★ (128 Questions)" on the seller info card (line ~653 of AdDetailsPage) appears to conflate reviews with questions — this should be separated into distinct "Rating" and "Q&A stats" indicators once both features are implemented.*