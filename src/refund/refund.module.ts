import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Refund } from './entities/refund.entity.js';
import { RefundController } from './refund.controller.js';
import { RefundService } from './refund.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Refund])],
  controllers: [RefundController],
  providers: [RefundService],
})
export class RefundModule {}
