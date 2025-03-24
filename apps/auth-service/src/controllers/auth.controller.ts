import {
  Controller,
  Post,
  Body,
  Headers,
  Ip,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { AuthService } from '../services';
import { ICredential } from '@work-better/common';
import { JwtAuthGuard } from '../guards';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() credentials: ICredential,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const user = await this.authService.validateUserLogin(
      credentials,
      ipAddress,
      userAgent,
    );

    const result = await this.authService.login(user, ipAddress, userAgent);
    return result;
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    const result = await this.authService.refresh(refreshToken);

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user.sub);
  }
}
