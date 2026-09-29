import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { USER_PASSWORD_MAX_LENGTH } from '../../users/constants/users.constants.js';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(USER_PASSWORD_MAX_LENGTH)
  password: string;
}
