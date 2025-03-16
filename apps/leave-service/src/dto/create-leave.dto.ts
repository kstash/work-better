import { IsEnum, IsString, IsDateString, IsNotEmpty } from 'class-validator';
import { LeaveType } from '../entities/leave.entity';

export class CreateLeaveDto {
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsEnum(LeaveType)
  @IsNotEmpty()
  type: LeaveType;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
