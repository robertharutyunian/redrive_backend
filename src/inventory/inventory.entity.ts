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
import { Tire } from '../tires/tire.entity.js';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Tire)
  @JoinColumn({ name: 'tire_id' })
  tire: Relation<Tire>;

  @Column()
  quantity: number;

  @Column({ name: 'origin_price', type: 'numeric', precision: 10, scale: 2 })
  originPrice: string;

  @Column({ name: 'unit_price', type: 'numeric', precision: 10, scale: 2 })
  unitPrice: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
