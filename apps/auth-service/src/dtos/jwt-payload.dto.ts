import { IsEmail, IsEnum, IsString } from 'class-validator';
import { UserRole } from '@work-better/common';

export class JwtPayloadDto {
  @IsString()
  sub: string;

  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: string;

  constructor(partial: Partial<JwtPayloadDto>) {
    Object.assign(this, partial);
  }
}
