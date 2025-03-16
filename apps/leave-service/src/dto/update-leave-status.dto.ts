import { IsEnum, IsString, IsOptional } from 'class-validator';
import { LeaveStatus } from '../entities/leave.entity';

export class UpdateLeaveStatusDto {
  @IsEnum(LeaveStatus)
  status: LeaveStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
