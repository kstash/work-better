import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
    try {
      const createdLeave = new this.leaveModel(leave);
      return await createdLeave.save();
    } catch (error) {
      throw new InternalServerErrorException('Leave create failed');
    }
  }

  async findByUserId(userId: string): Promise<Leave[]> {
    try {
      return await this.leaveModel
        .find({ userId })
        .sort({ startDate: -1 })
        .exec();
    } catch (error) {
      throw new InternalServerErrorException('Leave find failed');
    }
  }

  async findById(id: string): Promise<Leave> {
    const leave = await this.leaveModel.findById(id).exec();
    if (!leave) {
      throw new NotFoundException('Leave not found');
    }
    return leave;
  }

  async updateById(id: string, data: Partial<Leave>): Promise<Leave> {
    try {
      const leave = await this.findById(id);
      Object.assign(leave, data);
      const updatedLeave = await leave.updateOne(data);
      return updatedLeave;
    } catch (error) {
      throw new InternalServerErrorException('Leave update failed');
    }
  }

  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Leave[]> {
    try {
      return await this.leaveModel
        .find({
          userId,
          startDate: { $gte: startDate },
          endDate: { $lte: endDate },
        })
        .sort({ startDate: -1 })
        .exec();
    } catch (error) {
      throw new InternalServerErrorException('Leave find failed');
    }
  }

  async findOverlappingLeaves(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Leave[]> {
    try {
      return await this.leaveModel
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
    } catch (error) {
      throw new InternalServerErrorException('Leave find failed');
    }
  }
}
