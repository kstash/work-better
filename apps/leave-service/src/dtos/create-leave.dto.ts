import { IsEnum, IsString, IsDateString, IsNotEmpty } from 'class-validator';
import { LeaveTypeEnum } from '../interfaces';

export class CreateLeaveDto {
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsEnum(LeaveTypeEnum)
  @IsNotEmpty()
  type: LeaveTypeEnum;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
