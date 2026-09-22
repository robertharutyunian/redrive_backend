# ReDrive Database Schema

Status as of 2026-09-22: `brands` and `tires` are implemented (see `src/brands/brand.entity.ts`,
`src/tires/tire.entity.ts`, `src/database/migrations/1790019126839-InitSchema.ts`). Everything else
below is **planned, not yet built** — kept here so the design isn't lost between sessions.

## Implemented

### brands
| column | type | notes |
|---|---|---|
| id | serial | PK |
| name | varchar | |
| logo_url | varchar | nullable |
| country | varchar | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

### tires
| column | type | notes |
|---|---|---|
| id | serial | PK |
| brand_id | int | FK -> brands.id |
| model | varchar | |
| season | enum | summer / winter / all_season |
| width | int | |
| profile | int | |
| radius | int | |
| load_index | int | |
| speed_rating | varchar | |
| extra_load | boolean | default false |
| featured | boolean | **planned, not yet added** — needs its own migration (`ALTER TABLE tires ADD COLUMN featured ...`), don't touch InitSchema |
| created_at | timestamp | |
| updated_at | timestamp | |

## Planned (not built yet)

### inventory (1:1 with tires)
Kept as its own table on purpose — future home for discounts / price history without touching the
catalog table.
| column | type | notes |
|---|---|---|
| id | serial | PK |
| tire_id | int | FK -> tires.id, unique (1:1) |
| quantity | int | |
| origin_price | numeric(10,2) | cost |
| unit_price | numeric(10,2) | sell price |
| created_at | timestamp | |
| updated_at | timestamp | |

### users
| column | type | notes |
|---|---|---|
| id | serial | PK |
| fname | varchar | |
| lname | varchar | |
| phone | varchar | nullable |
| email | varchar | unique |
| username | varchar | unique |
| password | varchar | bcrypt hash |
| created_at | timestamp | |
| updated_at | timestamp | |

### orders
| column | type | notes |
|---|---|---|
| id | serial | PK |
| user_id | int | FK -> users.id |
| delivery_method | enum | e.g. pickup / courier |
| delivery_address | varchar | |
| delivery_instructions | varchar | nullable |
| payment_method | enum | e.g. card / cash |
| payment_status | enum | pending / paid / failed / refunded |
| status | enum | pending / processing / shipped / delivered / cancelled |
| total_price | numeric(10,2) | stored snapshot, not recomputed from order_items |
| created_at | timestamp | |
| updated_at | timestamp | |

### order_items
| column | type | notes |
|---|---|---|
| id | serial | PK |
| order_id | int | FK -> orders.id |
| tire_id | int | FK -> tires.id |
| quantity | int | |
| unit_price | numeric(10,2) | snapshot of price at order time |
| total_price | numeric(10,2) | quantity * unit_price |
| created_at | timestamp | |
| updated_at | timestamp | |

### emails
| column | type | notes |
|---|---|---|
| id | serial | PK |
| user_id | int | FK -> users.id |
| order_id | int | FK -> orders.id, **nullable** (not all emails relate to an order) |
| type | enum | order_confirmation / invoice / password_reset / shipping_update |
| sent_at | timestamp | |
| invoice_url | varchar | nullable, Cloudinary URL to generated invoice |
| created_at | timestamp | |
| updated_at | timestamp | |

## Relations
- tires.brand_id -> brands.id
- inventory.tire_id -> tires.id (1:1, unique FK)
- order_items.tire_id -> tires.id
- order_items.order_id -> orders.id
- orders.user_id -> users.id
- emails.user_id -> users.id
- emails.order_id -> orders.id (nullable)

## Decisions made along the way
- `varchar` (no length cap) is fine as-is — in Postgres there's no perf difference between
  `varchar`, `varchar(n)`, and `text`; a length cap is a data-integrity constraint, not an
  optimization. Decided to leave uncapped for now.
- `inventory` stays a separate table from `tires` (not merged) specifically to support future
  discounts / price history on the commerce side without touching catalog data.
- `featured` belongs on `tires` (catalog/merchandising attribute), not `inventory` (stock/pricing).
- FKs are always plain `int`, never `serial` — only the owning table's own `id` is `serial`.
