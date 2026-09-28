import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from '../common/dto/paginated-response.dto.js';
import type { PaginatedResponseDto } from '../common/dto/paginated-response.dto.js';
import { Inventory } from './entities/inventory.entity.js';
import { InventoryQueryDto } from './dto/inventory-query.dto.js';
import { toInventoryResponse } from './dto/inventory-response.dto.js';
import type { InventoryResponseDto } from './dto/inventory-response.dto.js';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async findAll(
    query: InventoryQueryDto,
  ): Promise<PaginatedResponseDto<InventoryResponseDto>> {
    const { page, limit, tireId, inStock, minPrice, maxPrice } = query;

    const qb = this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.tire', 'tire');

    if (tireId !== undefined) {
      qb.andWhere('tire.id = :tireId', { tireId });
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

    qb.orderBy('inventory.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return paginate(items.map(toInventoryResponse), total, page, limit);
  }

  async findOne(id: number): Promise<InventoryResponseDto> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: { tire: true },
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory ${id} not found`);
    }

    return toInventoryResponse(inventory);
  }
}
