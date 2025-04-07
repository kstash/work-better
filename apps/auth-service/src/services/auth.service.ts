import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LoginAttempt } from '../entities';
import { LoginAttemptDto } from '../dtos';
import {
  TokenPayload,
  LoginResponse,
  RefreshTokenResponse,
  LoginAttemptStatusEnum,
  TokenTypeEnum,
  IProfile,
} from '../interfaces';
import { LoginAttemptRepository } from '../repositories';
import { ICredential, User } from '@work-better/common';
import {
  AccountLockedException,
  AuthenticationException,
  InvalidCredentialsException,
  InvalidTokenException,
  UserServiceUnavailableException,
} from '../exceptions';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
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

  async validateUserLogin(
    credentials: ICredential,
    ipAddress: string,
    userAgent: string,
  ): Promise<User> {
    let status = LoginAttemptStatusEnum.SUCCESS;
    try {
      const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL');
      const response = await firstValueFrom(
        this.httpService.post(`${userServiceUrl}/users/validate`, credentials),
      );
      return response.data as User;
    } catch (error) {
      status = LoginAttemptStatusEnum.FAIL;
      this.handleAuthError(error);
    } finally {
      await this.recordLoginAttempt({
        email: credentials.email,
        status,
        ipAddress,
        userAgent,
      });
    }
  }

  async login(
    user: User,
    ipAddress: string,
    userAgent: string,
  ): Promise<LoginResponse> {
    const attempts = await this.getLoginAttempts(user.email);
    if (attempts >= this.maxLoginAttempts) {
      throw new AccountLockedException();
    }

    await this.recordLoginAttempt({
      email: user.email,
      status: LoginAttemptStatusEnum.SUCCESS,
      ipAddress,
      userAgent,
    });

    const tokens = await this.generateTokens(user);

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
        throw new InvalidTokenException('유효하지 않은 리프레시 토큰입니다.');
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
      if (error instanceof InvalidTokenException) {
        throw error;
      }
      throw new InvalidTokenException('유효하지 않은 리프레시 토큰입니다.');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.redis.del(`refresh_token:${userId}`);
  }

  async validateOrCreateProfile(
    profile: IProfile,
    ipAddress: string,
    userAgent: string,
  ): Promise<LoginResponse> {
    this.logger.log(`소셜 로그인 시도: ${profile.email}`);

    try {
      const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL');

      // 사용자 서비스에 소셜 로그인 사용자 검증 요청
      const response = await firstValueFrom(
        this.httpService.post(`${userServiceUrl}/users/oauth/google`, {
          email: profile.email,
          imageUrl: profile.imageUrl,
          googleId: profile.id,
        }),
      );

      const user = response.data as User;

      // 로그인 기록
      await this.recordLoginAttempt({
        email: user.email,
        status: LoginAttemptStatusEnum.SUCCESS,
        ipAddress,
        userAgent,
      });

      // 토큰 생성
      const tokens = await this.generateTokens(user);

      // 리프레시 토큰 저장
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
    } catch (error) {
      this.logger.error(`Google 사용자 검증 실패: ${error.message}`);
      this.handleAuthError(error);
    }
  }

  private handleAuthError(error: any): never {
    if (error.response) {
      // HTTP 응답이 있는 경우
      const status = error.response.status;
      if (status === 401) {
        throw new InvalidCredentialsException();
      } else {
        throw new AuthenticationException();
      }
    } else if (error.request) {
      // 요청은 전송되었지만 응답이 없는 경우
      throw new UserServiceUnavailableException();
    } else {
      // 요청 설정에 오류가 발생한 경우
      throw new AuthenticationException();
    }
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
      type: TokenTypeEnum.ACCESS,
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
      type: TokenTypeEnum.REFRESH,
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.jwtRefreshExpiration,
    });
  }

  private async recordLoginAttempt(
    loginAttempt: LoginAttemptDto,
  ): Promise<void> {
    try {
      const attempt = new this.loginAttemptModel({
        ...loginAttempt,
      });
      await attempt.save();
    } catch (error) {
      this.logger.error(`로그인 시도 기록 실패: ${error.message}`);
      // 로그인 시도 기록 실패는 사용자 인증 흐름에 영향을 주지 않도록 함
    }
  }

  private async getLoginAttempts(email: string): Promise<number> {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    return this.loginAttemptModel.countDocuments({
      email,
      status: LoginAttemptStatusEnum.FAIL,
      createdAt: { $gte: fifteenMinutesAgo },
    });
  }
}
