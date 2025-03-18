import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { HealthIndicatorStatusEnum } from './types/health.types';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(RedisHealthIndicator.name);

  constructor(@InjectRedis() private readonly redis: Redis) {
    super();

    // 에러 이벤트 처리하여 불필요한 로그 줄이기
    this.redis.on('error', (err) => {
      if (
        !(
          err.message.includes('ECONNREFUSED') ||
          err.message.includes('ECONNRESET') ||
          err.message.includes('Connection is closed')
        )
      ) {
        this.logger.error(`Redis Error: ${err.message}`);
      }
    });
  }

  async pingCheck(): Promise<HealthIndicatorResult> {
    try {
      await Promise.race([
        this.redis.ping(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Redis ping timeout')), 1000),
        ),
      ]);

      return this.getStatus('redis', true);
    } catch (error) {
      throw new HealthCheckError('Redis connection failed', {
        redis: {
          status: HealthIndicatorStatusEnum.DOWN,
          message:
            error instanceof Error
              ? error.message
              : 'Redis health check failed',
        },
      });
    }
  }
}
