export enum HealthIndicatorStatusEnum {
  UP = 'up',
  DOWN = 'down',
}

export interface HealthIndicator {
  status: HealthIndicatorStatusEnum;
  message?: string;
}

export interface HealthStatus {
  status: HealthIndicatorStatusEnum;
  info?: Record<string, HealthIndicator>;
}
