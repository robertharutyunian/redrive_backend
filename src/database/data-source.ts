import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Brand } from '../brands/entities/brand.entity.js';
import { Tire } from '../tires/entities/tire.entity.js';
import { Inventory } from '../inventory/entities/inventory.entity.js';
import { Payment } from '../payment/entities/payment.entity.js';
import { LgPayment } from '../lg-payment/entities/lg-payment.entity.js';
import { Refund } from '../refund/entities/refund.entity.js';
import { LgRefund } from '../lg-refund/entities/lg-refund.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrderItem } from '../order-items/entities/order-item.entity.js';
import { Email } from '../emails/entities/email.entity.js';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    Brand,
    Tire,
    Inventory,
    User,
    Order,
    OrderItem,
    Email,
    Payment,
    LgPayment,
    Refund,
    LgRefund,
  ],
  migrations: ['dist/database/migrations/*.js'],
});
