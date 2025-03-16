import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AttendanceService } from '../services/attendance.service';
import {
  AttendanceType,
  ValidationType,
} from '../interfaces/attendance.interface';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  async checkIn(
    @Body()
    body: {
      userId: string;
      validationType: ValidationType;
      validationData: any;
    },
  ) {
    return this.attendanceService.checkIn(
      body.userId,
      body.validationType,
      body.validationData,
    );
  }

  @Post('check-out')
  async checkOut(
    @Body()
    body: {
      userId: string;
      validationType: ValidationType;
      validationData: any;
    },
  ) {
    return this.attendanceService.checkOut(
      body.userId,
      body.validationType,
      body.validationData,
    );
  }

  @Get('history')
  async getAttendanceHistory(@Query('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('사용자 ID가 필요합니다.');
    }

    return this.attendanceService.getAttendanceHistory(userId);
  }

  @Get('by-date')
  async getAttendanceByDate(
    @Query('userId') userId: string,
    @Query('date') dateStr: string,
  ) {
    if (!userId || !dateStr) {
      throw new BadRequestException('사용자 ID와 날짜가 필요합니다.');
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('유효하지 않은 날짜 형식입니다.');
    }

    return this.attendanceService.getAttendanceByDate(userId, date);
  }

  @Put(':id/approve')
  async approveAttendance(
    @Param('id') id: string,
    @Body('approverId') approverId: string,
  ) {
    return this.attendanceService.approveAttendance(id, approverId);
  }

  @Put(':id/reject')
  async rejectAttendance(
    @Param('id') id: string,
    @Body() body: { approverId: string; reason: string },
  ) {
    return this.attendanceService.rejectAttendance(
      id,
      body.approverId,
      body.reason,
    );
  }
}
