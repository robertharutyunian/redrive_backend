import { ApiProperty, OmitType } from '@nestjs/swagger';
import { TireResponseDto, toTireResponse } from '../../tires/dto/tire-response.dto.js';
import { OrderItem } from '../entities/order-item.entity.js';

// Order items are a historical record: quantity/unitPrice/totalPrice below are the
// snapshot frozen at purchase time. The tire's `inventory` (current stock/price) is live
// catalog data that has no business inside a past order, so it's omitted here.
export class OrderItemTireDto extends OmitType(TireResponseDto, ['inventory'] as const) {}

export class OrderItemResponseDto {
  @ApiProperty({ type: () => OrderItemTireDto }) tire: OrderItemTireDto;
  @ApiProperty() quantity: number;
  @ApiProperty({ description: 'Price paid per unit at the time of purchase' })
  unitPrice: number;
  @ApiProperty() totalPrice: number;
}

export function toOrderItemResponse(orderItem: OrderItem): OrderItemResponseDto {
  const { inventory: _inventory, ...tire } = toTireResponse(orderItem.tire);

  return {
    tire,
    quantity: orderItem.quantity,
    unitPrice: Number(orderItem.unitPrice),
    totalPrice: Number(orderItem.totalPrice),
  };
}
