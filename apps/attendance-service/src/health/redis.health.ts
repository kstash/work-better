import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { HealthIndicatorStatusEnum } from './types/health.types';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export class RedisHealthIndicator {
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });
  }

  async pingCheck(): Promise<HealthIndicatorResult> {
    const result = await this.redis.ping();
    return {
      redis: {
        status: result
          ? HealthIndicatorStatusEnum.UP
          : HealthIndicatorStatusEnum.DOWN,
      },
    };
  }
}
