import { IsNotEmpty, IsString } from 'class-validator';
import { IsAvailablePassword } from '../validators';

export class PatchPasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsAvailablePassword()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @IsAvailablePassword()
  newPassword: string;
}
