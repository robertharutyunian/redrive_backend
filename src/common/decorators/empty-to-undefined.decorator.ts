import { Transform } from 'class-transformer';

// Postman/forms send "" for an unfilled optional field instead of omitting it.
// class-validator's @IsOptional only skips null/undefined, so "" still hits
// @IsNotEmpty/@IsEmail/@Matches below it. Normalize "" to undefined first.
export function EmptyToUndefined() {
  return Transform(({ value }) => (value === '' ? undefined : value));
}
