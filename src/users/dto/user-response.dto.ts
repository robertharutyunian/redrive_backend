import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity.js';

export class UserResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() fname: string;
  @ApiProperty() lname: string;
  @ApiProperty() phone: string;
  @ApiProperty() email: string;
  @ApiProperty() username: string;
  @ApiProperty() createdAt: Date;
}

export function toUserResponse(user: User): UserResponseDto {
  return {
    id: user.id,
    fname: user.fname,
    lname: user.lname,
    phone: user.phone,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt,
  };
}
