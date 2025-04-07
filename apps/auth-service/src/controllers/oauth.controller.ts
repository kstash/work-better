import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Controller('oauth')
export class OAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Google 인증 페이지로 리디렉션됨
    // 이 메서드는 실행되지 않음
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    // 프론트엔드 URL
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    try {
      // req.user는 GoogleStrategy의 validate 메서드에서 반환한 값
      const { accessToken, refreshToken } = req.user as any;

      // 성공 시 프론트엔드로 리디렉션 (토큰 포함)
      return res.redirect(
        `${frontendUrl}/auth/oauth-callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
      );
    } catch (error) {
      // 실패 시 오류 페이지로 리디렉션
      return res.redirect(`${frontendUrl}/auth/oauth-error`);
    }
  }

  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  async naverAuth() {
    // Naver 인증 페이지로 리디렉션됨
    // 이 메서드는 실행되지 않음
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverAuthRedirect(@Req() req: Request, @Res() res: Response) {
    // 프론트엔드 URL
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    console.log(req.user);

    try {
      // req.user는 NaverStrategy의 validate 메서드에서 반환한 값
      const { accessToken, refreshToken } = req.user as any;

      // 성공 시 프론트엔드로 리디렉션 (토큰 포함)
      return res.redirect(
        `${frontendUrl}/auth/oauth-callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
      );
    } catch (error) {
      // 실패 시 오류 페이지로 리디렉션
    }
  }
}
