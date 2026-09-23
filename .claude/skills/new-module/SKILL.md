Create a new NestJS feature module named "$ARGUMENTS" following the project conventions.

Scaffold the following structure under `src/$ARGUMENTS/`:

```
src/$ARGUMENTS/
  constants/   $ARGUMENTS.constants.ts   (validation constants)
  entities/    $ARGUMENTS.entity.ts      (TypeORM entity)
  enums/       (only if the entity has enum columns)
```

Rules:
- Entity must use `@Entity('table_name')` with snake_case table name
- All columns need matching `class-validator` decorators (`@IsString`, `@IsInt`, `@IsBoolean`, `@IsEnum`, `@Min`, `@MaxLength`, etc.)
- Nullable columns get `@IsOptional()`
- Numeric price/decimal columns use `@Transform(({ value }) => parseFloat(value))` from `class-transformer`
- `MaxLength` and `Min` values must reference named constants from the `constants/` file, not inline numbers
- All local imports must use `.js` extension (ESM)
- Register the entity in `src/database/database.module.ts` and `src/database/data-source.ts`
- After scaffolding, generate a migration: `pnpm migration:generate -- -n Add<ModuleName>Table`
