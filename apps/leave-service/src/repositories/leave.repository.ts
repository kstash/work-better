import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Leave } from '../entities/leave.entity';

@Injectable()
export class LeaveRepository {
  constructor(
    @InjectModel(Leave.name)
    private readonly leaveModel: Model<Leave>,
  ) {}

  async create(leave: Partial<Leave>): Promise<Leave> {
    const createdLeave = new this.leaveModel(leave);
    return createdLeave.save();
  }

  async findByUserId(userId: string): Promise<Leave[]> {
    return this.leaveModel.find({ userId }).sort({ startDate: -1 }).exec();
  }

  async findById(id: string): Promise<Leave | null> {
    return this.leaveModel.findById(id).exec();
  }

  async update(id: string, leave: Partial<Leave>): Promise<Leave | null> {
    return this.leaveModel.findByIdAndUpdate(id, leave, { new: true }).exec();
  }

  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Leave[]> {
    return this.leaveModel
      .find({
        userId,
        startDate: { $gte: startDate },
        endDate: { $lte: endDate },
      })
      .sort({ startDate: -1 })
      .exec();
  }

  async findOverlappingLeaves(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Leave[]> {
    return this.leaveModel
      .find({
        userId,
        $or: [
          {
            startDate: { $lte: endDate },
            endDate: { $gte: startDate },
          },
        ],
      })
      .exec();
  }
}
