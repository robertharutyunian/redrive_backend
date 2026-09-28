import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LgRefund } from './entities/lg-refund.entity.js';
import { LgRefundService } from './lg-refund.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([LgRefund])],
  providers: [LgRefundService],
})
export class LgRefundModule {}
