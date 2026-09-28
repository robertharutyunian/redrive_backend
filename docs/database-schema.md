# ReDrive Database Schema

Status as of 2026-09-26: `brands`, `tires`, and `inventory` are implemented and migrated (see
`src/brands/entities/brand.entity.ts`, `src/tires/entities/tire.entity.ts`,
`src/inventory/entities/inventory.entity.ts`, and the migrations under `src/database/migrations/`).

`users`, `orders`, `order_items`, `emails`, `payment`, `lg_payment`, `refund`, and `lg_refund` all have
entity files, enums, and constants built (`src/users/`, `src/orders/`, `src/order-items/`,
`src/emails/`, `src/payment/`, `src/lg-payment/`, `src/refund/`, `src/lg-refund/`) and are registered
in `database.module.ts` / `data-source.ts`, but **no migration has been generated or run for them
yet** — none of these tables exist in the database.

Indexing is called out per-table below and summarized in [Indexes](#indexes). Postgres auto-indexes
primary keys and `unique` columns (including `OneToOne` join columns, which TypeORM makes `unique`
by default) — everything else needs an explicit `@Index()` or it stays an unindexed full-scan target.

## Implemented

### brands
| column | type | notes |
|---|---|---|
| id | serial | PK |
| name | varchar | searched via `ILike('%name%')` in `brands.service.ts` — leading-wildcard, a plain B-tree index doesn't help this; would need a trigram (`pg_trgm`) index instead. Not adding one now. |
| logo_url | varchar | nullable |
| country | varchar | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

### tires
| column | type | notes |
|---|---|---|
| id | serial | PK |
| brand_id | int | FK -> brands.id — indexed (queried via `brand.id = :brandId` in `tires.service.ts`) |
| model | varchar | |
| season | enum | summer / winter / all_season — filtered in tire search (`tires.service.ts`), but only 3 values; same low-selectivity reasoning as `featured` below — not indexed |
| width | int | indexed — part of composite, see below |
| profile | int | indexed — part of composite, see below |
| radius | int | indexed — part of composite, see below |
| load_index | int | |
| speed_rating | varchar | |
| extra_load | boolean | default false |
| featured | boolean | added via `adding_featured_to_tires` migration; filtered in tire search but low cardinality (true/false) — a plain index has weak selectivity here, skip unless `featured` rows become a small fraction of the catalog (then a partial index `WHERE featured = true` would be the right tool) |
| created_at | timestamp | |
| updated_at | timestamp | |

`width`, `profile`, `radius` are consistently queried together (standard tire-size search, e.g.
205/55R16) — a single **composite index on `(width, profile, radius)`** serves that pattern better
than three separate single-column indexes. Implemented as `@Index(['width', 'profile', 'radius'])`
on the `Tire` class in `tire.entity.ts`.

### inventory (1:1 with tires)
Kept as its own table on purpose — future home for discounts / price history without touching the
catalog table.
| column | type | notes |
|---|---|---|
| id | serial | PK |
| tire_id | int | FK -> tires.id, unique (1:1) — **already indexed**, TypeORM puts a unique constraint on `OneToOne` join columns |
| quantity | int | filtered via `inStock` (`quantity > 0` / `= 0`); low priority — table is joined off an already-filtered `tires` query, skip for now |
| origin_price | numeric(10,2) | cost — **never exposed by the public API**, catalog endpoints only return `unit_price` |
| unit_price | numeric(10,2) | filtered via `minPrice`/`maxPrice` range; same reasoning as `quantity` — low priority for now |
| created_at | timestamp | |
| updated_at | timestamp | |

## Entities built, migration pending

### users
| column | type | notes |
|---|---|---|
| id | serial | PK |
| fname | varchar | |
| lname | varchar | |
| phone | varchar | nullable |
| email | varchar | unique — auto-indexed |
| username | varchar | unique — auto-indexed |
| password | varchar | bcrypt hash |
| created_at | timestamp | |
| updated_at | timestamp | |

### orders
`payment_method` and `payment_status` are **not** columns here — that state now lives on `payment`
rows (see [Decisions](#decisions-made-along-the-way)).
| column | type | notes |
|---|---|---|
| id | serial | PK |
| user_id | int | FK -> users.id — indexed (order history per user) |
| delivery_method | enum | e.g. pickup / courier |
| delivery_address | varchar | |
| delivery_instructions | varchar | nullable |
| status | enum | pending / processing / shipped / delivered / cancelled — indexed (admin views filtering by status) |
| total_price | numeric(10,2) | stored snapshot, not recomputed from order_items |
| created_at | timestamp | |
| updated_at | timestamp | |

### order_items
| column | type | notes |
|---|---|---|
| id | serial | PK |
| order_id | int | FK -> orders.id — indexed (fetch items for an order) |
| tire_id | int | FK -> tires.id — indexed (sales history / reporting per tire) |
| quantity | int | |
| unit_price | numeric(10,2) | snapshot of price at order time |
| total_price | numeric(10,2) | quantity * unit_price |
| created_at | timestamp | |
| updated_at | timestamp | |

### emails
| column | type | notes |
|---|---|---|
| id | serial | PK |
| user_id | int | FK -> users.id — indexed |
| order_id | int | FK -> orders.id, **nullable** (not all emails relate to an order) — indexed |
| type | enum | order_confirmation / invoice / password_reset / shipping_update |
| sent_at | timestamp | nullable — set when the email actually goes out, may lag `created_at` |
| invoice_url | varchar | nullable, Cloudinary URL to generated invoice |
| created_at | timestamp | |
| updated_at | timestamp | |

### payment
One row per payment *attempt* against an order — supports retries after a failed charge (1:many,
not 1:1). Current status only; history of what happened lives in `lg_payment`.
| column | type | notes |
|---|---|---|
| id | serial | PK |
| order_id | int | FK -> orders.id (many payments per order) — indexed, real `@ManyToOne` relation to `Order` (was a bare column before `Order` existed) |
| amount | numeric(10,2) | snapshot — what this attempt charged |
| method | enum | card / cash / ... |
| status | enum | pending / succeeded / failed — indexed (reconciliation: "all pending/failed payments") |
| gateway | varchar | nullable — e.g. stripe, cash-on-delivery |
| gateway_reference | varchar | nullable — external transaction/charge id — unique index: looked up on every incoming webhook ("find the payment matching this gateway transaction id"), and a given external transaction id should only ever map to one payment row |
| created_at | timestamp | |
| updated_at | timestamp | |

### lg_payment
Append-only audit trail of everything that happened to a payment — status transitions, gateway
webhook callbacks, errors. Not a current-state table; every row is one event.
| column | type | notes |
|---|---|---|
| id | serial | PK |
| payment_id | int | FK -> payment.id — indexed (fetch full history for a payment) |
| event_type | enum | initiated / gateway_callback / status_changed / error |
| previous_status | enum | nullable — status before this event |
| new_status | enum | nullable — status after this event |
| message | varchar | nullable — human-readable detail (e.g. decline reason) |
| raw_payload | jsonb | nullable — raw gateway webhook/response body, for audit/debugging. If we ever need to query *inside* this (e.g. `raw_payload->>'cardBrand'`), that needs a GIN index, not a plain one — not needed today. |
| created_at | timestamp | immutable — no `updated_at`, rows are never modified |

### refund
Current-state row per refund request (mutable — same row gets updated as status progresses, unlike
`lg_payment`/`lg_refund`). Always points at a `payment` that was `succeeded`. Covers both
system-triggered refunds (order cancelled after payment succeeded) and manual/admin-initiated ones.
| column | type | notes |
|---|---|---|
| id | serial | PK |
| payment_id | int | FK -> payment.id (must reference a `succeeded` payment) — indexed |
| amount | numeric(10,2) | full or partial |
| reason | varchar | nullable — order_cancelled / customer_request / duplicate_charge / manual |
| status | enum | requested / processing / completed / failed — indexed (admin queue: "pending refunds to process") |
| gateway_reference | varchar | nullable — refund transaction id from gateway — unique index, same reasoning as `payment.gateway_reference` |
| created_at | timestamp | |
| updated_at | timestamp | |

### lg_refund
Append-only audit trail for `refund`, same pattern as `lg_payment`.
| column | type | notes |
|---|---|---|
| id | serial | PK |
| refund_id | int | FK -> refund.id — indexed |
| event_type | enum | requested / gateway_callback / status_changed / error |
| previous_status | enum | nullable |
| new_status | enum | nullable |
| message | varchar | nullable |
| raw_payload | jsonb | nullable — same GIN caveat as `lg_payment.raw_payload` |
| created_at | timestamp | immutable — no `updated_at` |

## Relations
- tires.brand_id -> brands.id
- inventory.tire_id -> tires.id (1:1, unique FK)
- order_items.tire_id -> tires.id
- order_items.order_id -> orders.id
- orders.user_id -> users.id
- emails.user_id -> users.id
- emails.order_id -> orders.id (nullable)
- payment.order_id -> orders.id
- lg_payment.payment_id -> payment.id
- refund.payment_id -> payment.id
- lg_refund.refund_id -> refund.id

## Indexes
Postgres auto-indexes PKs and `unique` columns (incl. `OneToOne` join columns). Everything below
needs an explicit `@Index()` on the entity — TypeORM does not add these automatically for plain
`ManyToOne` FKs.

Status column reflects the entity code, not the database — none of these exist in the database until
a migration for `users`/`orders`/`order_items`/`emails`/`payment`/`lg_payment`/`refund`/`lg_refund` is
generated and run.

| table.column | kind | why | status |
|---|---|---|---|
| tires.brand_id | single, FK | queried in tire search today | done in `tire.entity.ts` |
| tires.(width, profile, radius) | composite | standard tire-size search, always queried together | done in `tire.entity.ts` |
| orders.user_id | single, FK | order history per user | done in `order.entity.ts` |
| orders.status | single | admin views filtering by status | done in `order.entity.ts` |
| order_items.order_id | single, FK | fetch items for an order | done in `order-item.entity.ts` |
| order_items.tire_id | single, FK | sales history / reporting per tire | done in `order-item.entity.ts` |
| emails.user_id | single, FK | | done in `email.entity.ts` |
| emails.order_id | single, FK | | done in `email.entity.ts` |
| payment.order_id | single, FK | fetch payment attempts for an order | done in `payment.entity.ts` (real `Order` relation) |
| payment.status | single | reconciliation queries | done in `payment.entity.ts` |
| payment.gateway_reference | single, **unique** | webhook lookup by external transaction id | done in `payment.entity.ts` |
| lg_payment.payment_id | single, FK | fetch event history for a payment | done in `lg-payment.entity.ts` |
| refund.payment_id | single, FK | | done in `refund.entity.ts` |
| refund.status | single | admin refund queue | done in `refund.entity.ts` |
| refund.gateway_reference | single, **unique** | webhook lookup by external refund id | done in `refund.entity.ts` |
| lg_refund.refund_id | single, FK | fetch event history for a refund | done in `lg-refund.entity.ts` |
| brands.name | trigram (GIN, `pg_trgm`) | existing `ILike('%...%')` search — not expressible via TypeORM's `@Index()`, needs raw SQL (`CREATE EXTENSION pg_trgm` + `CREATE INDEX ... USING GIN (name gin_trgm_ops)`) | **deferred** — add by hand into the final consolidated migration once it's generated, not as its own migration file |

Explicitly **not** indexed (evaluated and skipped, not overlooked):
- `tires.season` — only 3 values, same weak-selectivity reasoning as `featured` below; a query for one season still matches roughly a third of the table
- `tires.featured` — boolean, weak selectivity as a plain index; revisit as a partial index if featured rows stay a small fraction of the catalog
- `inventory.quantity`, `inventory.unit_price` — range-filtered but always joined off an already-filtered `tires` query; low priority
- Every column that's only ever *displayed*, never used in a `WHERE`/`JOIN`/`ORDER BY` (e.g. `payment.amount`, `lg_payment.message`, `brands.logo_url`)

## Decisions made along the way
- `varchar` (no length cap) is fine as-is — in Postgres there's no perf difference between
  `varchar`, `varchar(n)`, and `text`; a length cap is a data-integrity constraint, not an
  optimization. Decided to leave uncapped for now.
- `inventory` stays a separate table from `tires` (not merged) specifically to support future
  discounts / price history on the commerce side without touching catalog data.
- `featured` belongs on `tires` (catalog/merchandising attribute), not `inventory` (stock/pricing).
- FKs are always plain `int`, never `serial` — only the owning table's own `id` is `serial`.
- `orders.payment_method`/`payment_status` were dropped in favor of `payment` rows, to normalize —
  payment state is derived from `payment` (e.g. latest row, or "any row with status=succeeded") once
  `orders` is actually built. Revisit only if that derivation proves too expensive in practice.
- `payment` is 1:many with `orders` (not 1:1) — an order can have multiple attempts (declined, then
  retried and succeeded).
- `lg_payment`/`lg_refund` are append-only logs (no `updated_at`, rows never change) — separate in
  kind from `payment`/`refund`, which are mutable current-state rows (have `updated_at`, get updated
  in place as status progresses).
- `refund` is its own table, not folded into `payment` — a refund is a distinct financial event
  against an already-succeeded payment, with its own status lifecycle.
- `raw_payload` on the log tables is `jsonb` — assumes Postgres stays the DB; revisit if that changes.
