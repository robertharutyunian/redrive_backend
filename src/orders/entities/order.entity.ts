import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { User } from '../../users/entities/user.entity.js';
import { OrderItem } from '../../order-items/entities/order-item.entity.js';
import {
  USER_EMAIL_MAX_LENGTH,
  USER_PHONE_MAX_LENGTH,
  USER_PHONE_PATTERN,
  USER_PHONE_PATTERN_MESSAGE,
} from '../../users/constants/users.constants.js';
import { DeliveryMethod } from '../enums/delivery-method.enum.js';
import { OrderStatus } from '../enums/order-status.enum.js';
import {
  ORDER_DELIVERY_ADDRESS_MAX_LENGTH,
  ORDER_DELIVERY_INSTRUCTIONS_MAX_LENGTH,
  ORDER_CONTACT_NAME_MAX_LENGTH,
} from '../constants/orders.constants.js';
import { MONEY_PRECISION, MONEY_SCALE } from '../../common/constants/money.constants.js';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User> | null;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: Relation<OrderItem[]>;

  // Contact details are snapshotted per order: copied from the user's profile for
  // logged-in checkout, taken from the form for guest checkout. Never read live from
  // the user row, so an order always records who to contact as of purchase time.
  @IsString()
  @IsNotEmpty()
  @MaxLength(ORDER_CONTACT_NAME_MAX_LENGTH)
  @Column({ name: 'contact_name', type: 'varchar', length: ORDER_CONTACT_NAME_MAX_LENGTH })
  contactName: string;

  @IsEmail()
  @MaxLength(USER_EMAIL_MAX_LENGTH)
  @Column({ name: 'contact_email', type: 'varchar', length: USER_EMAIL_MAX_LENGTH })
  contactEmail: string;

  @Matches(USER_PHONE_PATTERN, { message: USER_PHONE_PATTERN_MESSAGE })
  @MaxLength(USER_PHONE_MAX_LENGTH)
  @Column({ name: 'contact_phone', type: 'varchar', length: USER_PHONE_MAX_LENGTH })
  contactPhone: string;

  @IsEnum(DeliveryMethod)
  @Column({ name: 'delivery_method', type: 'enum', enum: DeliveryMethod })
  deliveryMethod: DeliveryMethod;

  @IsOptional()
  @IsString()
  @MaxLength(ORDER_DELIVERY_ADDRESS_MAX_LENGTH)
  @Column({ name: 'delivery_address', type: 'varchar', nullable: true })
  deliveryAddress: string | null;

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
    precision: MONEY_PRECISION,
    scale: MONEY_SCALE,
  })
  totalPrice: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
