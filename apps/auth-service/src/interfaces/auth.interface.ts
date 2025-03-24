export enum TokenTypeEnum {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export type TokenType = TokenTypeEnum.ACCESS | TokenTypeEnum.REFRESH;

export interface TokenPayload {
  sub: string; // 사용자 ID
  email: string;
  role: string;
  type: TokenType;
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
