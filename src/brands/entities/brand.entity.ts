import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Tire } from '../../tires/entities/tire.entity.js';
import {
  BRAND_COUNTRY_MAX_LENGTH,
  BRAND_NAME_MAX_LENGTH,
} from '../constants/brand.constants.js';

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @MaxLength(BRAND_NAME_MAX_LENGTH)
  @Column()
  name: string;

  @IsOptional()
  @IsString()
  @Column({ name: 'logo_url', type: 'varchar', nullable: true })
  logoUrl: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(BRAND_COUNTRY_MAX_LENGTH)
  @Column({ type: 'varchar', nullable: true })
  country: string | null;

  @OneToMany(() => Tire, (tire) => tire.brand)
  tires: Relation<Tire[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
