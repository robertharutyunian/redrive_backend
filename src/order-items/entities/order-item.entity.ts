import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Transform } from 'class-transformer';
import { IsInt, IsNumberString, Min } from 'class-validator';
import { Order } from '../../orders/entities/order.entity.js';
import { Tire } from '../../tires/entities/tire.entity.js';
import { ORDER_ITEM_QUANTITY_MIN } from '../constants/order-item.constants.js';
import { MONEY_PRECISION, MONEY_SCALE } from '../../common/constants/money.constants.js';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Relation<Order>;

  @Index()
  @ManyToOne(() => Tire)
  @JoinColumn({ name: 'tire_id' })
  tire: Relation<Tire>;

  @IsInt()
  @Min(ORDER_ITEM_QUANTITY_MIN)
  @Column()
  quantity: number;

  @IsNumberString()
  @Transform(({ value }) => parseFloat(value))
  @Column({
    name: 'unit_price',
    type: 'numeric',
    precision: MONEY_PRECISION,
    scale: MONEY_SCALE,
  })
  unitPrice: string;

  @IsNumberString()
  @Transform(({ value }) => parseFloat(value))
  @Column({
    name: 'total_price',
    type: 'numeric',
    precision: MONEY_PRECISION,
    scale: MONEY_SCALE,
  })
  totalPrice: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
