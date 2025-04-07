import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import {
  RedisHealthStatus,
  HealthIndicatorStatusEnum,
} from '../interfaces/health';
import { createHealthIndicator } from './base.indicator';

@Injectable()
export class RedisHealthIndicator {
  constructor(private readonly redis: Redis) {}

  async isHealthy(): Promise<RedisHealthStatus> {
    try {
      await this.redis.ping();
      return {
        redis: createHealthIndicator(HealthIndicatorStatusEnum.UP),
      };
    } catch (error) {
      return {
        redis: createHealthIndicator(
          HealthIndicatorStatusEnum.DOWN,
          error instanceof Error ? error.message : 'Unknown error occurred',
        ),
      };
    }
  }
}
