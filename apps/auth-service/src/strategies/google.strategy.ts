import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services';
import { Request } from 'express';
import { IProfile, LoginResponse } from '../interfaces';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
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
      const { name, emails, photos } = profile;
      if (!emails || !photos) {
        throw new BadRequestException('Invalid profile data');
      }
      const { ip = '', headers } = req;
      const ipAddress = ip;
      const userAgent = headers['user-agent'] || '';

      const socialProfile: IProfile = {
        id: profile.id,
        email: emails[0].value,
        imageUrl: photos[0].value,
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
