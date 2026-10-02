import { IsEmail, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import {
  USER_EMAIL_MAX_LENGTH,
  USER_FNAME_MAX_LENGTH,
  USER_LNAME_MAX_LENGTH,
  USER_PHONE_MAX_LENGTH,
  USER_PHONE_PATTERN,
  USER_PHONE_PATTERN_MESSAGE,
} from '../constants/users.constants.js';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(USER_FNAME_MAX_LENGTH)
  fname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(USER_LNAME_MAX_LENGTH)
  lname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(USER_PHONE_MAX_LENGTH)
  @Matches(USER_PHONE_PATTERN, { message: USER_PHONE_PATTERN_MESSAGE })
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(USER_EMAIL_MAX_LENGTH)
  email?: string;
}
