import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Email } from './entities/email.entity.js';
import { EmailsService } from './emails.service.js';
import { EmailType } from './enums/email-type.enum.js';

describe('EmailsService', () => {
  let service: EmailsService;
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
        EmailsService,
        { provide: getRepositoryToken(Email), useValue: repository },
      ],
    }).compile();

    service = module.get(EmailsService);
  });

  const emailWithOrder = {
    id: 1,
    user: { id: 5 },
    order: { id: 12 },
    type: EmailType.ORDER_CONFIRMATION,
    sentAt: new Date('2026-01-02'),
    invoiceUrl: 'https://example.com/invoice.pdf',
    createdAt: new Date('2026-01-01'),
  } as unknown as Email;

  const emailWithoutOrder = {
    id: 2,
    user: { id: 5 },
    order: null,
    type: EmailType.PASSWORD_RESET,
    sentAt: null,
    invoiceUrl: null,
    createdAt: new Date('2026-01-01'),
  } as unknown as Email;

  it('applies only the filters that were provided and paginates', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[emailWithOrder], 1]);

    const result = await service.findAll({
      page: 1,
      limit: 20,
      type: EmailType.ORDER_CONFIRMATION,
    });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith('email.type = :type', {
      type: EmailType.ORDER_CONFIRMATION,
    });
    expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
      expect.stringContaining('user.id'),
      expect.anything(),
    );
    expect(result.meta).toEqual({ total: 1, page: 1, limit: 20, totalPages: 1 });
  });

  it('flattens userId and orderId when order is present', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[emailWithOrder], 1]);

    const result = await service.findAll({ page: 1, limit: 20 });

    expect(result.data[0].userId).toBe(5);
    expect(result.data[0].orderId).toBe(12);
  });

  it('returns a null orderId when the email has no order', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[emailWithoutOrder], 1]);

    const result = await service.findAll({ page: 1, limit: 20 });

    expect(result.data[0].orderId).toBeNull();
  });

  it('throws NotFoundException when the email does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
