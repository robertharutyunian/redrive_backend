import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Refund } from './entities/refund.entity.js';
import { RefundService } from './refund.service.js';
import { RefundStatus } from './enums/refund-status.enum.js';

describe('RefundService', () => {
  let service: RefundService;
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
        RefundService,
        { provide: getRepositoryToken(Refund), useValue: repository },
      ],
    }).compile();

    service = module.get(RefundService);
  });

  const refund = {
    id: 1,
    payment: { id: 9 },
    amount: '75.50',
    reason: 'damaged item',
    status: RefundStatus.COMPLETED,
    gatewayReference: 're_123',
    createdAt: new Date('2026-01-01'),
  } as unknown as Refund;

  it('applies only the filters that were provided and paginates', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[refund], 1]);

    const result = await service.findAll({
      page: 1,
      limit: 20,
      status: RefundStatus.COMPLETED,
    });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith('refund.status = :status', {
      status: RefundStatus.COMPLETED,
    });
    expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
      expect.stringContaining('payment.id'),
      expect.anything(),
    );
    expect(result.meta).toEqual({ total: 1, page: 1, limit: 20, totalPages: 1 });
  });

  it('maps amount to a number and flattens paymentId', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[refund], 1]);

    const result = await service.findAll({ page: 1, limit: 20 });

    expect(result.data[0].amount).toBe(75.5);
    expect(result.data[0].paymentId).toBe(9);
  });

  it('throws NotFoundException when the refund does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
