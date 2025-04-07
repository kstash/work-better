import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import {
  HealthIndicatorStatusEnum,
  MongoHealthStatus,
} from '../interfaces/health';
import { createHealthIndicator } from './base.indicator';

@Injectable()
export class MongoHealthIndicator {
  constructor(private readonly connection: Connection) {}

  async isHealthy(): Promise<MongoHealthStatus> {
    try {
      await this.connection.db.admin().ping();
      return {
        mongo: createHealthIndicator(HealthIndicatorStatusEnum.UP),
      };
    } catch (error) {
      return {
        mongo: createHealthIndicator(
          HealthIndicatorStatusEnum.DOWN,
          error instanceof Error ? error.message : 'Unknown error occurred',
        ),
      };
    }
  }
}
