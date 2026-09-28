import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { IsEnum, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { Payment } from '../../payment/entities/payment.entity.js';
import { PaymentStatus } from '../../payment/enums/payment-status.enum.js';
import { LgPaymentEventType } from '../enums/lg-payment-event-type.enum.js';
import { LG_PAYMENT_MESSAGE_MAX_LENGTH } from '../constants/lg-payment.constants.js';

@Entity('lg_payment')
export class LgPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Payment)
  @JoinColumn({ name: 'payment_id' })
  payment: Relation<Payment>;

  @IsEnum(LgPaymentEventType)
  @Column({ name: 'event_type', type: 'enum', enum: LgPaymentEventType })
  eventType: LgPaymentEventType;

  @IsOptional()
  @IsEnum(PaymentStatus)
  @Column({
    name: 'previous_status',
    type: 'enum',
    enum: PaymentStatus,
    nullable: true,
  })
  previousStatus: PaymentStatus | null;

  @IsOptional()
  @IsEnum(PaymentStatus)
  @Column({ name: 'new_status', type: 'enum', enum: PaymentStatus, nullable: true })
  newStatus: PaymentStatus | null;

  @IsOptional()
  @IsString()
  @MaxLength(LG_PAYMENT_MESSAGE_MAX_LENGTH)
  @Column({ type: 'varchar', nullable: true })
  message: string | null;

  @IsOptional()
  @IsObject()
  @Column({ name: 'raw_payload', type: 'jsonb', nullable: true })
  rawPayload: Record<string, unknown> | null;

  // append-only log — no updatedAt, rows are never modified after creation
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
