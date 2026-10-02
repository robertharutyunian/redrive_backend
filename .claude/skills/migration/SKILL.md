Generate and review a TypeORM migration for "$ARGUMENTS".

**Rule: never edit an existing migration file in `src/database/migrations/`, even to fix something small.** Once a migration file exists it may already be applied to someone's database (locally, in CI, or in a shared environment), so editing it rewrites history that other environments won't replay. If a schema change is needed — including a correction to what a previous migration did — always generate a brand-new migration for it. The only exception is a migration you just generated in the same turn and have not yet told the user is final.

Steps:
1. Run `pnpm migration:generate -- src/database/migrations/$ARGUMENTS` (this builds first, then generates the migration file; the CLI takes the output path positionally, not a `-n` flag)
2. Read the generated file in `src/database/migrations/`
3. Review it and flag any issues:
   - Destructive changes (column drops, type changes) on tables that may have data
   - Missing index on foreign key columns
   - Enum additions/removals (PostgreSQL requires explicit `ALTER TYPE`)
   - Any `synchronize`-style surprises (unexpected column renames treated as drop+add)
4. Summarize what the migration does and confirm it is safe to run

To apply: `pnpm migration:run`
To undo: `pnpm migration:revert`
