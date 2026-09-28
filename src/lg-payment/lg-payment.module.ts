import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LgPayment } from './entities/lg-payment.entity.js';
import { LgPaymentService } from './lg-payment.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([LgPayment])],
  providers: [LgPaymentService],
})
export class LgPaymentModule {}
