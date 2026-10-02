import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Order } from './entities/order.entity.js';
import { OrdersService } from './orders.service.js';
import { OrderStatus } from './enums/order-status.enum.js';
import { DeliveryMethod } from './enums/delivery-method.enum.js';
import { TireSeason } from '../tires/enums/tire-season.enum.js';

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
    find: vi.fn(),
  };

  beforeEach(async () => {
    Object.values(queryBuilder).forEach((fn) => {
      if (typeof fn === 'function' && 'mockClear' in fn) fn.mockClear();
    });
    repository.createQueryBuilder.mockClear();
    repository.findOne.mockReset();
    repository.find.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: repository },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get(OrdersService);
  });

  const orderItem = {
    id: 1,
    quantity: 2,
    unitPrice: '70.00',
    totalPrice: '140.00',
    tire: {
      id: 10,
      model: 'Pilot Sport 4',
      season: TireSeason.SUMMER,
      width: 205,
      profile: 55,
      radius: 16,
      loadIndex: 91,
      speedRating: 'V',
      extraLoad: false,
      featured: true,
      brand: { id: 3, name: 'Michelin', logoUrl: null },
      inventory: { unitPrice: '75.00', quantity: 10 },
    },
  };

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
    orderItems: [orderItem],
    createdAt: new Date('2026-01-01'),
  } as unknown as Order;

  it('applies only the filters that were provided and paginates', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[order], 1]);
    repository.find.mockResolvedValue([order]);

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
    repository.find.mockResolvedValue([order]);

    const result = await service.findAll({ page: 1, limit: 20 }, 5);

    expect(result.data[0].totalPrice).toBe(150);
    expect(result.data[0].user).toEqual({
      id: 5,
      fname: 'Jane',
      lname: 'Doe',
      email: 'jane@example.com',
    });
  });

  it('nests order items with full tire info and the price paid at purchase', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[order], 1]);
    repository.find.mockResolvedValue([order]);

    const result = await service.findAll({ page: 1, limit: 20 }, 5);

    expect(result.data[0].items).toEqual([
      {
        tire: expect.objectContaining({
          id: 10,
          model: 'Pilot Sport 4',
          brand: { id: 3, name: 'Michelin', logoUrl: null },
        }),
        quantity: 2,
        unitPrice: 70,
        totalPrice: 140,
      },
    ]);
  });

  it('throws NotFoundException when the order does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999, 5)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findOne returns order items for the owning user', async () => {
    repository.findOne.mockResolvedValue(order);

    const result = await service.findOne(1, 5);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].tire.model).toBe('Pilot Sport 4');
  });
});
