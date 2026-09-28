import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from '../common/dto/paginated-response.dto.js';
import type { PaginatedResponseDto } from '../common/dto/paginated-response.dto.js';
import { Payment } from './entities/payment.entity.js';
import { PaymentQueryDto } from './dto/payment-query.dto.js';
import { toPaymentResponse } from './dto/payment-response.dto.js';
import type { PaymentResponseDto } from './dto/payment-response.dto.js';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async findAll(
    query: PaymentQueryDto,
  ): Promise<PaginatedResponseDto<PaymentResponseDto>> {
    const { page, limit, orderId, status, method } = query;

    const qb = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order');

    if (orderId !== undefined) {
      qb.andWhere('order.id = :orderId', { orderId });
    }
    if (status !== undefined) {
      qb.andWhere('payment.status = :status', { status });
    }
    if (method !== undefined) {
      qb.andWhere('payment.method = :method', { method });
    }

    qb.orderBy('payment.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [payments, total] = await qb.getManyAndCount();

    return paginate(payments.map(toPaymentResponse), total, page, limit);
  }

  async findOne(id: number): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: { order: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }

    return toPaymentResponse(payment);
  }
}
