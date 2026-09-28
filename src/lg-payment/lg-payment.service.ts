import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LgPayment } from './entities/lg-payment.entity.js';

@Injectable()
export class LgPaymentService {
  constructor(
    @InjectRepository(LgPayment)
    private readonly lgPaymentRepository: Repository<LgPayment>,
  ) {}
}
