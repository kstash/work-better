export enum LoginAttemptStatusEnum {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export interface ILoginAttempt {
  email: string;
  status: LoginAttemptStatusEnum;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}
