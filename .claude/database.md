# Database / Migrations

- `synchronize: false` — all schema changes **must** go through versioned migrations.
- `data-source.ts` is the standalone CLI entry point; migrations are loaded from `dist/database/migrations/*.js` (build before generating).
- When adding a new migration: `pnpm migration:generate -- -n MigrationName`, then review the generated file before running it.
