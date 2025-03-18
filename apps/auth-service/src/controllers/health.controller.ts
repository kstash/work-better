import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator, UserServiceHealthIndicator } from '../health';
import { HealthCheckStatusEnum } from '../health/types';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongo: MongooseHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly userService: UserServiceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    const result = await this.health.check([
      () => this.mongo.pingCheck('mongodb'),
      () => this.redis.pingCheck(),
      () => this.userService.pingCheck(),
    ]);

    // 빈 error 객체 제거
    if (result.error && Object.keys(result.error).length === 0) {
      const { error, ...cleanResult } = result;
      return cleanResult;
    }

    return result;
  }

  @Get('liveness')
  @HealthCheck()
  checkLiveness() {
    try {
      return { status: HealthCheckStatusEnum.OK };
    } catch (error) {
      return { status: HealthCheckStatusEnum.ERROR, error };
    }
  }

  @Get('readiness')
  @HealthCheck()
  async checkReadiness() {
    const result = await this.check();

    return result;
  }
}
