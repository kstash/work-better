export enum HealthIndicatorStatusEnum {
  UP = 'up',
  DOWN = 'down',
}

export interface HealthCheckResult {
  status: HealthIndicatorStatusEnum;
  error?: string;
}

export interface PostgreSQLHealthStatus {
  postgresql: HealthCheckResult;
}

export const createHealthIndicator = (
  status: HealthIndicatorStatusEnum,
  error?: string,
): HealthCheckResult => ({
  status,
  ...(error && { error }),
});
