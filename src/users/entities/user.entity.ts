import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsDate, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  USER_EMAIL_MAX_LENGTH,
  USER_FNAME_MAX_LENGTH,
  USER_LNAME_MAX_LENGTH,
  USER_PASSWORD_MAX_LENGTH,
  USER_PASSWORD_RESET_TOKEN_HASH_LENGTH,
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

  @IsString()
  @MaxLength(USER_PHONE_MAX_LENGTH)
  @Column({ type: 'varchar' })
  phone: string;

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

  @IsOptional()
  @IsString()
  @MaxLength(USER_PASSWORD_RESET_TOKEN_HASH_LENGTH)
  @Column({
    name: 'password_reset_token_hash',
    type: 'varchar',
    length: USER_PASSWORD_RESET_TOKEN_HASH_LENGTH,
    nullable: true,
  })
  passwordResetTokenHash: string | null;

  @IsOptional()
  @IsDate()
  @Column({ name: 'password_reset_token_expires_at', type: 'timestamptz', nullable: true })
  passwordResetTokenExpiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
