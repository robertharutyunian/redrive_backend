import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Order } from './entities/order.entity.js';
import { OrdersService } from './orders.service.js';
import { OrderStatus } from './enums/order-status.enum.js';
import { DeliveryMethod } from './enums/delivery-method.enum.js';

describe('OrdersService', () => {
  let service: OrdersService;
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
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: repository },
      ],
    }).compile();

    service = module.get(OrdersService);
  });

  const order = {
    id: 1,
    user: { id: 5, fname: 'Jane', lname: 'Doe', email: 'jane@example.com' },
    contactName: 'Jane Doe',
    contactEmail: 'jane@example.com',
    contactPhone: '+37491234567',
    deliveryMethod: DeliveryMethod.COURIER,
    deliveryAddress: '123 Main St',
    deliveryInstructions: null,
    status: OrderStatus.PENDING,
    totalPrice: '150.00',
    createdAt: new Date('2026-01-01'),
  } as unknown as Order;

  it('applies only the filters that were provided and paginates', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[order], 1]);

    const result = await service.findAll(
      {
        page: 1,
        limit: 20,
        status: OrderStatus.PENDING,
      },
      5,
    );

    expect(queryBuilder.andWhere).toHaveBeenCalledWith('user.id = :currentUserId', {
      currentUserId: 5,
    });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('order.status = :status', {
      status: OrderStatus.PENDING,
    });
    expect(result.meta).toEqual({ total: 1, page: 1, limit: 20, totalPages: 1 });
  });

  it('maps totalPrice to a number and nests the user summary', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[order], 1]);

    const result = await service.findAll({ page: 1, limit: 20 }, 5);

    expect(result.data[0].totalPrice).toBe(150);
    expect(result.data[0].user).toEqual({
      id: 5,
      fname: 'Jane',
      lname: 'Doe',
      email: 'jane@example.com',
    });
  });

  it('throws NotFoundException when the order does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999, 5)).rejects.toBeInstanceOf(NotFoundException);
  });
});
