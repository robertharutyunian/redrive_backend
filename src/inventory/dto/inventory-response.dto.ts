import { ApiProperty } from '@nestjs/swagger';
import { Inventory } from '../entities/inventory.entity.js';

export class InventoryResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() tireId: number;
  @ApiProperty() quantity: number;
  @ApiProperty() unitPrice: number;
  @ApiProperty() inStock: boolean;
}

export function toInventoryResponse(inventory: Inventory): InventoryResponseDto {
  return {
    id: inventory.id,
    tireId: inventory.tire.id,
    quantity: inventory.quantity,
    unitPrice: Number(inventory.unitPrice),
    inStock: inventory.quantity > 0,
  };
}
