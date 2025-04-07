import { Controller, Get } from '@nestjs/common';
import {
  PostgresHealthIndicator,
  HealthIndicatorStatusEnum,
} from '@work-better/common';

@Controller('health')
export class HealthController {
  constructor(private readonly postgres: PostgresHealthIndicator) {}

  @Get()
  async check() {
    const postgresStatus = await this.postgres.isHealthy();

    const isHealthy =
      postgresStatus.postgres.status === HealthIndicatorStatusEnum.UP;

    return {
      status: isHealthy
        ? HealthIndicatorStatusEnum.UP
        : HealthIndicatorStatusEnum.DOWN,
      info: {
        postgres: postgresStatus.postgres,
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
