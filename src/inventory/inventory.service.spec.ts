import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Inventory } from './entities/inventory.entity.js';
import { InventoryService } from './inventory.service.js';

describe('InventoryService', () => {
  let service: InventoryService;
  const queryBuilder = {
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn(),
  };
  const repository = {
    createQueryBuilder: vi.fn(() => queryBuilder),
    findOne: vi.fn(),
  };

  beforeEach(async () => {
    Object.values(queryBuilder).forEach((fn) => {
      if (typeof fn === 'function' && 'mockClear' in fn) fn.mockClear();
    });
    repository.createQueryBuilder.mockClear();
    repository.findOne.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: getRepositoryToken(Inventory), useValue: repository },
      ],
    }).compile();

    service = module.get(InventoryService);
  });

  const inventory = {
    id: 1,
    tire: { id: 2 },
    quantity: 5,
    originPrice: '80.00',
    unitPrice: '120.00',
  } as unknown as Inventory;

  it('applies only the filters that were provided and paginates', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[inventory], 1]);

    const result = await service.findAll({ page: 1, limit: 20, tireId: 2 });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith('tire.id = :tireId', {
      tireId: 2,
    });
    expect(queryBuilder.skip).toHaveBeenCalledWith(0);
    expect(queryBuilder.take).toHaveBeenCalledWith(20);
    expect(result.meta).toEqual({ total: 1, page: 1, limit: 20, totalPages: 1 });
  });

  it('never includes originPrice in the mapped response', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[inventory], 1]);

    const result = await service.findAll({ page: 1, limit: 20 });

    expect(JSON.stringify(result)).not.toContain('originPrice');
    expect(JSON.stringify(result)).not.toContain('80');
    expect(result.data[0]).toEqual({
      id: 1,
      tireId: 2,
      quantity: 5,
      unitPrice: 120,
      inStock: true,
    });
  });

  it('throws NotFoundException when the inventory row does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
