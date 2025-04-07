import {
  HealthIndicator,
  HealthIndicatorStatusEnum,
  HealthStatus,
} from '../interfaces/health';

export const createHealthIndicator = (
  status: HealthIndicatorStatusEnum,
  message?: string,
): HealthIndicator => ({
  status,
  ...(message && { message }),
});

export const createHealthStatus = (
  status: HealthIndicatorStatusEnum,
  info?: Record<string, HealthIndicator>,
): HealthStatus => ({
  status,
  info,
});
