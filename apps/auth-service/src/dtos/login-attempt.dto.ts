import { LoginAttemptStatusEnum } from '../interfaces';

export class LoginAttemptDto {
  email!: string;
  status!: LoginAttemptStatusEnum;
  ipAddress!: string;
  userAgent!: string;
}
