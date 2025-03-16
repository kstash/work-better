export interface TokenPayload {
  sub: string; // 사용자 ID
  email: string;
  role: string;
  type: 'access' | 'refresh';
  iat?: number; // 발급 시간
  exp?: number; // 만료 시간
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export enum LoginStatus {
  SUCCESS = 'SUCCESS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
}

export interface LoginAttempt {
  userId: string;
  timestamp: Date;
  status: LoginStatus;
  ipAddress: string;
  userAgent: string;
}
