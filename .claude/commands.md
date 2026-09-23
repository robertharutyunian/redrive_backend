# Commands

Use **pnpm** for all package operations.

```bash
pnpm start:dev        # Run in watch mode (development)
pnpm build            # Compile via nest build
pnpm start:prod       # Run compiled output

pnpm lint             # Lint with oxlint (Rust-based, TypeScript-aware)

pnpm test             # Run unit tests with Vitest
pnpm test:watch       # Vitest in watch mode
pnpm test:cov         # Coverage report
pnpm test:e2e         # End-to-end tests

pnpm migration:generate   # Build + generate TypeORM migration
pnpm migration:run        # Apply pending migrations
pnpm migration:revert     # Revert last migration
pnpm seed                 # Seed the database
```
