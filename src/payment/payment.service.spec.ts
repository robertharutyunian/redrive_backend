import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Payment } from './entities/payment.entity.js';
import { PaymentService } from './payment.service.js';
import { PaymentStatus } from './enums/payment-status.enum.js';
import { PaymentMethod } from './enums/payment-method.enum.js';

describe('PaymentService', () => {
  let service: PaymentService;
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
        PaymentService,
        { provide: getRepositoryToken(Payment), useValue: repository },
      ],
    }).compile();

    service = module.get(PaymentService);
  });

  const payment = {
    id: 1,
    order: { id: 7 },
    amount: '150.00',
    method: PaymentMethod.CARD,
    status: PaymentStatus.SUCCEEDED,
    gateway: 'stripe',
    gatewayReference: 'ch_123',
    createdAt: new Date('2026-01-01'),
  } as unknown as Payment;

  it('applies only the filters that were provided and paginates', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[payment], 1]);

    const result = await service.findAll({
      page: 1,
      limit: 20,
      status: PaymentStatus.SUCCEEDED,
    });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith('payment.status = :status', {
      status: PaymentStatus.SUCCEEDED,
    });
    expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
      expect.stringContaining('order.id'),
      expect.anything(),
    );
    expect(result.meta).toEqual({ total: 1, page: 1, limit: 20, totalPages: 1 });
  });

  it('maps amount to a number and flattens orderId', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[payment], 1]);

    const result = await service.findAll({ page: 1, limit: 20 });

    expect(result.data[0].amount).toBe(150);
    expect(result.data[0].orderId).toBe(7);
  });

  it('throws NotFoundException when the payment does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
