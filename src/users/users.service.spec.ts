import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;
  const repository = {
    findAndCount: vi.fn(),
    findOne: vi.fn(),
  };

  beforeEach(async () => {
    repository.findAndCount.mockReset();
    repository.findOne.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repository },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  const user = {
    id: 1,
    fname: 'Jane',
    lname: 'Doe',
    phone: null,
    email: 'jane@example.com',
    username: 'janedoe',
    password: 'hashed-secret',
    createdAt: new Date('2026-01-01'),
  } as User;

  it('paginates and maps results, computing totalPages', async () => {
    repository.findAndCount.mockResolvedValue([[user], 42]);

    const result = await service.findAll({ page: 2, limit: 10 });

    expect(repository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
    expect(result.meta).toEqual({ total: 42, page: 2, limit: 10, totalPages: 5 });
  });

  it('never includes password in the mapped response', async () => {
    repository.findAndCount.mockResolvedValue([[user], 1]);

    const result = await service.findAll({ page: 1, limit: 20 });

    expect(JSON.stringify(result)).not.toContain('hashed-secret');
    expect(result.data[0]).toEqual({
      id: 1,
      fname: 'Jane',
      lname: 'Doe',
      phone: null,
      email: 'jane@example.com',
      username: 'janedoe',
      createdAt: user.createdAt,
    });
  });

  it('throws NotFoundException when the user does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
