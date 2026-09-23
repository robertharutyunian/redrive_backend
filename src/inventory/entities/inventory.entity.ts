import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Transform } from 'class-transformer';
import { IsInt, IsNumberString, Min } from 'class-validator';
import { Tire } from '../../tires/entities/tire.entity.js';
import {
  INVENTORY_PRICE_PRECISION,
  INVENTORY_PRICE_SCALE,
  INVENTORY_QUANTITY_MIN,
} from '../constants/inventory.constants.js';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Tire)
  @JoinColumn({ name: 'tire_id' })
  tire: Relation<Tire>;

  @IsInt()
  @Min(INVENTORY_QUANTITY_MIN)
  @Column()
  quantity: number;

  @IsNumberString()
  @Transform(({ value }) => parseFloat(value))
  @Column({ name: 'origin_price', type: 'numeric', precision: INVENTORY_PRICE_PRECISION, scale: INVENTORY_PRICE_SCALE })
  originPrice: string;

  @IsNumberString()
  @Transform(({ value }) => parseFloat(value))
  @Column({ name: 'unit_price', type: 'numeric', precision: INVENTORY_PRICE_PRECISION, scale: INVENTORY_PRICE_SCALE })
  unitPrice: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
