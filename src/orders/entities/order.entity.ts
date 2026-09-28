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
import {
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { User } from '../../users/entities/user.entity.js';
import { DeliveryMethod } from '../enums/delivery-method.enum.js';
import { OrderStatus } from '../enums/order-status.enum.js';
import {
  ORDER_DELIVERY_ADDRESS_MAX_LENGTH,
  ORDER_DELIVERY_INSTRUCTIONS_MAX_LENGTH,
  ORDER_TOTAL_PRICE_PRECISION,
  ORDER_TOTAL_PRICE_SCALE,
} from '../constants/orders.constants.js';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @IsEnum(DeliveryMethod)
  @Column({ name: 'delivery_method', type: 'enum', enum: DeliveryMethod })
  deliveryMethod: DeliveryMethod;

  @IsString()
  @MaxLength(ORDER_DELIVERY_ADDRESS_MAX_LENGTH)
  @Column({ name: 'delivery_address' })
  deliveryAddress: string;

  @IsOptional()
  @IsString()
  @MaxLength(ORDER_DELIVERY_INSTRUCTIONS_MAX_LENGTH)
  @Column({ name: 'delivery_instructions', type: 'varchar', nullable: true })
  deliveryInstructions: string | null;

  @IsEnum(OrderStatus)
  @Index()
  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;

  @IsNumberString()
  @Transform(({ value }) => parseFloat(value))
  @Column({
    name: 'total_price',
    type: 'numeric',
    precision: ORDER_TOTAL_PRICE_PRECISION,
    scale: ORDER_TOTAL_PRICE_SCALE,
  })
  totalPrice: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
