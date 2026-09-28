import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from '../common/dto/paginated-response.dto.js';
import type { PaginatedResponseDto } from '../common/dto/paginated-response.dto.js';
import { Order } from './entities/order.entity.js';
import { OrderQueryDto } from './dto/order-query.dto.js';
import { toOrderResponse } from './dto/order-response.dto.js';
import type { OrderResponseDto } from './dto/order-response.dto.js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async findAll(
    query: OrderQueryDto,
  ): Promise<PaginatedResponseDto<OrderResponseDto>> {
    const { page, limit, userId, status } = query;

    const qb = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user');

    if (userId !== undefined) {
      qb.andWhere('user.id = :userId', { userId });
    }
    if (status !== undefined) {
      qb.andWhere('order.status = :status', { status });
    }

    qb.orderBy('order.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [orders, total] = await qb.getManyAndCount();

    return paginate(orders.map(toOrderResponse), total, page, limit);
  }

  async findOne(id: number): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return toOrderResponse(order);
  }
}
