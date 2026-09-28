import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Brand } from './entities/brand.entity.js';
import { BrandsService } from './brands.service.js';

describe('BrandsService', () => {
  let service: BrandsService;
  const repository = {
    findAndCount: vi.fn(),
    findOne: vi.fn(),
  };

  beforeEach(async () => {
    repository.findAndCount.mockReset();
    repository.findOne.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        BrandsService,
        { provide: getRepositoryToken(Brand), useValue: repository },
      ],
    }).compile();

    service = module.get(BrandsService);
  });

  it('paginates and maps results, computing totalPages', async () => {
    const brand = {
      id: 1,
      name: 'Michelin',
      logoUrl: null,
      country: 'FR',
    } as Brand;
    repository.findAndCount.mockResolvedValue([[brand], 42]);

    const result = await service.findAll({ page: 2, limit: 10 });

    expect(repository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
    expect(result).toEqual({
      data: [{ id: 1, name: 'Michelin', logoUrl: null, country: 'FR' }],
      meta: { total: 42, page: 2, limit: 10, totalPages: 5 },
    });
  });

  it('throws NotFoundException when the brand does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
