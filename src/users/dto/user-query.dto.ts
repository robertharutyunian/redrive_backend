import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import {
  USER_EMAIL_MAX_LENGTH,
  USER_USERNAME_MAX_LENGTH,
} from '../constants/users.constants.js';

export class UserQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(USER_EMAIL_MAX_LENGTH)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(USER_USERNAME_MAX_LENGTH)
  username?: string;
}
