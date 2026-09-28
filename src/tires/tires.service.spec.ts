import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Tire } from './entities/tire.entity.js';
import { TiresService } from './tires.service.js';
import { TireSeason } from './enums/tire-season.enum.js';

describe('TiresService', () => {
  let service: TiresService;
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
        TiresService,
        { provide: getRepositoryToken(Tire), useValue: repository },
      ],
    }).compile();

    service = module.get(TiresService);
  });

  const tire = {
    id: 1,
    model: 'Pilot Sport 4',
    season: TireSeason.SUMMER,
    width: 225,
    profile: 45,
    radius: 17,
    loadIndex: 91,
    speedRating: 'W',
    extraLoad: false,
    featured: true,
    brand: { id: 2, name: 'Michelin', logoUrl: null, country: 'FR' },
    inventory: { id: 3, quantity: 5, originPrice: '80.00', unitPrice: '120.00' },
  } as unknown as Tire;

  it('applies only the filters that were provided and paginates', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[tire], 1]);

    const result = await service.findAll({
      page: 1,
      limit: 20,
      season: TireSeason.SUMMER,
      featured: true,
    });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith('tire.season = :season', {
      season: TireSeason.SUMMER,
    });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('tire.featured = :featured', {
      featured: true,
    });
    expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
      expect.stringContaining('brand.id'),
      expect.anything(),
    );
    expect(queryBuilder.skip).toHaveBeenCalledWith(0);
    expect(queryBuilder.take).toHaveBeenCalledWith(20);
    expect(result.meta).toEqual({ total: 1, page: 1, limit: 20, totalPages: 1 });
  });

  it('never includes originPrice in the mapped response', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[tire], 1]);

    const result = await service.findAll({ page: 1, limit: 20 });

    expect(JSON.stringify(result)).not.toContain('originPrice');
    expect(JSON.stringify(result)).not.toContain('80');
    expect(result.data[0].inventory).toEqual({
      unitPrice: 120,
      quantity: 5,
      inStock: true,
    });
  });

  it('throws NotFoundException when the tire does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
