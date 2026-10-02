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
import { Order } from '../../orders/entities/order.entity.js';
import { PaymentMethod } from '../enums/payment-method.enum.js';
import { PaymentStatus } from '../enums/payment-status.enum.js';
import {
  PAYMENT_GATEWAY_MAX_LENGTH,
  PAYMENT_GATEWAY_REFERENCE_MAX_LENGTH,
} from '../constants/payment.constants.js';
import { MONEY_PRECISION, MONEY_SCALE } from '../../common/constants/money.constants.js';

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Relation<Order>;

  @IsNumberString()
  @Transform(({ value }) => parseFloat(value))
  @Column({
    type: 'numeric',
    precision: MONEY_PRECISION,
    scale: MONEY_SCALE,
  })
  amount: string;

  @IsEnum(PaymentMethod)
  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @IsEnum(PaymentStatus)
  @Index()
  @Column({ type: 'enum', enum: PaymentStatus })
  status: PaymentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(PAYMENT_GATEWAY_MAX_LENGTH)
  @Column({ type: 'varchar', nullable: true })
  gateway: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(PAYMENT_GATEWAY_REFERENCE_MAX_LENGTH)
  @Index({ unique: true })
  @Column({ name: 'gateway_reference', type: 'varchar', nullable: true })
  gatewayReference: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
