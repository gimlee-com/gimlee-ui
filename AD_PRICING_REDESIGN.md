# Ad Pricing Model Redesign & Volatility Protection
## For Frontend Developers & Legal Team

---

## 1. Problem Statement

The current pricing model conflates the **settlement currency** (what the buyer pays in) with the **display price** and the **volatility protection** mechanism. Specifically:

- An ad currently has a single `price` field (e.g., `19.99 ARRR`) and an ambiguous `peggedCurrency` field.
- It is unclear whether `peggedCurrency: "USD"` means "this ad is worth 19.99 **USD** (paid in ARRR at market rate)" or "this ad costs 19.99 **ARRR** and the system monitors USD-equivalent value for volatility protection."
- Sellers cannot accept multiple settlement currencies (e.g., both ARRR and YEC) for a single ad.

---

## 2. New Pricing Model (Business Rules)

### 2.1 Settlement Currencies
A seller selects which **settlement currencies** they accept for a given ad. These are the actual cryptocurrencies the buyer will pay with.

- **Available settlement currencies:** `ARRR` (PirateChain), `YEC` (Ycash)
- **Default selection:** All settlement currencies for which the seller has registered a viewing key.
- **Role gating:** `ARRR` requires the `PIRATE` role; `YEC` requires the `YCASH` role. The seller can only select currencies for which they hold the required role.
- **At least one** settlement currency must be selected to activate an ad.

### 2.2 Two Pricing Modes
A seller chooses **one** of two pricing modes per ad:

#### Mode A — Fixed Crypto Price
The seller sets the price directly in a specific cryptocurrency.

| Aspect | Detail |
|---|---|
| **Price field** | A fixed amount in a settlement currency (e.g., `100 ARRR`) |
| **What the buyer pays** | Exactly the stated amount in that currency |
| **Other settlement currencies** | Buyers paying in a different accepted settlement currency pay the market-rate equivalent at time of purchase |
| **Volatility Protection** | **Not available.** The seller has chosen to price in crypto and accepts the market risk |
| **Use case** | Sellers who think in crypto terms and are comfortable with price swings |

#### Mode B — Pegged (Reference) Price
The seller sets the price in a **reference currency** — any supported currency including fiat (USD, PLN), gold (XAU), or even a crypto (ARRR, YEC, USDT).

| Aspect | Detail |
|---|---|
| **Price field** | An amount in the reference currency (e.g., `50 USD`, `0.5 XAU`, `100 ARRR`) |
| **What the buyer pays** | The real-time equivalent in their chosen settlement currency at time of purchase (e.g., buyer pays `X ARRR` where `X = 50 USD ÷ ARRR/USD rate`) |
| **Volatility Protection** | **Available as an opt-in toggle.** When enabled, the ad is frozen during significant downside volatility of the settlement currency vs. the reference currency |
| **Use case** | Sellers who want price stability relative to a known value anchor |

> **Note:** If the seller pegs to a settlement currency (e.g., reference = ARRR), and the buyer pays in the same currency, the amount is exact. If the buyer pays in a different settlement currency, conversion applies. Volatility protection in this scenario monitors the *other* settlement currencies against the reference.

### 2.3 Partial Freeze Rule (Multi-Currency Resilience)

When a seller accepts **multiple settlement currencies** and has **Volatility Protection** enabled:

> **Core Rule:** The ad remains purchasable for as long as **at least one** accepted settlement currency is **not** frozen. Only the affected currency's payment option is disabled — the ad itself is never fully hidden or deactivated unless *all* settlement currencies are simultaneously frozen.

**Example:** A seller prices an ad at `$50 USD` (pegged) and accepts both `ARRR` and `YEC`. If `ARRR` enters a volatile state:
- ✅ Buyers can still purchase using `YEC` (unaffected).
- ❌ The `ARRR` payment option is disabled with a warning.
- The ad remains fully visible and purchasable.

Only if **both** `ARRR` and `YEC` are frozen simultaneously does the ad become fully unpurchasable. This is a rare edge case (two independent markets crashing at the same time).

**Implication for sellers:** Accepting multiple settlement currencies provides natural resilience against volatility protection interruptions. The platform should surface this benefit during ad creation (e.g., *"Tip: Accepting multiple currencies reduces the chance of your ad being fully suspended during market volatility."*).

### 2.4 Decision Matrix

| Scenario | Price | Settlement | Pricing Mode | Vol. Protection | Freeze Behavior |
|---|---|---|---|---|---|
| Seller wants exactly 100 ARRR | `100 ARRR` | ARRR, YEC | Fixed Crypto | ❌ Not available | Never frozen |
| Seller wants ~$50 worth of crypto | `50 USD` | ARRR, YEC | Pegged | ✅ Optional | Per-currency: if ARRR volatile → ARRR frozen, YEC still buyable |
| Seller wants ~$50, single currency | `50 USD` | ARRR | Pegged | ✅ Optional | If ARRR volatile → fully frozen (no alternatives) |
| Seller wants 0.5 oz gold equivalent | `0.5 XAU` | ARRR | Pegged | ✅ Optional | If ARRR volatile → fully frozen |
| Seller pegs to ARRR, also accepts YEC | `100 ARRR` | ARRR, YEC | Pegged | ✅ (monitors YEC/ARRR) | Per-currency: healthy currencies remain buyable |
| Seller wants max resilience | `50 USD` | ARRR, YEC | Pegged | ✅ On | Only fully frozen if ALL currencies are volatile simultaneously |

---

## 3. Volatility Protection: How It Works

This section provides the **technical detail** behind volatility protection — the detection algorithm, staleness checks, cooldown mechanics, and global state management. Understanding this is essential for implementing the frontend correctly.

### 3.1 Global State Model (Not Per-Ad)

Volatility protection operates as a **global flag per settlement currency**, not as a per-ad status update. This is a critical architectural decision:

- The system tracks whether each settlement currency (ARRR, YEC) is currently in a **NORMAL** or **VOLATILE** state.
- When a currency enters the VOLATILE state, **all** protected ads accepting that currency are affected simultaneously — there is no database update to millions of individual ads.
- The `frozenCurrencies` array in ad responses is **computed at read time** by checking the ad's `settlementCurrencies` against the global volatility state.

This design ensures the system scales to millions of ads without write amplification during market events.

### 3.2 Volatility Detection Algorithm

The platform continuously monitors the price of each settlement currency against **USDT** (as the benchmark stable asset). Detection uses a **rolling window** approach:

**Formula:**
```
downsideDropPct = ((P_max - P_now) / P_max) × 100
```

| Parameter | Default Value | Config Key |
|---|---|---|
| **Threshold** | 5.0% | `gimlee.payments.volatility.downside-threshold` |
| **Rolling Window** | 10 minutes (600s) | `gimlee.payments.volatility.window-seconds` |

**How it works:**
1. Every time a new exchange rate is received (e.g., from MEXC or Bitmart), the system examines all rates for that currency within the rolling window (last 10 minutes).
2. It finds `P_max` — the **highest** price in the window.
3. It computes the percentage drop from `P_max` to the **current** price `P_now`.
4. If the drop exceeds the threshold (5%), the currency enters the **VOLATILE** state.

**Example:**
- At 10:00, ARRR/USDT = $0.50
- At 10:05, ARRR/USDT = $0.52 (new window max)
- At 10:08, ARRR/USDT = $0.48
- Drop = (0.52 - 0.48) / 0.52 = 7.7% → **exceeds 5% threshold** → ARRR enters VOLATILE state

> **Note:** Only **downside** movements trigger protection. A price *increase* of 50% in 10 minutes does not trigger any freeze — this feature exclusively protects sellers from crashes.

### 3.3 Stale Market Data Detection

In addition to volatility, the system detects when exchange rate data becomes **stale** — i.e., when communication with exchange APIs (MEXC, Bitmart) fails and rates are no longer being updated.

| Parameter | Default Value | Config Key |
|---|---|---|
| **Stale Threshold** | 1 hour (3600s) | `gimlee.payments.volatility.stale-threshold-seconds` |

**How it works:**
1. For each settlement currency, the system checks the timestamp of the **most recent** exchange rate in the database.
2. If that timestamp is older than the stale threshold (1 hour), the currency is flagged as **stale**.
3. A stale currency triggers the **same freeze behavior** as volatility — protected ads accepting that currency have their payment method frozen.

**Why this matters:** If exchange APIs go down, the platform cannot accurately convert pegged prices to settlement currency amounts. Allowing purchases with hour-old rates could result in sellers receiving significantly less value than intended. Staleness protection prevents this.

**Recovery:** Unlike volatility (which has a cooldown), stale data recovery is **immediate**. As soon as fresh exchange rate data is received, the stale flag is cleared and trading resumes.

### 3.4 Cooldown & Recovery

After a volatility event ends (price stabilizes back below the threshold), the system does **not** immediately resume trading. Instead, it enters a **cooldown period** to prevent rapid on/off oscillations during choppy markets.

| Parameter | Default Value | Config Key |
|---|---|---|
| **Cooldown Duration** | 30 minutes (1800s) | `gimlee.payments.volatility.cooldown-seconds` |
| **Stabilization Checks** | 3 | `gimlee.payments.volatility.stabilization-checks` |

**Cooldown timeline:**
1. **Volatility detected** → currency enters VOLATILE state → protected ads frozen for that currency.
2. **Price stabilizes** (drop < 5%) → 30-minute cooldown timer begins.
3. During cooldown, the system performs `stabilization-checks` (3) periodic checks to confirm the price remains stable.
4. If the price crashes again during cooldown → cooldown resets.
5. **Cooldown expires + stability confirmed** → currency returns to NORMAL → ads unfrozen.

**Frontend implications:**
- The `cooldownEndsAt` field in the volatility status endpoint tells the frontend when trading **might** resume (it's an estimate — if prices crash again, the cooldown resets).
- Display a countdown timer to give sellers/buyers visibility into when normal trading is expected to resume.

### 3.5 Configuration Summary

All volatility protection parameters are externalized in `application.yaml` under `gimlee.payments.volatility`:

```yaml
gimlee:
  payments:
    volatility:
      downside-threshold: 0.05        # 5% drop triggers freeze
      window-seconds: 600             # 10-minute rolling window
      cooldown-seconds: 1800          # 30-minute cooldown after stabilization
      stabilization-checks: 3         # Number of checks during cooldown
      stale-threshold-seconds: 3600   # 1-hour stale data threshold
```

These values are tunable by the operations team without code changes.

---

## 4. Terms & Conditions: Pricing & Volatility Clause

The following section should be incorporated into the Platform Terms of Service.

---

**Appendix P: Ad Pricing & Automatic Trading Suspension**

**P.1. Pricing Modes**

Gimlee supports two pricing modes for advertisements:

1. **Fixed Crypto Price:** The seller specifies an exact price in a cryptocurrency (e.g., 100 ARRR). The buyer pays this exact amount. The price does not adjust based on market conditions.

2. **Pegged (Reference) Price:** The seller specifies a price in a reference currency (e.g., 50 USD, 0.5 XAU). The buyer pays the market-rate equivalent in their chosen settlement cryptocurrency at the time of purchase. Exchange rates are sourced from multiple providers and updated frequently.

**P.2. Settlement Currencies**

Buyers pay exclusively in supported settlement cryptocurrencies (currently: ARRR, YEC). Sellers select which settlement currencies they accept per ad. At least one settlement currency must be accepted.

**P.3. Volatility Protection (Pegged Pricing Only)**

Sellers using *Pegged Pricing* may optionally enable "Volatility Protection." This feature is **not available** for ads using *Fixed Crypto Pricing*, as those sellers have accepted the inherent market risk.

**P.4. Definitions**
* **Protected Ad:** An ad using *Pegged Pricing* where the seller has explicitly enabled "Volatility Protection."
* **Significant Negative Volatility:** A condition where the market price of a settlement cryptocurrency drops by **5.0% or more** against USDT within a rolling **10-minute window**.
* **Stale Market Data:** A condition where Gimlee has not received a valid exchange rate update for a cryptocurrency for more than **1 hour** (e.g., due to exchange API downtime).

**P.5. Automatic Suspension**

When the system detects *Significant Negative Volatility* or *Stale Market Data* for a settlement cryptocurrency:
1. All *Protected Ads* accepting that cryptocurrency have that specific payment method **Frozen**.
2. The frozen payment method is disabled — buyers cannot purchase using the affected cryptocurrency.
3. **If the ad accepts other non-affected settlement currencies, those remain fully available for purchase.** The ad continues to be listed and purchasable via the unaffected currencies.
4. Only when **all** of an ad's accepted settlement currencies are simultaneously frozen does the ad become fully unpurchasable. Even in this case, the ad remains visible to buyers with a notification explaining the temporary suspension.

**P.6. Cooldown & Recovery**
* **Volatility:** Once the price stabilizes (drop < 5%), the system enters a mandatory **30-minute Cooldown Period**. Trading in the affected currency resumes only after the cooldown expires *and* stability is maintained.
* **Stale Data:** Trading resumes immediately once fresh exchange rate data is received.

**P.7. Seller Override**

Sellers may disable Volatility Protection for individual ads at any time, accepting the risk of selling at potentially unfavorable rates.

---

## 5. Data Model Changes

### 5.1 Ad Domain Model (Before → After)

**Before:**
```kotlin
data class Ad(
    // ...
    val price: CurrencyAmount?,       // e.g., CurrencyAmount(100, ARRR)
    val volatilityProtection: Boolean,
    val peggedCurrency: Currency?,
)
```

**After:**
```kotlin
data class Ad(
    // ...
    val pricingMode: PricingMode,          // FIXED_CRYPTO or PEGGED
    val price: CurrencyAmount?,            // Amount + currency (settlement currency for FIXED, reference currency for PEGGED)
    val settlementCurrencies: Set<Currency>, // Which cryptos the seller accepts (e.g., {ARRR, YEC})
    val volatilityProtection: Boolean,     // Only meaningful when pricingMode == PEGGED
)
```

**New enum:**
```kotlin
enum class PricingMode(val shortName: String) {
    FIXED_CRYPTO("FC"),   // Price is exact in a specific crypto
    PEGGED("PG");         // Price is in a reference currency, converted at purchase time

    companion object {
        fun fromShortName(shortName: String): PricingMode =
            entries.first { it.shortName == shortName }
    }
}
```

### 5.2 Ad Document (MongoDB)

| Field | Key | Type | Notes |
|---|---|---|---|
| Pricing mode | `pm` | String | `"FC"` or `"PG"` |
| Price amount | `pa` | Decimal128 | Numeric price value |
| Price currency | `pc` | String | Currency code (settlement for FC, reference for PG) |
| Settlement currencies | `sc` | Array\<String\> | e.g., `["ARRR", "YEC"]` |
| Volatility protection | `vp` | Boolean | `true` / `false` |

**Removed fields:** `peggedCurrency` (`pgc`) — replaced by the combination of `pricingMode` and `price.currency`.

### 5.3 Interpretation

| `pricingMode` | `price` | `settlementCurrencies` | Meaning |
|---|---|---|---|
| `FIXED_CRYPTO` | `100 ARRR` | `[ARRR, YEC]` | Buyer pays exactly 100 ARRR, or the YEC equivalent at market rate |
| `PEGGED` | `50 USD` | `[ARRR, YEC]` | Buyer pays ARRR or YEC equivalent of $50 at market rate |
| `PEGGED` | `0.5 XAU` | `[ARRR]` | Buyer pays ARRR equivalent of 0.5 oz gold at market rate |

---

## 6. API Contract Changes

### 6.1 Update Ad Request

**Endpoint:** `PUT /api/sales/ads/{adId}`

```json
{
  "title": "Gaming Laptop",
  "description": "High-end gaming laptop, barely used.",
  "pricingMode": "PEGGED",
  "price": 499.99,
  "priceCurrency": "USD",
  "settlementCurrencies": ["ARRR", "YEC"],
  "volatilityProtection": true,
  "categoryId": "60f8f9b3a9d9e8f8a8b8c8d8",
  "location": {
    "cityId": "city-id-123",
    "point": { "latitude": 40.7128, "longitude": -74.0060 }
  },
  "mediaPaths": ["path/to/image1.jpg"],
  "mainPhotoPath": "path/to/image1.jpg",
  "stock": 5
}
```

**Field definitions:**

| Field | Type | Required | Description |
|---|---|---|---|
| `pricingMode` | String | When setting price | `"FIXED_CRYPTO"` or `"PEGGED"` |
| `price` | Decimal | When setting price | Numeric price value (> 0) |
| `priceCurrency` | String | When setting price | Currency code. For `FIXED_CRYPTO`: must be a settlement currency. For `PEGGED`: any supported currency |
| `settlementCurrencies` | String[] | No | Settlement currencies accepted. Defaults to all currencies the user has viewing keys for. Must contain at least one entry. Each must be a settlement currency the user is authorized for |
| `volatilityProtection` | Boolean | No | `true` to enable. Only valid when `pricingMode` is `PEGGED`. Ignored/rejected for `FIXED_CRYPTO` |

**Validation rules:**
- If `pricingMode` is `FIXED_CRYPTO`:
  - `priceCurrency` must be a settlement currency (`ARRR` or `YEC`)
  - `priceCurrency` must be in `settlementCurrencies`
  - `volatilityProtection` must be `false` (or omitted)
- If `pricingMode` is `PEGGED`:
  - `priceCurrency` can be any supported currency (USD, PLN, XAU, ARRR, YEC, USDT)
  - `volatilityProtection` can be `true` or `false`
- `settlementCurrencies` entries must all be settlement currencies the user has roles for

### 6.2 Fixed Crypto Price Example

```json
{
  "pricingMode": "FIXED_CRYPTO",
  "price": 100,
  "priceCurrency": "ARRR",
  "settlementCurrencies": ["ARRR", "YEC"],
  "volatilityProtection": false
}
```
*Buyer pays exactly 100 ARRR. If buyer chooses YEC, they pay the YEC equivalent of 100 ARRR at market rate.*

### 6.3 Pegged Price Example (USD)

```json
{
  "pricingMode": "PEGGED",
  "price": 49.99,
  "priceCurrency": "USD",
  "settlementCurrencies": ["ARRR"],
  "volatilityProtection": true
}
```
*Buyer pays the ARRR equivalent of $49.99. If ARRR crashes >5%, the ad is frozen.*

### 6.4 Pegged Price Example (Gold)

```json
{
  "pricingMode": "PEGGED",
  "price": 0.5,
  "priceCurrency": "XAU",
  "settlementCurrencies": ["ARRR", "YEC"],
  "volatilityProtection": true
}
```
*Buyer pays the crypto equivalent of half a troy ounce of gold.*

---

### 6.5 Ad Response (Seller Dashboard — `AdDto`)

```json
{
  "id": "ad-123",
  "userId": "user-456",
  "title": "Gaming Laptop",
  "pricingMode": "PEGGED",
  "price": { "amount": 499.99, "currency": "USD" },
  "settlementCurrencies": ["ARRR", "YEC"],
  "volatilityProtection": true,
  "frozenCurrencies": ["ARRR"],
  "isBuyable": true,
  "status": "ACTIVE",
  "stock": 5,
  "lockedStock": 1,
  "availableStock": 4,
  "createdAt": "2025-01-20T10:00:00Z",
  "updatedAt": "2025-01-20T12:00:00Z"
}
```

| Field | Type | Description |
|---|---|---|
| `pricingMode` | String | `"FIXED_CRYPTO"` or `"PEGGED"` |
| `price` | Object | `{ amount, currency }` — in FIXED mode this is the crypto price; in PEGGED mode this is the reference price |
| `settlementCurrencies` | String[] | Accepted payment currencies |
| `volatilityProtection` | Boolean | Whether protection is enabled |
| `frozenCurrencies` | String[] | Which settlement currencies are currently frozen due to volatility/staleness. Empty array = fully tradeable |
| `isBuyable` | Boolean | `true` if at least one settlement currency is NOT frozen (or if volatility protection is disabled). Convenience field — equivalent to `frozenCurrencies` not being a superset of `settlementCurrencies` |

> **Important PEGGED nuance:** if `pricingMode = PEGGED` and a settlement currency is the same as the `price.currency` (reference currency), that settlement currency should **not** be marked as frozen. In that case there is no conversion risk for that payment path.

### 6.6 Ad Discovery Response (Buyer View — `AdDiscoveryDetailsDto`)

```json
{
  "id": "ad-123",
  "title": "Gaming Laptop",
  "pricingMode": "PEGGED",
  "price": { "amount": 499.99, "currency": "USD" },
  "settlementCurrencies": ["ARRR", "YEC"],
  "settlementPrices": [
    { "amount": 999.98, "currency": "ARRR" },
    { "amount": 4999.90, "currency": "YEC" }
  ],
  "preferredPrice": { "amount": 499.99, "currency": "USD" },
  "frozenCurrencies": ["ARRR"],
  "isBuyable": true,
  "availableStock": 4,
  "description": "High-end gaming laptop...",
  "location": { "cityId": "city-123", "cityName": "New York" }
}
```

| Field | Type | Description |
|---|---|---|
| `settlementPrices` | Object[] | Real-time converted prices in each accepted settlement currency. `null` entries if conversion unavailable |
| `preferredPrice` | Object | Price converted to buyer's preferred display currency. Convenience field for UI display |
| `frozenCurrencies` | String[] | Which settlement currencies are frozen. If a settlement currency is frozen, disable the "Buy with [currency]" button for that currency |

**UI Logic:**
- Show a "Pay with" selector listing `settlementCurrencies`.
- For each currency in `frozenCurrencies`, disable that payment option and show: *"Temporarily unavailable due to market conditions."*
- **The ad remains buyable as long as at least one settlement currency is NOT in `frozenCurrencies`.** Only disable the "Buy" button entirely when `frozenCurrencies` contains ALL entries from `settlementCurrencies`.
- If ALL settlement currencies are frozen, show: *"All payment methods temporarily suspended due to market volatility. Please check back soon."*
- Show `settlementPrices` next to each payment option so the buyer knows exactly what they'll pay.

### 6.7 Purchase Request

**Endpoint:** `POST /api/purchases`

```json
{
  "items": [
    {
      "adId": "ad-123",
      "quantity": 1,
      "unitPrice": 999.98
    }
  ],
  "currency": "ARRR"
}
```

**Validation changes:**
- `currency` must be one of the ad's `settlementCurrencies`.
- `unitPrice` is validated against the **current market-rate equivalent** (with a configurable tolerance window to account for price fluctuations between page load and purchase).
- If `currency` is in `frozenCurrencies` for any item, the purchase is rejected with HTTP 409 and a descriptive error.
- On price mismatch conflict, backend should return the **current expected unit prices for all requested items in the selected payment currency** so the client can refresh cart values and retry without extra round-trips.

### 6.8 Allowed Currencies Endpoint

**Endpoint:** `GET /api/sales/ads/allowed-currencies`

Returns currencies the user can use as settlement currencies (based on their roles/viewing keys).

```json
{
  "settlementCurrencies": [
    { "code": "ARRR", "name": "Pirate Chain" },
    { "code": "YEC", "name": "Ycash" }
  ],
  "referenceCurrencies": [
    { "code": "USD", "name": "US Dollar" },
    { "code": "PLN", "name": "Polish Zloty" },
    { "code": "XAU", "name": "Gold (Troy Ounce)" },
    { "code": "USDT", "name": "Tether" },
    { "code": "ARRR", "name": "Pirate Chain" },
    { "code": "YEC", "name": "Ycash" }
  ]
}
```

**UI Logic:**
- Use `settlementCurrencies` to populate the "Accepted payment methods" checkboxes.
- Use `referenceCurrencies` to populate the "Price currency" dropdown when `pricingMode` is `PEGGED`.
- When `pricingMode` is `FIXED_CRYPTO`, restrict the "Price currency" dropdown to `settlementCurrencies` only.

---

### 6.9 Volatility Status Endpoint

**Endpoint:** `GET /api/payments/volatility/status`  
**Authentication:** Public (no auth required)  
**Polling recommended:** Every 30–60 seconds when displaying site-wide banners or seller dashboard.

```json
[
  {
    "currency": "ARRR",
    "isVolatile": true,
    "isStale": false,
    "startTime": "2025-01-20T10:00:00Z",
    "cooldownEndsAt": "2025-01-20T10:30:00Z",
    "currentDropPct": 0.065,
    "maxPriceInWindow": 10.50
  },
  {
    "currency": "YEC",
    "isVolatile": false,
    "isStale": false,
    "startTime": null,
    "cooldownEndsAt": null,
    "currentDropPct": 0.01,
    "maxPriceInWindow": 2.10
  }
]
```

| Field | Type | Description |
|---|---|---|
| `currency` | String | Settlement currency code |
| `isVolatile` | Boolean | `true` if the currency is in VOLATILE state (price crashed ≥5% in 10min) |
| `isStale` | Boolean | `true` if exchange rate data is older than 1 hour |
| `startTime` | String? | ISO 8601 timestamp when the volatile/stale state began. `null` if currency is healthy |
| `cooldownEndsAt` | String? | ISO 8601 timestamp when the cooldown period is expected to end. `null` if not in cooldown. **Note:** this is an estimate — if prices crash again, the cooldown resets |
| `currentDropPct` | Decimal | Current percentage drop from window maximum (e.g., `0.065` = 6.5%). Always present, even when < threshold |
| `maxPriceInWindow` | Decimal | Highest price observed in the rolling window. Useful for context |

**UI Logic — Site-Wide Banner:**
- Poll this endpoint periodically (30–60s).
- If **any** currency has `isVolatile: true`:
  → Show a site-wide warning banner: *"⚠️ High volatility detected for [CURRENCY]. Protected ads may be temporarily frozen."*
- If **any** currency has `isStale: true`:
  → Show: *"⚠️ Exchange rate data for [CURRENCY] is outdated. Trading in [CURRENCY] is temporarily suspended for safety."*
- If a currency is in cooldown (`isVolatile: false` but `cooldownEndsAt` is in the future):
  → Show: *"[CURRENCY] is recovering. Trading expected to resume at [cooldownEndsAt]."*
  → Display a countdown timer.
- If all currencies are healthy: hide the banner.

---

## 7. Frontend Implementation Guide

### 7.1 Ad Creation / Edit Form

**Step 1 — Settlement Currencies (checkboxes)**
```
Accept payments in:
  [✓] ARRR (Pirate Chain)
  [✓] YEC (Ycash)
```
Pre-check currencies for which the user has viewing keys. Disable currencies the user lacks roles for (grey out with tooltip: "Register a viewing key to enable").

**Step 2 — Pricing Mode (radio buttons)**
```
How would you like to set your price?

  (○) Fixed Crypto Price
      I want to set an exact price in a cryptocurrency.
      → Dropdown: [ARRR ▾]  Input: [100      ]

  (●) Pegged Price
      I want to set a price in a stable currency. Buyers pay the equivalent in crypto.
      → Dropdown: [USD ▾]   Input: [49.99    ]
      
      [ ] Enable Volatility Protection
          Your ad will be temporarily frozen if the crypto market drops sharply.
```

**Validation guidance:**
- `FIXED_CRYPTO` selected → currency dropdown shows only settlement currencies. Volatility Protection checkbox is hidden.
- `PEGGED` selected → currency dropdown shows all reference currencies. Volatility Protection checkbox is visible.
- If `PEGGED` + `volatilityProtection` = true → the system monitors all selected settlement currencies against the reference currency.

### 7.2 Buyer Ad View

**Partial freeze (ARRR volatile, YEC healthy) — ad remains purchasable:**
```
┌──────────────────────────────────────────────┐
│  Gaming Laptop                               │
│  $499.99 USD (pegged price)                  │
│                                              │
│  Pay with:                                   │
│  ┌────────────────────────────────────────┐  │
│  │ 🏴‍☠️ ARRR  ~999.98 ARRR  [Suspended]  │  │ ← Greyed out, frozen
│  │   ⚠️ Temporarily unavailable           │  │
│  │      (market volatility)               │  │
│  │                                        │  │
│  │ 💰 YEC   ~4999.90 YEC  [Buy Now ✓]   │  │ ← Still active!
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

**All currencies frozen — ad visible but not purchasable:**
```
┌──────────────────────────────────────────────┐
│  Gaming Laptop                               │
│  $499.99 USD (pegged price)                  │
│                                              │
│  ⚠️ All payment methods temporarily          │
│    suspended due to market volatility.       │
│    Please check back soon.                   │
│                                              │
│  Pay with:                                   │
│  ┌────────────────────────────────────────┐  │
│  │ 🏴‍☠️ ARRR  ~999.98 ARRR  [Suspended]  │  │
│  │ 💰 YEC   ~4999.90 YEC  [Suspended]  │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

For `FIXED_CRYPTO` ads:
```
┌──────────────────────────────────────┐
│  Rare Coin                           │
│  100 ARRR (fixed price)              │
│                                      │
│  Pay with:                           │
│  ┌────────────────────────────────┐  │
│  │ 🏴‍☠️ ARRR  100.00 ARRR   [Buy] │  │ ← Exact amount
│  │ 💰 YEC   ~500.00 YEC   [Buy] │  │ ← Market-rate equivalent
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### 7.3 Seller Dashboard — My Ads

| Title | Price | Mode | Settlement | Protection | Status |
|---|---|---|---|---|---|
| Gaming Laptop | $499.99 USD | Pegged | ARRR, YEC | 🛡️ On | 🟡 ARRR frozen · YEC active |
| Rare Coin | 100 ARRR | Fixed | ARRR, YEC | — | 🟢 Active |
| Vintage Watch | $1,200 USD | Pegged | ARRR | 🛡️ On | 🔴 Fully frozen (ARRR) |
| Gold Ring | $300 USD | Pegged | ARRR, YEC | 🛡️ On | 🟢 Active |

**Status logic:**
- 🟢 **Active** — all settlement currencies are healthy. Ad is fully purchasable.
- 🟡 **Partially frozen** — at least one settlement currency is frozen, but **the ad is still purchasable** via other currencies. Show which currencies are affected.
- 🔴 **Fully frozen** — all settlement currencies are frozen. The ad cannot be purchased until at least one recovers.

### 7.4 Handling Purchase Errors

| HTTP Code | Status Slug | Meaning | UI Action |
|---|---|---|---|
| 409 | `PURCHASE_CURRENCY_FROZEN` | The **specific** settlement currency chosen by the buyer is frozen | Show: "This payment method is temporarily unavailable due to market volatility. Try another payment method." Offer the buyer alternative settlement currencies that are still available. |
| 400 | `PURCHASE_CURRENCY_NOT_ACCEPTED` | Ad doesn't accept this currency | Show: "This ad does not accept payment in [currency]." |
| 400 | `PURCHASE_PRICE_MISMATCH` | Price changed since page load | Show: "The price has changed. Please refresh and try again." Return current prices in error data |
| 400 | `PURCHASE_INSUFFICIENT_STOCK` | Not enough stock | Show: "Only [N] items available." |

> **Important:** A `PURCHASE_CURRENCY_FROZEN` error does NOT mean the ad is unpurchasable — it means the buyer chose a frozen currency. The buyer should be prompted to select a different (healthy) settlement currency if available.

---

## 8. Migration Notes

### 8.1 Database Migration
Existing ads (all currently `FIXED_CRYPTO` effectively) need a one-time migration:

- Set `pm` (pricingMode) = `"FC"` for all existing ads.
- Set `sc` (settlementCurrencies) = `[<current price currency>]` for all existing ads.
- Remove the `pgc` (peggedCurrency) field.
- Ads that had `volatilityProtection = true` with the old model should be reviewed — since they were `FIXED_CRYPTO` effectively, `vp` should be set to `false`.

### 8.2 Backward Compatibility
- The old `peggedCurrency` field is removed from the API. Frontend must migrate to the new `pricingMode` + `priceCurrency` + `settlementCurrencies` fields.
- During a transition period, the backend can accept the old format and map it internally, but this should be time-limited.

---

## 9. Summary of Key Differences from Current Model

| Aspect | Current | New |
|---|---|---|
| Price currency | Must be settlement (ARRR/YEC) | Any supported currency (mode-dependent) |
| Settlement currencies per ad | Implied from price currency (single) | Explicit multi-select |
| Pegged currency | Separate ambiguous field | Eliminated — replaced by `pricingMode` + `price.currency` |
| Volatility protection | Available for all ads | Only available for `PEGGED` mode |
| Buyer payment options | Single currency | Multiple settlement currencies per ad |
| Price shown to buyer | Single price | Reference price + live settlement prices per currency |
| Frozen state | All-or-nothing per ad | Per-settlement-currency granularity |
