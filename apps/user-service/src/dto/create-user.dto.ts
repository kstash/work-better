import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';
import { UserRole } from '../interfaces/user.interface';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
