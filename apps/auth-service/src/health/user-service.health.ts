import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { HealthIndicatorStatusEnum } from './types/health.types';

@Injectable()
export class UserServiceHealthIndicator extends HealthIndicator {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    super();
  }

  async pingCheck(): Promise<HealthIndicatorResult> {
    const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL');

    try {
      await firstValueFrom(this.httpService.get(`${userServiceUrl}/health`));
      return { userService: { status: HealthIndicatorStatusEnum.UP } };
    } catch (error) {
      const result = {
        userService: {
          status: HealthIndicatorStatusEnum.DOWN,
          error: error.message ? error.message : 'User service is not healthy',
        },
      };

      throw new HealthCheckError('User service health check failed', result);
    }
  }
}
