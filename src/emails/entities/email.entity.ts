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
import { IsDate, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { User } from '../../users/entities/user.entity.js';
import { Order } from '../../orders/entities/order.entity.js';
import { EmailType } from '../enums/email-type.enum.js';
import { EMAIL_INVOICE_URL_MAX_LENGTH } from '../constants/email.constants.js';

@Entity('emails')
export class Email {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Index()
  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order: Relation<Order> | null;

  @IsEnum(EmailType)
  @Column({ type: 'enum', enum: EmailType })
  type: EmailType;

  @IsOptional()
  @IsDate()
  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @IsOptional()
  @IsString()
  @MaxLength(EMAIL_INVOICE_URL_MAX_LENGTH)
  @Column({ name: 'invoice_url', type: 'varchar', nullable: true })
  invoiceUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
