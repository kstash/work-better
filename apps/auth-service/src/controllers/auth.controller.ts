import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Headers,
  Ip,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginStatus } from '../interfaces/auth.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: { email: string; password: string },
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      // 실패한 로그인 시도 기록
      await this.authService['recordLoginAttempt']({
        userId: 'unknown', // 또는 이메일 기반으로 사용자 ID 조회
        status: LoginStatus.INVALID_CREDENTIALS,
        ipAddress,
        userAgent,
      });

      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    return this.authService.login(user, ipAddress, userAgent);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user.sub);
  }
}
