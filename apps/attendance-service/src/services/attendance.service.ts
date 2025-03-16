import { Injectable, BadRequestException } from '@nestjs/common';
import { AttendanceRepository } from '../repositories/attendance.repository';
import { Attendance } from '../entities/attendance.entity';
import { GPSValidationStrategy } from './validation/gps-validation.strategy';
import { QRValidationStrategy } from './validation/qr-validation.strategy';
import {
  AttendanceType,
  ValidationType,
  AttendanceStatus,
  AttendanceMethod,
} from '../interfaces/attendance.interface';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly gpsValidationStrategy: GPSValidationStrategy,
    private readonly qrValidationStrategy: QRValidationStrategy,
  ) {}

  async checkIn(
    userId: string,
    validationType: ValidationType,
    validationData: any,
  ): Promise<Attendance> {
    // 이미 체크인했는지 확인
    const latestAttendance =
      await this.attendanceRepository.findLatestByUserId(userId);
    if (
      latestAttendance &&
      latestAttendance.type === AttendanceType.CHECK_IN &&
      this.isSameDay(latestAttendance.timestamp, new Date())
    ) {
      throw new BadRequestException('Already checked in today');
    }

    // 유효성 검사 전략 선택
    const validationStrategy =
      validationType === ValidationType.GPS
        ? this.gpsValidationStrategy
        : this.qrValidationStrategy;

    // 유효성 검사 수행
    const isValid = await validationStrategy.validate(validationData);
    if (!isValid) {
      throw new BadRequestException('Invalid check-in data');
    }

    // 출근 기록 생성
    return this.attendanceRepository.create({
      userId,
      type: AttendanceType.CHECK_IN,
      timestamp: new Date(),
      validationType,
      validationData,
      method:
        validationType === ValidationType.GPS
          ? AttendanceMethod.GPS
          : AttendanceMethod.QR,
      status: AttendanceStatus.PENDING,
    });
  }

  async checkOut(
    userId: string,
    validationType: ValidationType,
    validationData: any,
  ): Promise<Attendance> {
    // 오늘 체크인 했는지 확인
    const latestAttendance =
      await this.attendanceRepository.findLatestByUserId(userId);
    if (
      !latestAttendance ||
      latestAttendance.type !== AttendanceType.CHECK_IN ||
      !this.isSameDay(latestAttendance.timestamp, new Date())
    ) {
      throw new BadRequestException('No check-in record found for today');
    }

    // 유효성 검사 전략 선택
    const validationStrategy =
      validationType === ValidationType.GPS
        ? this.gpsValidationStrategy
        : this.qrValidationStrategy;

    // 유효성 검사 수행
    const isValid = await validationStrategy.validate(validationData);
    if (!isValid) {
      throw new BadRequestException('Invalid check-out data');
    }

    // 퇴근 기록 생성
    return this.attendanceRepository.create({
      userId,
      type: AttendanceType.CHECK_OUT,
      timestamp: new Date(),
      validationType,
      validationData,
      method:
        validationType === ValidationType.GPS
          ? AttendanceMethod.GPS
          : AttendanceMethod.QR,
      status: AttendanceStatus.PENDING,
    });
  }

  async getAttendanceHistory(userId: string): Promise<Attendance[]> {
    return this.attendanceRepository.findByUserId(userId);
  }

  async getAttendanceByDate(userId: string, date: Date): Promise<Attendance[]> {
    return this.attendanceRepository.findByDate(userId, date);
  }

  async approveAttendance(id: string, approverId: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findById(id);
    if (!attendance) {
      throw new BadRequestException('출퇴근 기록을 찾을 수 없습니다.');
    }

    attendance.status = AttendanceStatus.APPROVED;
    attendance.metadata = {
      ...attendance.metadata,
      approvedBy: approverId,
      approvedAt: new Date(),
    };

    return this.attendanceRepository.save(attendance);
  }

  async rejectAttendance(
    id: string,
    approverId: string,
    reason: string,
  ): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findById(id);
    if (!attendance) {
      throw new BadRequestException('출퇴근 기록을 찾을 수 없습니다.');
    }

    attendance.status = AttendanceStatus.REJECTED;
    attendance.metadata = {
      ...attendance.metadata,
      rejectedBy: approverId,
      rejectedAt: new Date(),
      rejectionReason: reason,
    };

    return this.attendanceRepository.save(attendance);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
}
