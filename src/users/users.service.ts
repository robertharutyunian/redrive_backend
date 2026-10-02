import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { toUserResponse } from './dto/user-response.dto.js';
import type { UserResponseDto } from './dto/user-response.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async update(
    id: number,
    currentUserId: number,
    dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    if (id !== currentUserId) {
      throw new NotFoundException(`User ${id} not found`);
    }

    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    if (dto.email !== undefined && dto.email !== user.email) {
      const existing = await this.usersRepository.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException('An account with that email already exists');
      }
    }

    Object.assign(user, dto);
    const saved = await this.usersRepository.save(user);

    return toUserResponse(saved);
  }
}
