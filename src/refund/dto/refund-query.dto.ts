import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { RefundStatus } from '../enums/refund-status.enum.js';

export class RefundQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  paymentId?: number;

  @IsOptional()
  @IsEnum(RefundStatus)
  status?: RefundStatus;
}
