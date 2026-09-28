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
import { Refund } from '../../refund/entities/refund.entity.js';
import { RefundStatus } from '../../refund/enums/refund-status.enum.js';
import { LgRefundEventType } from '../enums/lg-refund-event-type.enum.js';
import { LG_REFUND_MESSAGE_MAX_LENGTH } from '../constants/lg-refund.constants.js';

@Entity('lg_refund')
export class LgRefund {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Refund)
  @JoinColumn({ name: 'refund_id' })
  refund: Relation<Refund>;

  @IsEnum(LgRefundEventType)
  @Column({ name: 'event_type', type: 'enum', enum: LgRefundEventType })
  eventType: LgRefundEventType;

  @IsOptional()
  @IsEnum(RefundStatus)
  @Column({
    name: 'previous_status',
    type: 'enum',
    enum: RefundStatus,
    nullable: true,
  })
  previousStatus: RefundStatus | null;

  @IsOptional()
  @IsEnum(RefundStatus)
  @Column({ name: 'new_status', type: 'enum', enum: RefundStatus, nullable: true })
  newStatus: RefundStatus | null;

  @IsOptional()
  @IsString()
  @MaxLength(LG_REFUND_MESSAGE_MAX_LENGTH)
  @Column({ type: 'varchar', nullable: true })
  message: string | null;

  @IsOptional()
  @IsObject()
  @Column({ name: 'raw_payload', type: 'jsonb', nullable: true })
  rawPayload: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
