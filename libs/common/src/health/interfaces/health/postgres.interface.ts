import { HealthIndicator } from './base.interface';

export interface PostgresHealthStatus {
  postgres: HealthIndicator;
}
