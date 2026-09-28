import { ApiProperty } from '@nestjs/swagger';
import { Refund } from '../entities/refund.entity.js';
import { RefundStatus } from '../enums/refund-status.enum.js';

export class RefundResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() paymentId: number;
  @ApiProperty() amount: number;
  @ApiProperty({ nullable: true }) reason: string | null;
  @ApiProperty({ enum: RefundStatus }) status: RefundStatus;
  @ApiProperty({ nullable: true }) gatewayReference: string | null;
  @ApiProperty() createdAt: Date;
}

export function toRefundResponse(refund: Refund): RefundResponseDto {
  return {
    id: refund.id,
    paymentId: refund.payment.id,
    amount: Number(refund.amount),
    reason: refund.reason,
    status: refund.status,
    gatewayReference: refund.gatewayReference,
    createdAt: refund.createdAt,
  };
}
