import { Controller, Get } from '@nestjs/common';
import { PostgreSQLHealthIndicator } from '../health/postgresql.health';
import { HealthIndicatorStatusEnum } from '../health/types/health.types';

@Controller('health')
export class HealthController {
  constructor(private readonly postgresql: PostgreSQLHealthIndicator) {}

  @Get()
  async check() {
    const postgresqlStatus = await this.postgresql.isHealthy();

    const isHealthy =
      postgresqlStatus.postgresql.status === HealthIndicatorStatusEnum.UP;

    return {
      status: isHealthy
        ? HealthIndicatorStatusEnum.UP
        : HealthIndicatorStatusEnum.DOWN,
      info: {
        postgresql: postgresqlStatus.postgresql,
      },
    };
  }

  @Get('liveness')
  async checkReadiness() {
    return this.check();
  }

  @Get('readiness')
  checkLiveness() {
    return {
      status: HealthIndicatorStatusEnum.UP,
    };
  }
}
