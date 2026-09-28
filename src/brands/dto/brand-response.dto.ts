import { ApiProperty } from '@nestjs/swagger';
import { Brand } from '../entities/brand.entity.js';

export class BrandResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty({ nullable: true }) logoUrl: string | null;
  @ApiProperty({ nullable: true }) country: string | null;
}

export function toBrandResponse(brand: Brand): BrandResponseDto {
  return {
    id: brand.id,
    name: brand.name,
    logoUrl: brand.logoUrl,
    country: brand.country,
  };
}
