import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import {
  HealthIndicatorStatusEnum,
  createHealthIndicator,
} from './types/health.types';
import { HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export class RedisHealthIndicator {
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    // Redis 클라이언트 직접 생성
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      await this.redis.ping();
      return { redis: createHealthIndicator(HealthIndicatorStatusEnum.UP) };
    } catch (error) {
      return {
        redis: createHealthIndicator(
          HealthIndicatorStatusEnum.DOWN,
          error instanceof Error ? error.message : 'Unknown error occurred',
        ),
      };
    }
  }

  async pingCheck(): Promise<HealthIndicatorResult> {
    return await this.isHealthy();
  }
}
