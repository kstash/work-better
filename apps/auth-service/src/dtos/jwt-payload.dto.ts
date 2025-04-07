import { IsEmail, IsEnum, IsString } from 'class-validator';
import { UserRoleEnum } from '@work-better/common';

export class JwtPayloadDto {
  @IsString()
  sub: string;

  @IsEmail()
  email: string;

  @IsEnum(UserRoleEnum)
  role: string;

  constructor(partial: Partial<JwtPayloadDto>) {
    Object.assign(this, partial);
  }
}
