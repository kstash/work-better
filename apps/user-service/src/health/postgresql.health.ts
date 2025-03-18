import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  HealthIndicatorStatusEnum,
  PostgreSQLHealthStatus,
  createHealthIndicator,
} from './types/health.types';

@Injectable()
export class PostgreSQLHealthIndicator {
  constructor(private readonly dataSource: DataSource) {}

  async isHealthy(): Promise<PostgreSQLHealthStatus> {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        postgresql: createHealthIndicator(HealthIndicatorStatusEnum.UP),
      };
    } catch (error) {
      return {
        postgresql: createHealthIndicator(
          HealthIndicatorStatusEnum.DOWN,
          error instanceof Error ? error.message : 'Unknown error occurred',
        ),
      };
    }
  }
}
