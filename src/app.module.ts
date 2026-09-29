import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { BrandsModule } from './brands/brands.module.js';
import { TiresModule } from './tires/tires.module.js';
import { InventoryModule } from './inventory/inventory.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { OrderItemsModule } from './order-items/order-items.module.js';
import { EmailsModule } from './emails/emails.module.js';
import { PaymentModule } from './payment/payment.module.js';
import { LgPaymentModule } from './lg-payment/lg-payment.module.js';
import { RefundModule } from './refund/refund.module.js';
import { LgRefundModule } from './lg-refund/lg-refund.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    BrandsModule,
    TiresModule,
    InventoryModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    OrderItemsModule,
    EmailsModule,
    PaymentModule,
    LgPaymentModule,
    RefundModule,
    LgRefundModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
