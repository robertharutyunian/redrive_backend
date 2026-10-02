# Deferred: admin-only endpoints

No admin/role concept exists anywhere in the codebase yet (`User` has no `role` column, no
`AdminGuard`, nothing). Several planned write endpoints are catalog/order management actions that
only an admin should ever perform — not something the current user-facing API needs. Rather than
build these against `JwtAuthGuard` now and re-guard them later, they're explicitly on hold until an
admin part of the project exists.

**Do not build these as regular authenticated-user endpoints.** Wait until there's a real admin
role/guard, then build them as part of that work.

## Deferred endpoints

- **`PATCH /brands/:id`, `PATCH /tires/:id`, `PATCH /inventory/:id`** — catalog management
  (editing brand/tire/inventory data). Decided 2026-10-02: these are admin actions, not
  user-facing. Likely applies to `POST`/`DELETE` on these same resources too, once those come up —
  same reasoning, revisit together with the PATCH work.
- **`PATCH /orders/:id` status transitions** — moving an order between `pending` /
  `processing` / `delivered` / `cancelled` is an admin/ops action, not something the owning user
  does themselves. Also deferred until admin exists. (A user-facing "cancel my own pending order"
  endpoint is a separate, narrower thing and isn't ruled out by this — but the general status-PATCH
  is admin scope.)
- **payment/refund write endpoints** — admin refund processing, if/when built, is admin scope by
  the same logic.
- **`GET /inventory`, `GET /inventory/:id`, `GET /payment`, `GET /payment/:id`, `GET /refund`,
  `GET /refund/:id`, `GET /emails`, `GET /emails/:id`** — found via full-repo controller audit on
  2026-10-02. These already exist and are already public (no guard at all, not even
  `JwtAuthGuard`) — raw stock records, all-user payment/refund records, and the email audit log.
  No customer-facing frontend has a legitimate reason to list payments/refunds/emails/inventory
  across every user, so these should move behind `AdminGuard` once it exists, same as the rest of
  this list. Until then they remain reachable by anyone with no login — acceptable short-term since
  nothing in this app surfaces them client-side, but revisit as part of the admin guard rollout, not
  left open indefinitely.

## What ships without admin, for now

- `users` only has `PATCH /users/:id`, self-only (a user editing their own profile) — see
  [[project_redrive_build_plan]] in memory. The old public `GET /users` (list) and
  `GET /users/:id` (fetch by id) were removed on 2026-10-02 — no legitimate self-service use case
  needs them, and leaving them open was an unnecessary way to enumerate/look up every account.
- Catalog (`brands`, `tires`, `inventory`) and `orders` stay read-only (`GET` list/detail) from the
  public API until admin work starts.

## When admin work actually starts

Introduce the role/guard concept (likely a `role` column on `User` plus an `AdminGuard`, mirroring
how `JwtAuthGuard`/`OptionalJwtAuthGuard` already work) as part of the *first* admin endpoint that
needs it, not as separate prep work beforehand. Then come back to this file and build the endpoints
listed above against that guard.
