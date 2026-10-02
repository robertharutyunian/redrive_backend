import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;
  const repository = {
    findOne: vi.fn(),
    save: vi.fn(),
  };

  beforeEach(async () => {
    repository.findOne.mockReset();
    repository.save.mockReset();

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
    phone: '+37400000000',
    email: 'jane@example.com',
    username: 'janedoe',
    password: 'hashed-secret',
    createdAt: new Date('2026-01-01'),
  } as User;

  it('throws NotFoundException when updating a user that is not the current user', async () => {
    await expect(service.update(1, 2, { fname: 'New' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.findOne).not.toHaveBeenCalled();
  });

  it('updates and maps the current user', async () => {
    repository.findOne.mockResolvedValue(user);
    repository.save.mockResolvedValue(Object.assign({}, user, { fname: 'New' }));

    const result = await service.update(1, 1, { fname: 'New' });

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ fname: 'New' }),
    );
    expect(result.fname).toBe('New');
  });

  it('throws ConflictException when changing to an email already in use', async () => {
    repository.findOne
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(Object.assign({}, user, { id: 2, email: 'taken@example.com' }));

    await expect(
      service.update(1, 1, { email: 'taken@example.com' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
