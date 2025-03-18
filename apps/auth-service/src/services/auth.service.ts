import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LoginAttempt } from '../entities/login-attempt.entity';
import {
  TokenPayload,
  LoginResponse,
  RefreshTokenResponse,
  LoginStatus,
} from '../interfaces/auth.interface';
import { LoginAttemptRepository } from '../repositories/login-attempt.repository';
import { User } from '@work-better/common';

@Injectable()
export class AuthService {
  private readonly jwtAccessExpiration: number;
  private readonly jwtRefreshExpiration: number;
  private readonly maxLoginAttempts: number;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectModel(LoginAttempt.name)
    private loginAttemptModel: Model<LoginAttempt>,
    @InjectRedis() private readonly redis: Redis,
    private readonly loginAttemptRepository: LoginAttemptRepository,
  ) {
    this.jwtAccessExpiration =
      this.configService.get<number>('JWT_ACCESS_EXPIRATION') ?? 3600;
    this.jwtRefreshExpiration =
      this.configService.get<number>('JWT_REFRESH_EXPIRATION') ?? 86400;
    this.maxLoginAttempts =
      this.configService.get<number>('MAX_LOGIN_ATTEMPTS') ?? 5;
  }

  async validateUser(email: string, password: string): Promise<User> {
    try {
      const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL');
      const response = await firstValueFrom(
        this.httpService.post(`${userServiceUrl}/users/validate`, {
          email,
          password,
        }),
      );

      const user = response.data as User;

      // 로그인 시도 기록 저장
      await this.loginAttemptRepository.create({
        userId: user.id,
        username: email,
        success: true,
      });

      return user;
    } catch (error) {
      // 실패한 로그인 시도 기록
      if (email) {
        await this.loginAttemptRepository.create({
          username: email,
          success: false,
        });
      }

      throw new UnauthorizedException(error, 'Invalid credentials');
    }
  }

  async login(
    user: User,
    ipAddress: string,
    userAgent: string,
  ): Promise<LoginResponse> {
    const attempts = await this.getLoginAttempts(user.id);
    if (attempts >= this.maxLoginAttempts) {
      throw new UnauthorizedException(
        '계정이 잠겼습니다. 잠시 후 다시 시도해주세요.',
      );
    }

    const tokens = await this.generateTokens(user);

    await this.recordLoginAttempt({
      userId: user.id,
      status: LoginStatus.SUCCESS,
      ipAddress,
      userAgent,
    });

    await this.redis.set(
      `refresh_token:${user.id}`,
      tokens.refreshToken,
      'EX',
      this.jwtRefreshExpiration,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: this.jwtAccessExpiration,
    };
  }

  async refresh(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken);
      const storedToken = await this.redis.get(`refresh_token:${payload.sub}`);

      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }

      const accessToken = this.generateAccessToken(
        payload.sub,
        payload.email,
        payload.role,
      );

      return {
        accessToken,
        expiresIn: this.jwtAccessExpiration,
      };
    } catch (error) {
      throw new UnauthorizedException(
        error,
        '유효하지 않은 리프레시 토큰입니다.',
      );
    }
  }

  async logout(userId: string): Promise<void> {
    await this.redis.del(`refresh_token:${userId}`);
  }

  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user.id, user.email, user.role),
      this.generateRefreshToken(user.id, user.email, user.role),
    ]);

    return { accessToken, refreshToken };
  }

  private generateAccessToken(
    userId: string,
    email: string,
    role: string,
  ): string {
    const payload: TokenPayload = {
      sub: userId,
      email,
      role,
      type: 'access',
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.jwtAccessExpiration,
    });
  }

  private generateRefreshToken(
    userId: string,
    email: string,
    role: string,
  ): string {
    const payload: TokenPayload = {
      sub: userId,
      email,
      role,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.jwtRefreshExpiration,
    });
  }

  private async recordLoginAttempt(data: {
    userId: string;
    status: LoginStatus;
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    const attempt = new this.loginAttemptModel({
      ...data,
    });
    await attempt.save();
  }

  private async getLoginAttempts(userId: string): Promise<number> {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    return this.loginAttemptModel.countDocuments({
      userId,
      status: LoginStatus.INVALID_CREDENTIALS,
      createdAt: { $gte: fifteenMinutesAgo },
    });
  }

  private async getUserByEmail(email: string): Promise<User> {
    try {
      const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL');
      const response = await firstValueFrom(
        this.httpService.get(`${userServiceUrl}/users/email/${email}`),
      );
      return response.data as User;
    } catch (error) {
      throw new UnauthorizedException(error, '사용자를 찾을 수 없습니다.');
    }
  }
}
