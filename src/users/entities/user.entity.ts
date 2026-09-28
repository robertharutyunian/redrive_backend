import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  USER_EMAIL_MAX_LENGTH,
  USER_FNAME_MAX_LENGTH,
  USER_LNAME_MAX_LENGTH,
  USER_PASSWORD_MAX_LENGTH,
  USER_PHONE_MAX_LENGTH,
  USER_USERNAME_MAX_LENGTH,
} from '../constants/users.constants.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @MaxLength(USER_FNAME_MAX_LENGTH)
  @Column()
  fname: string;

  @IsString()
  @MaxLength(USER_LNAME_MAX_LENGTH)
  @Column()
  lname: string;

  @IsOptional()
  @IsString()
  @MaxLength(USER_PHONE_MAX_LENGTH)
  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @IsEmail()
  @MaxLength(USER_EMAIL_MAX_LENGTH)
  @Column({ unique: true })
  email: string;

  @IsString()
  @MaxLength(USER_USERNAME_MAX_LENGTH)
  @Column({ unique: true })
  username: string;

  @IsString()
  @MaxLength(USER_PASSWORD_MAX_LENGTH)
  @Column()
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
