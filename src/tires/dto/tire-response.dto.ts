import { ApiProperty } from '@nestjs/swagger';
import { Tire } from '../entities/tire.entity.js';
import { TireSeason } from '../enums/tire-season.enum.js';

export class TireBrandSummaryDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty({ nullable: true }) logoUrl: string | null;
}

export class TireInventorySummaryDto {
  @ApiProperty() unitPrice: number;
  @ApiProperty() quantity: number;
  @ApiProperty() inStock: boolean;
}

export class TireResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() model: string;
  @ApiProperty({ enum: TireSeason }) season: TireSeason;
  @ApiProperty() width: number;
  @ApiProperty() profile: number;
  @ApiProperty() radius: number;
  @ApiProperty() loadIndex: number;
  @ApiProperty() speedRating: string;
  @ApiProperty() extraLoad: boolean;
  @ApiProperty() featured: boolean;
  @ApiProperty({ type: () => TireBrandSummaryDto, nullable: true })
  brand: TireBrandSummaryDto | null;
  @ApiProperty({ type: () => TireInventorySummaryDto, nullable: true })
  inventory: TireInventorySummaryDto | null;
}

export function toTireResponse(tire: Tire): TireResponseDto {
  return {
    id: tire.id,
    model: tire.model,
    season: tire.season,
    width: tire.width,
    profile: tire.profile,
    radius: tire.radius,
    loadIndex: tire.loadIndex,
    speedRating: tire.speedRating,
    extraLoad: tire.extraLoad,
    featured: tire.featured,
    brand: tire.brand
      ? {
          id: tire.brand.id,
          name: tire.brand.name,
          logoUrl: tire.brand.logoUrl,
        }
      : null,
    inventory: tire.inventory
      ? {
          unitPrice: Number(tire.inventory.unitPrice),
          quantity: tire.inventory.quantity,
          inStock: tire.inventory.quantity > 0,
        }
      : null,
  };
}
