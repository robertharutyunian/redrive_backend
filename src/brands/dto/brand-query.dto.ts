import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { BRAND_NAME_MAX_LENGTH } from '../constants/brand.constants.js';

export class BrandQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(BRAND_NAME_MAX_LENGTH)
  name?: string;
}
