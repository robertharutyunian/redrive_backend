import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from '../common/dto/paginated-response.dto.js';
import type { PaginatedResponseDto } from '../common/dto/paginated-response.dto.js';
import { Email } from './entities/email.entity.js';
import { EmailQueryDto } from './dto/email-query.dto.js';
import { toEmailResponse } from './dto/email-response.dto.js';
import type { EmailResponseDto } from './dto/email-response.dto.js';

@Injectable()
export class EmailsService {
  constructor(
    @InjectRepository(Email)
    private readonly emailRepository: Repository<Email>,
  ) {}

  async findAll(
    query: EmailQueryDto,
  ): Promise<PaginatedResponseDto<EmailResponseDto>> {
    const { page, limit, userId, orderId, type } = query;

    const qb = this.emailRepository
      .createQueryBuilder('email')
      .leftJoinAndSelect('email.user', 'user')
      .leftJoinAndSelect('email.order', 'order');

    if (userId !== undefined) {
      qb.andWhere('user.id = :userId', { userId });
    }
    if (orderId !== undefined) {
      qb.andWhere('order.id = :orderId', { orderId });
    }
    if (type !== undefined) {
      qb.andWhere('email.type = :type', { type });
    }

    qb.orderBy('email.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [emails, total] = await qb.getManyAndCount();

    return paginate(emails.map(toEmailResponse), total, page, limit);
  }

  async findOne(id: number): Promise<EmailResponseDto> {
    const email = await this.emailRepository.findOne({
      where: { id },
      relations: { user: true, order: true },
    });

    if (!email) {
      throw new NotFoundException(`Email ${id} not found`);
    }

    return toEmailResponse(email);
  }
}
