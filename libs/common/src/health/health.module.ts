import { DynamicModule, Module } from '@nestjs/common';
import {
  PostgresHealthIndicator,
  MongoHealthIndicator,
  RedisHealthIndicator,
} from './indicators';

@Module({})
export class HealthModule {
  static forRoot(
    options: {
      postgres?: boolean;
      mongodb?: boolean;
      redis?: boolean;
    } = {},
  ): DynamicModule {
    const imports = [];
    const providers = [];
    const exports = [];

    if (options.postgres) {
      providers.push(PostgresHealthIndicator);
      exports.push(PostgresHealthIndicator);
    }

    if (options.mongodb) {
      providers.push(MongoHealthIndicator);
      exports.push(MongoHealthIndicator);
    }

    if (options.redis) {
      providers.push(RedisHealthIndicator);
      exports.push(RedisHealthIndicator);
    }

    return {
      module: HealthModule,
      imports,
      providers,
      exports,
    };
  }
}
