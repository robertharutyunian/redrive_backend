import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import {
  USER_EMAIL_MAX_LENGTH,
  USER_FNAME_MAX_LENGTH,
  USER_LNAME_MAX_LENGTH,
  USER_PASSWORD_MAX_LENGTH,
  USER_PHONE_MAX_LENGTH,
  USER_PHONE_PATTERN,
  USER_PHONE_PATTERN_MESSAGE,
} from '../../users/constants/users.constants.js';
import {
  AUTH_PASSWORD_MIN_LENGTH,
  AUTH_PASSWORD_PATTERN,
  AUTH_PASSWORD_PATTERN_MESSAGE,
} from '../constants/auth.constants.js';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(USER_FNAME_MAX_LENGTH)
  fname: string;

  @IsString()
  @MaxLength(USER_LNAME_MAX_LENGTH)
  lname: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(USER_PHONE_MAX_LENGTH)
  @Matches(USER_PHONE_PATTERN, { message: USER_PHONE_PATTERN_MESSAGE })
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(USER_EMAIL_MAX_LENGTH)
  email: string;

  @IsString()
  @MinLength(AUTH_PASSWORD_MIN_LENGTH)
  @MaxLength(USER_PASSWORD_MAX_LENGTH)
  @Matches(AUTH_PASSWORD_PATTERN, { message: AUTH_PASSWORD_PATTERN_MESSAGE })
  password: string;
}
