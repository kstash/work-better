import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload, TokenTypeEnum } from '../interfaces';
import { JwtPayloadDto } from '../dtos';
import { InvalidTokenException } from '../exceptions';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
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

  async validate(payload: TokenPayload): Promise<JwtPayloadDto> {
    if (!payload.sub || !payload.email || !payload.role) {
      throw new InvalidTokenException('유효하지 않은 토큰 페이로드입니다.');
    }

    // 액세스 토큰인지 확인
    if (payload.type !== TokenTypeEnum.ACCESS) {
      throw new InvalidTokenException('액세스 토큰이 아닙니다.');
    }

    return new JwtPayloadDto({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });
  }
}
