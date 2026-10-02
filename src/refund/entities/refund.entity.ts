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
import { IsEnum, IsNumberString, IsOptional, IsString, MaxLength } from 'class-validator';
import { Payment } from '../../payment/entities/payment.entity.js';
import { RefundStatus } from '../enums/refund-status.enum.js';
import {
  REFUND_GATEWAY_REFERENCE_MAX_LENGTH,
  REFUND_REASON_MAX_LENGTH,
} from '../constants/refund.constants.js';
import { MONEY_PRECISION, MONEY_SCALE } from '../../common/constants/money.constants.js';

@Entity('refund')
export class Refund {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Payment)
  @JoinColumn({ name: 'payment_id' })
  payment: Relation<Payment>;

  @IsNumberString()
  @Transform(({ value }) => parseFloat(value))
  @Column({
    type: 'numeric',
    precision: MONEY_PRECISION,
    scale: MONEY_SCALE,
  })
  amount: string;

  @IsOptional()
  @IsString()
  @MaxLength(REFUND_REASON_MAX_LENGTH)
  @Column({ type: 'varchar', nullable: true })
  reason: string | null;

  @IsEnum(RefundStatus)
  @Index()
  @Column({ type: 'enum', enum: RefundStatus })
  status: RefundStatus;

  @IsOptional()
  @IsString()
  @MaxLength(REFUND_GATEWAY_REFERENCE_MAX_LENGTH)
  @Index({ unique: true })
  @Column({ name: 'gateway_reference', type: 'varchar', nullable: true })
  gatewayReference: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
