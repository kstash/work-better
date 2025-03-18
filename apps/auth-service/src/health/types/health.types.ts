export enum HealthCheckStatusEnum {
  OK = 'ok',
  ERROR = 'error',
  SHUTTING_DOWN = 'shutting_down',
}

export enum HealthIndicatorStatusEnum {
  UP = 'up',
  DOWN = 'down',
}

export interface HealthCheckResult {
  status: HealthIndicatorStatusEnum;
  error?: string;
}

export interface RedisHealthIndicatorResult {
  redis: HealthCheckResult;
}

export interface MongoDBHealthStatus {
  mongodb: HealthCheckResult;
}

export const createHealthIndicator = (
  status: HealthIndicatorStatusEnum,
  error?: string,
): HealthCheckResult => ({
  status,
  ...(error && { error }),
});
