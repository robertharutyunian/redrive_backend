import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LgRefund } from './entities/lg-refund.entity.js';

@Injectable()
export class LgRefundService {
  constructor(
    @InjectRepository(LgRefund)
    private readonly lgRefundRepository: Repository<LgRefund>,
  ) {}
}
