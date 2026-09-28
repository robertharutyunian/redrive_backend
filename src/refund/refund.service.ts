import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from '../common/dto/paginated-response.dto.js';
import type { PaginatedResponseDto } from '../common/dto/paginated-response.dto.js';
import { Refund } from './entities/refund.entity.js';
import { RefundQueryDto } from './dto/refund-query.dto.js';
import { toRefundResponse } from './dto/refund-response.dto.js';
import type { RefundResponseDto } from './dto/refund-response.dto.js';

@Injectable()
export class RefundService {
  constructor(
    @InjectRepository(Refund)
    private readonly refundRepository: Repository<Refund>,
  ) {}

  async findAll(
    query: RefundQueryDto,
  ): Promise<PaginatedResponseDto<RefundResponseDto>> {
    const { page, limit, paymentId, status } = query;

    const qb = this.refundRepository
      .createQueryBuilder('refund')
      .leftJoinAndSelect('refund.payment', 'payment');

    if (paymentId !== undefined) {
      qb.andWhere('payment.id = :paymentId', { paymentId });
    }
    if (status !== undefined) {
      qb.andWhere('refund.status = :status', { status });
    }

    qb.orderBy('refund.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [refunds, total] = await qb.getManyAndCount();

    return paginate(refunds.map(toRefundResponse), total, page, limit);
  }

  async findOne(id: number): Promise<RefundResponseDto> {
    const refund = await this.refundRepository.findOne({
      where: { id },
      relations: { payment: true },
    });

    if (!refund) {
      throw new NotFoundException(`Refund ${id} not found`);
    }

    return toRefundResponse(refund);
  }
}
