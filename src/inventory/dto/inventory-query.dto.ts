import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { IsWholeAmount } from '../../common/decorators/is-whole-amount.decorator.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

function toBoolean({ value }: { value: unknown }): unknown {
  if (typeof value !== 'string') return value;
  return value === 'true';
}

export class InventoryQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tireId?: number;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @IsWholeAmount()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @IsWholeAmount()
  maxPrice?: number;
}
