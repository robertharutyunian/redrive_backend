import { ApiProperty } from '@nestjs/swagger';
import { Payment } from '../entities/payment.entity.js';
import { PaymentMethod } from '../enums/payment-method.enum.js';
import { PaymentStatus } from '../enums/payment-status.enum.js';

export class PaymentResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() orderId: number;
  @ApiProperty() amount: number;
  @ApiProperty({ enum: PaymentMethod }) method: PaymentMethod;
  @ApiProperty({ enum: PaymentStatus }) status: PaymentStatus;
  @ApiProperty({ nullable: true }) gateway: string | null;
  @ApiProperty({ nullable: true }) gatewayReference: string | null;
  @ApiProperty() createdAt: Date;
}

export function toPaymentResponse(payment: Payment): PaymentResponseDto {
  return {
    id: payment.id,
    orderId: payment.order.id,
    amount: Number(payment.amount),
    method: payment.method,
    status: payment.status,
    gateway: payment.gateway,
    gatewayReference: payment.gatewayReference,
    createdAt: payment.createdAt,
  };
}
