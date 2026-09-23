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
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Brand } from '../../brands/entities/brand.entity.js';
import { Inventory } from '../../inventory/entities/inventory.entity.js';
import { TireSeason } from '../enums/tire-season.enum.js';
import {
  TIRE_DIMENSION_MIN,
  TIRE_LOAD_INDEX_MIN,
  TIRE_MODEL_MAX_LENGTH,
  TIRE_SPEED_RATING_MAX_LENGTH,
} from '../constants/tire.constants.js';

@Entity('tires')
export class Tire {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Brand, (brand) => brand.tires)
  @JoinColumn({ name: 'brand_id' })
  brand: Relation<Brand>;

  @IsString()
  @MaxLength(TIRE_MODEL_MAX_LENGTH)
  @Column()
  model: string;

  @IsEnum(TireSeason)
  @Column({ type: 'enum', enum: TireSeason })
  season: TireSeason;

  @IsInt()
  @Min(TIRE_DIMENSION_MIN)
  @Column()
  width: number;

  @IsInt()
  @Min(TIRE_DIMENSION_MIN)
  @Column()
  profile: number;

  @IsInt()
  @Min(TIRE_DIMENSION_MIN)
  @Column()
  radius: number;

  @IsInt()
  @Min(TIRE_LOAD_INDEX_MIN)
  @Column({ name: 'load_index' })
  loadIndex: number;

  @IsString()
  @MaxLength(TIRE_SPEED_RATING_MAX_LENGTH)
  @Column({ name: 'speed_rating' })
  speedRating: string;

  @IsBoolean()
  @Column({ name: 'extra_load', default: false })
  extraLoad: boolean;

  @IsBoolean()
  @Column({ default: false })
  featured: boolean;

  @OneToOne(() => Inventory, (inventory) => inventory.tire)
  inventory: Relation<Inventory>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
