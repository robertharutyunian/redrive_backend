import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from '../common/dto/paginated-response.dto.js';
import type { PaginatedResponseDto } from '../common/dto/paginated-response.dto.js';
import { User } from './entities/user.entity.js';
import { UserQueryDto } from './dto/user-query.dto.js';
import { toUserResponse } from './dto/user-response.dto.js';
import type { UserResponseDto } from './dto/user-response.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(
    query: UserQueryDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const { page, limit, email, username } = query;

    const where: Partial<Pick<User, 'email' | 'username'>> = {};
    if (email !== undefined) where.email = email;
    if (username !== undefined) where.username = username;

    const [users, total] = await this.usersRepository.findAndCount({
      where,
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(users.map(toUserResponse), total, page, limit);
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return toUserResponse(user);
  }
}
