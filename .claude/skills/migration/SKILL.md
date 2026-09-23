Generate and review a TypeORM migration for "$ARGUMENTS".

Steps:
1. Run `pnpm migration:generate -- -n $ARGUMENTS` (this builds first, then generates the migration file)
2. Read the generated file in `src/database/migrations/`
3. Review it and flag any issues:
   - Destructive changes (column drops, type changes) on tables that may have data
   - Missing index on foreign key columns
   - Enum additions/removals (PostgreSQL requires explicit `ALTER TYPE`)
   - Any `synchronize`-style surprises (unexpected column renames treated as drop+add)
4. Summarize what the migration does and confirm it is safe to run

To apply: `pnpm migration:run`
To undo: `pnpm migration:revert`
