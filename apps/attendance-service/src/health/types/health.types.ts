export enum HealthIndicatorStatusEnum {
  UP = 'up',
  DOWN = 'down',
}

export interface HealthCheckResult {
  status: HealthIndicatorStatusEnum;
  message: string;
  error?: string;
}

export interface RedisHealthIndicatorResult {
  redis: HealthCheckResult;
}

export interface MongoDBHealthStatus {
  mongodb: HealthCheckResult;
}

export const HEALTH_MESSAGES = {
  [HealthIndicatorStatusEnum.UP]: 'Service is healthy',
  [HealthIndicatorStatusEnum.DOWN]: 'Service is not healthy',
} as const;

export const createHealthIndicator = (
  status: HealthIndicatorStatusEnum,
  error?: string,
): HealthCheckResult => ({
  status,
  message: HEALTH_MESSAGES[status],
  ...(error && { error }),
});
