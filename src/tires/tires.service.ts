import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from '../common/dto/paginated-response.dto.js';
import type { PaginatedResponseDto } from '../common/dto/paginated-response.dto.js';
import { Tire } from './entities/tire.entity.js';
import { TireQueryDto } from './dto/tire-query.dto.js';
import { toTireResponse } from './dto/tire-response.dto.js';
import type { TireResponseDto } from './dto/tire-response.dto.js';

@Injectable()
export class TiresService {
  constructor(
    @InjectRepository(Tire)
    private readonly tiresRepository: Repository<Tire>,
  ) {}

  async findAll(
    query: TireQueryDto,
  ): Promise<PaginatedResponseDto<TireResponseDto>> {
    const {
      page,
      limit,
      brandId,
      season,
      width,
      profile,
      radius,
      featured,
      inStock,
      minPrice,
      maxPrice,
    } = query;

    const qb = this.tiresRepository
      .createQueryBuilder('tire')
      .leftJoinAndSelect('tire.brand', 'brand')
      .leftJoinAndSelect('tire.inventory', 'inventory');

    if (brandId !== undefined) {
      qb.andWhere('brand.id = :brandId', { brandId });
    }
    if (season !== undefined) {
      qb.andWhere('tire.season = :season', { season });
    }
    if (width !== undefined) {
      qb.andWhere('tire.width = :width', { width });
    }
    if (profile !== undefined) {
      qb.andWhere('tire.profile = :profile', { profile });
    }
    if (radius !== undefined) {
      qb.andWhere('tire.radius = :radius', { radius });
    }
    if (featured !== undefined) {
      qb.andWhere('tire.featured = :featured', { featured });
    }
    if (inStock !== undefined) {
      qb.andWhere(inStock ? 'inventory.quantity > 0' : 'inventory.quantity = 0');
    }
    if (minPrice !== undefined) {
      qb.andWhere('inventory.unit_price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('inventory.unit_price <= :maxPrice', { maxPrice });
    }

    qb.orderBy('tire.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [tires, total] = await qb.getManyAndCount();

    return paginate(tires.map(toTireResponse), total, page, limit);
  }

  async findOne(id: number): Promise<TireResponseDto> {
    const tire = await this.tiresRepository.findOne({
      where: { id },
      relations: { brand: true, inventory: true },
    });

    if (!tire) {
      throw new NotFoundException(`Tire ${id} not found`);
    }

    return toTireResponse(tire);
  }
}
