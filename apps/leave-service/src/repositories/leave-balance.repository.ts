import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeaveBalance } from '../entities/leave-balance.entity';

@Injectable()
export class LeaveBalanceRepository {
  constructor(
    @InjectModel(LeaveBalance.name)
    private readonly leaveBalanceModel: Model<LeaveBalance>,
  ) {}

  async create(leaveBalance: Partial<LeaveBalance>): Promise<LeaveBalance> {
    const createdLeaveBalance = new this.leaveBalanceModel(leaveBalance);
    return createdLeaveBalance.save();
  }

  async findByUserId(userId: string): Promise<LeaveBalance | null> {
    return this.leaveBalanceModel.findOne({ userId }).exec();
  }

  async update(
    userId: string,
    leaveBalance: Partial<LeaveBalance>,
  ): Promise<LeaveBalance | null> {
    return this.leaveBalanceModel
      .findOneAndUpdate({ userId }, leaveBalance, { new: true })
      .exec();
  }

  async findOrCreate(userId: string): Promise<LeaveBalance> {
    const currentYear = new Date().getFullYear();
    let leaveBalance = await this.findByUserId(userId);

    if (!leaveBalance) {
      leaveBalance = await this.create({
        userId,
        year: currentYear,
        totalAnnualLeave: 15,
        remainingAnnualLeave: 15,
        totalSickLeave: 60,
        remainingSickLeave: 60,
      });
    }

    return leaveBalance;
  }
}
