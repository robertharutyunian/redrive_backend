import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Brand } from '../brands/brand.entity.js';
import { Inventory } from '../inventory/inventory.entity.js';

export enum TireSeason {
  SUMMER = 'summer',
  WINTER = 'winter',
  ALL_SEASON = 'all_season',
}

@Entity('tires')
export class Tire {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Brand, (brand) => brand.tires)
  @JoinColumn({ name: 'brand_id' })
  brand: Relation<Brand>;

  @Column()
  model: string;

  @Column({ type: 'enum', enum: TireSeason })
  season: TireSeason;

  @Column()
  width: number;

  @Column()
  profile: number;

  @Column()
  radius: number;

  @Column({ name: 'load_index' })
  loadIndex: number;

  @Column({ name: 'speed_rating' })
  speedRating: string;

  @Column({ name: 'extra_load', default: false })
  extraLoad: boolean;

  @Column({ default: false })
  featured: boolean;

  @OneToOne(() => Inventory, (inventory) => inventory.tire)
  inventory: Relation<Inventory>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
