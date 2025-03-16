import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface JwtPayload {
  readonly sub: string;
  readonly email: string;
  readonly role: string;
  readonly iat?: number;
  readonly exp?: number;
}

export interface JwtValidateResult {
  readonly sub: string;
  readonly email: string;
  readonly role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtValidateResult> {
    if (!this.isValidPayload(payload)) {
      throw new UnauthorizedException('Invalid token payload');
    }

    try {
      // auth-service에 토큰 검증 요청
      const authServiceUrl = this.configService.get('AUTH_SERVICE_URL');
      const response = await firstValueFrom(
        this.httpService.post(`${authServiceUrl}/auth/validate`, {
          token: ExtractJwt.fromAuthHeaderAsBearerToken()({}),
        }),
      );

      if (!response.data.isValid) {
        throw new UnauthorizedException('Token is not valid');
      }

      return {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      throw new UnauthorizedException('Token validation failed');
    }
  }

  private isValidPayload(payload: JwtPayload): boolean {
    return Boolean(
      payload &&
        typeof payload.sub === 'string' &&
        typeof payload.email === 'string' &&
        typeof payload.role === 'string',
    );
  }
}
