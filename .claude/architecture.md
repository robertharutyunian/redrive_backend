# Architecture

NestJS + TypeORM + PostgreSQL backend using **ESM** (`"type": "module"`) with `.js` extensions on all local imports.

**Feature-folder structure** — each domain lives in its own directory under `src/`. Currently only entities are defined per domain (no controllers/services yet — early development):

```
src/<domain>/
  constants/   <domain>.constants.ts   validation constants (MaxLength values, Min values, etc.)
  entities/    <domain>.entity.ts
  enums/       <domain>.enum.ts        (only when the entity has enum columns)
```

Domains:
- `src/brands/` — Brand entity (`brands` table)
- `src/tires/` — Tire entity (`tires` table), `TireSeason` enum
- `src/inventory/` — Inventory entity (`inventory` table)
- `src/database/` — `DatabaseModule`, `data-source.ts` (TypeORM CLI entry point), migrations, seeder

**Data model relationships:**
- `Brand` → `OneToMany` → `Tire` (via `brand_id`)
- `Tire` → `OneToOne` → `Inventory` (via unique `tire_id`)

**Validation & serialization:**
- All entity fields are decorated with `class-validator` constraints (`@IsString`, `@IsInt`, `@IsEnum`, `@Min`, etc.).
- `MaxLength` and `Min` values reference named constants from the domain's `constants/` file — never inline numbers in validators.
- Numeric price/decimal columns use `@Transform(({ value }) => parseFloat(value))` from `class-transformer` to parse the TypeORM `numeric` string to `float`.
- Enable `ValidationPipe` globally in `main.ts` to activate the constraints.

**Custom slash commands** (`.claude/commands/`):
- `/new-module <name>` — scaffold a new feature module following the folder conventions above
- `/migration <name>` — generate and review a TypeORM migration
- `/seed` — run the database seeder
