export enum HealthIndicatorStatusEnum {
  UP = 'up',
  DOWN = 'down',
}

export interface HealthIndicator {
  status: HealthIndicatorStatusEnum;
  error?: string;
}

export interface RedisHealthIndicatorResult {
  redis: HealthIndicator;
}

export const createHealthIndicator = (
  status: HealthIndicatorStatusEnum,
  error?: string,
): HealthIndicator => ({
  status,
  ...(error && { error }),
});
