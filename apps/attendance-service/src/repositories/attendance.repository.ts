import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance } from '../entities/attendance.entity';

@Injectable()
export class AttendanceRepository {
  constructor(
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<Attendance>,
  ) {}

  async create(data: Partial<Attendance>): Promise<Attendance> {
    const attendance = new this.attendanceModel(data);
    return attendance.save();
  }

  async findById(id: string): Promise<Attendance | null> {
    return this.attendanceModel.findById(id).exec();
  }

  async save(attendance: Attendance): Promise<Attendance> {
    return attendance.save();
  }

  async findLatestByUserId(userId: string): Promise<Attendance | null> {
    return this.attendanceModel
      .findOne({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUserId(userId: string): Promise<Attendance[]> {
    return this.attendanceModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findByDate(userId: string, date: Date): Promise<Attendance[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.attendanceModel
      .find({
        userId,
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Attendance[]> {
    return this.attendanceModel
      .find({
        userId,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ createdAt: -1 })
      .exec();
  }
}
