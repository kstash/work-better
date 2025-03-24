import { IsEnum, IsString, IsOptional } from 'class-validator';
import { LeaveStatusEnum } from '../interfaces';

export class UpdateLeaveStatusDto {
  @IsEnum(LeaveStatusEnum)
  status: LeaveStatusEnum;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
