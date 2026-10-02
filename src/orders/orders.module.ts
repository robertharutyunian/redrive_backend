import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { User } from '../users/entities/user.entity.js';
import { Inventory } from '../inventory/entities/inventory.entity.js';
import { OrderItem } from '../order-items/entities/order-item.entity.js';
import { Payment } from '../payment/entities/payment.entity.js';
import { Email } from '../emails/entities/email.entity.js';
import { Order } from './entities/order.entity.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, User, Inventory, OrderItem, Payment, Email]),
    AuthModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
