import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import {
  AUTH_PASSWORD_MIN_LENGTH,
  AUTH_PASSWORD_PATTERN,
  AUTH_PASSWORD_PATTERN_MESSAGE,
} from '../constants/auth.constants.js';
import { USER_PASSWORD_MAX_LENGTH } from '../../users/constants/users.constants.js';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(USER_PASSWORD_MAX_LENGTH)
  currentPassword: string;

  @IsString()
  @MinLength(AUTH_PASSWORD_MIN_LENGTH)
  @MaxLength(USER_PASSWORD_MAX_LENGTH)
  @Matches(AUTH_PASSWORD_PATTERN, { message: AUTH_PASSWORD_PATTERN_MESSAGE })
  newPassword: string;
}
