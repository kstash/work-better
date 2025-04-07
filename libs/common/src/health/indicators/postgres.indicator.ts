import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  HealthIndicatorStatusEnum,
  PostgresHealthStatus,
} from '../interfaces/health';
import { createHealthIndicator } from './base.indicator';
@Injectable()
export class PostgresHealthIndicator {
  constructor(private readonly dataSource: DataSource) {}

  async isHealthy(): Promise<PostgresHealthStatus> {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        postgres: createHealthIndicator(HealthIndicatorStatusEnum.UP),
      };
    } catch (error) {
      return {
        postgres: createHealthIndicator(
          HealthIndicatorStatusEnum.DOWN,
          error instanceof Error ? error.message : 'Unknown error occurred',
        ),
      };
    }
  }
}
