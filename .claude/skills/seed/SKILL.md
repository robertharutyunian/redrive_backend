Run the database seeder.

Steps:
1. Ensure migrations are up to date: `pnpm migration:run`
2. Run the seeder: `pnpm seed`
3. If the seed fails, read `src/database/seed.ts` and diagnose the issue before retrying.

The seeder is idempotent — it skips rows that already exist (matched by name for brands, by model+size for tires).
