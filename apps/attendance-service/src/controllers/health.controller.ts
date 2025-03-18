import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { RedisHealthIndicator } from '../health/redis.health';

@Controller('health')
export class HealthController {
  constructor(
    private readonly mongo: MongooseHealthIndicator,
    private readonly health: HealthCheckService,
    private readonly configService: ConfigService,
    private readonly redis: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    const mongo_uri = this.configService.get<string>('MONGO_URI') as string;
    const result = await this.health.check([
      () => this.mongo.pingCheck('mongodb', { connection: mongo_uri }),
      () => this.redis.pingCheck(),
    ]);

    if (result.error && Object.keys(result.error).length === 0) {
      const { error, ...cleanResult } = result;
      return cleanResult;
    }

    return result;
  }

  @Get('liveness')
  @HealthCheck()
  async checkLiveness() {
    return this.check();
  }

  @Get('readiness')
  @HealthCheck()
  async checkReadiness() {
    return this.check();
  }
}
