import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../entities/order.entity.js';
import { DeliveryMethod } from '../enums/delivery-method.enum.js';
import { OrderStatus } from '../enums/order-status.enum.js';

export class OrderUserSummaryDto {
  @ApiProperty() id: number;
  @ApiProperty() fname: string;
  @ApiProperty() lname: string;
  @ApiProperty() email: string;
}

export class OrderResponseDto {
  @ApiProperty() id: number;
  @ApiProperty({ type: () => OrderUserSummaryDto, nullable: true })
  user: OrderUserSummaryDto | null;
  @ApiProperty() contactName: string;
  @ApiProperty() contactEmail: string;
  @ApiProperty() contactPhone: string;
  @ApiProperty({ enum: DeliveryMethod }) deliveryMethod: DeliveryMethod;
  @ApiProperty({ nullable: true }) deliveryAddress: string | null;
  @ApiProperty({ nullable: true }) deliveryInstructions: string | null;
  @ApiProperty({ enum: OrderStatus }) status: OrderStatus;
  @ApiProperty() totalPrice: number;
  @ApiProperty() createdAt: Date;
}

export function toOrderResponse(order: Order): OrderResponseDto {
  return {
    id: order.id,
    user: order.user
      ? {
          id: order.user.id,
          fname: order.user.fname,
          lname: order.user.lname,
          email: order.user.email,
        }
      : null,
    contactName: order.contactName,
    contactEmail: order.contactEmail,
    contactPhone: order.contactPhone,
    deliveryMethod: order.deliveryMethod,
    deliveryAddress: order.deliveryAddress,
    deliveryInstructions: order.deliveryInstructions,
    status: order.status,
    totalPrice: Number(order.totalPrice),
    createdAt: order.createdAt,
  };
}
