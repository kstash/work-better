import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { Leave, LeaveBalance } from '../entities';
import { CreateLeaveDto, UpdateLeaveStatusDto } from '../dtos';
import { LeaveRepository, LeaveBalanceRepository } from '../repositories';
import { LeaveStatusEnum, LeaveTypeEnum } from '../interfaces';
@Injectable()
export class LeaveService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly leaveRepository: LeaveRepository,
    private readonly leaveBalanceRepository: LeaveBalanceRepository,
  ) {}

  async requestLeave(
    createLeaveDto: CreateLeaveDto,
    userId: string,
  ): Promise<Leave> {
    const startDate = new Date(createLeaveDto.startDate);
    const endDate = new Date(createLeaveDto.endDate);
    const days = this.calculateLeaveDays(startDate, endDate);

    if (days <= 0) {
      throw new BadRequestException('Invalid leave period');
    }

    // 휴가 잔여일수 확인
    const balance = await this.leaveBalanceRepository.findOrCreate(userId);
    const availableDays =
      createLeaveDto.type === LeaveTypeEnum.ANNUAL
        ? balance.remainingAnnualLeave
        : balance.remainingSickLeave;

    if (days > availableDays) {
      throw new BadRequestException('Insufficient leave balance');
    }

    // 휴가 기간 중복 확인
    const overlappingLeaves = await this.leaveRepository.findOverlappingLeaves(
      userId,
      startDate,
      endDate,
    );

    if (overlappingLeaves.length > 0) {
      throw new BadRequestException(
        'Leave period overlaps with existing leave',
      );
    }

    // 휴가 신청 생성
    const leave = await this.leaveRepository.create({
      userId,
      startDate,
      endDate,
      days,
      type: createLeaveDto.type,
      reason: createLeaveDto.reason,
      status: LeaveStatusEnum.PENDING,
    });

    // 휴가 잔여일수 업데이트
    if (createLeaveDto.type === LeaveTypeEnum.ANNUAL) {
      balance.remainingAnnualLeave -= days;
    } else {
      balance.remainingSickLeave -= days;
    }
    await this.leaveBalanceRepository.update(userId, balance);

    return leave;
  }

  async getLeaves(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Leave[]> {
    if (startDate && endDate) {
      return this.leaveRepository.findByDateRange(
        userId,
        new Date(startDate),
        new Date(endDate),
      );
    }
    return this.leaveRepository.findByUserId(userId);
  }

  async getLeaveBalance(userId: string): Promise<LeaveBalance> {
    return this.leaveBalanceRepository.findOrCreate(userId);
  }

  async cancelLeave(userId: string, leaveId: string): Promise<Leave> {
    const leave = await this.leaveRepository.findById(leaveId);

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (leave.userId !== userId) {
      throw new ForbiddenException('Unauthorized to cancel this leave');
    }

    if (leave.status !== LeaveStatusEnum.PENDING) {
      throw new BadRequestException('Can only cancel pending leave requests');
    }

    // 휴가 상태 업데이트
    const updatedLeave = await this.leaveRepository.updateById(leaveId, {
      status: LeaveStatusEnum.CANCELLED,
    });

    // 휴가 잔여일수 복구
    const balance = await this.leaveBalanceRepository.findByUserId(userId);
    if (balance) {
      const days = this.calculateLeaveDays(leave.startDate, leave.endDate);
      if (leave.type === LeaveTypeEnum.ANNUAL) {
        balance.remainingAnnualLeave += days;
      } else {
        balance.remainingSickLeave += days;
      }
      await this.leaveBalanceRepository.update(userId, balance);
    }

    return updatedLeave;
  }

  async updateLeaveStatus(
    leaveId: string,
    approverId: string,
    updateLeaveStatusDto: UpdateLeaveStatusDto,
  ): Promise<Leave> {
    const leave = await this.leaveRepository.findById(leaveId);

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (leave.status !== LeaveStatusEnum.PENDING) {
      throw new BadRequestException('Can only process pending leave requests');
    }

    const updatedLeave = await this.leaveRepository.updateById(leaveId, {
      status: updateLeaveStatusDto.status,
      approverId,
      approvedAt: new Date(),
      ...(updateLeaveStatusDto.status === LeaveStatusEnum.REJECTED && {
        rejectionReason: updateLeaveStatusDto.rejectionReason,
      }),
    });

    // 승인된 경우에만 휴가 잔여일수 차감
    if (updateLeaveStatusDto.status === LeaveStatusEnum.APPROVED) {
      const balance = await this.leaveBalanceRepository.findByUserId(
        leave.userId,
      );
      if (balance) {
        if (leave.type === LeaveTypeEnum.ANNUAL) {
          balance.remainingAnnualLeave -= leave.days;
        } else {
          balance.remainingSickLeave -= leave.days;
        }
        await this.leaveBalanceRepository.update(leave.userId, balance);
      }
    }

    return updatedLeave;
  }

  private calculateLeaveDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let days = 0;
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // 주말 제외
        days++;
      }
      current.setDate(current.getDate() + 1);
    }

    return days;
  }
}
