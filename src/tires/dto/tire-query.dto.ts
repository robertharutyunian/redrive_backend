import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { IsWholeAmount } from '../../common/decorators/is-whole-amount.decorator.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { TireSeason } from '../enums/tire-season.enum.js';
import { TIRE_DIMENSION_MIN } from '../constants/tire.constants.js';

function toBoolean({ value }: { value: unknown }): unknown {
  if (typeof value !== 'string') return value;
  return value === 'true';
}

export class TireQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  brandId?: number;

  @IsOptional()
  @IsEnum(TireSeason)
  season?: TireSeason;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(TIRE_DIMENSION_MIN)
  width?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(TIRE_DIMENSION_MIN)
  profile?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(TIRE_DIMENSION_MIN)
  radius?: number;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  featured?: boolean;

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
