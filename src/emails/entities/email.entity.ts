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
import { IsDate, IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { User } from '../../users/entities/user.entity.js';
import { USER_EMAIL_MAX_LENGTH } from '../../users/constants/users.constants.js';
import { Order } from '../../orders/entities/order.entity.js';
import { EmailType } from '../enums/email-type.enum.js';
import { EMAIL_INVOICE_URL_MAX_LENGTH } from '../constants/email.constants.js';

@Entity('emails')
export class Email {
  @PrimaryGeneratedColumn()
  id: number;

  // Optional attribution link only ("which account, if any, does this relate to").
  // Null for guest-order emails. The actual destination lives in recipientEmail.
  @Index()
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User> | null;

  @IsEmail()
  @MaxLength(USER_EMAIL_MAX_LENGTH)
  @Column({ name: 'recipient_email', type: 'varchar', length: USER_EMAIL_MAX_LENGTH })
  recipientEmail: string;

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
