import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-naver';
import { Request } from 'express';
import { AuthService } from '../services';
import { IProfile, LoginResponse } from '../interfaces';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('NAVER_CLIENT_ID'),
      clientSecret: configService.get<string>('NAVER_CLIENT_SECRET'),
      callbackURL: configService.get<string>('NAVER_CALLBACK_URL'),
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: Error | null, user?: LoginResponse) => void,
  ): Promise<void> {
    try {
      // 네이버는 profile 구조가 다름
      const { _json } = profile;

      if (!_json || !_json.email || !_json.profile_image) {
        throw new BadRequestException(
          '유효하지 않은 네이버 프로필 데이터입니다.',
        );
      }

      const { ip = '', headers } = req;
      const ipAddress = ip;
      const userAgent = headers['user-agent'] || '';

      const socialProfile: IProfile = {
        id: profile.id,
        email: _json.email,
        imageUrl: _json.profile_image,
        accessToken,
        refreshToken,
        tokenExpiry: new Date(Date.now() + 3600 * 1000), // 1시간 후
      };

      const result = await this.authService.validateOrCreateProfile(
        socialProfile,
        ipAddress,
        userAgent,
      );

      done(null, result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        done(new Error(error.message));
      } else {
        done(new Error('알 수 없는 오류가 발생했습니다.'));
      }
    }
  }
}
