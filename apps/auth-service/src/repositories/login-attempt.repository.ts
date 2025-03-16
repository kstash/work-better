import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginAttempt } from '../entities/login-attempt.entity';

@Injectable()
export class LoginAttemptRepository {
  constructor(
    @InjectModel(LoginAttempt.name)
    private readonly loginAttemptModel: Model<LoginAttempt>,
  ) {}

  async create(loginAttempt: Partial<LoginAttempt>): Promise<LoginAttempt> {
    const createdLoginAttempt = new this.loginAttemptModel(loginAttempt);
    return createdLoginAttempt.save();
  }

  async findByUserId(userId: string): Promise<LoginAttempt[]> {
    return this.loginAttemptModel.find({ userId }).exec();
  }

  async findRecentAttempts(
    userId: string,
    minutes: number,
  ): Promise<LoginAttempt[]> {
    const date = new Date();
    date.setMinutes(date.getMinutes() - minutes);

    return this.loginAttemptModel
      .find({
        userId,
        createdAt: { $gte: date },
      })
      .exec();
  }
}
