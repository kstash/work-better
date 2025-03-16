import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { LoginAttempt } from '../entities/login-attempt.entity';
import {
  TokenPayload,
  LoginResponse,
  RefreshTokenResponse,
  LoginStatus,
} from '../interfaces/auth.interface';
import { LoginAttemptRepository } from '../repositories/login-attempt.repository';

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

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const userServiceUrl = this.configService.get('USER_SERVICE_URL');
      const response = await firstValueFrom(
        this.httpService.post(`${userServiceUrl}/users/validate`, {
          email,
          password,
        }),
      );

      const user = response.data;

      // 로그인 시도 기록 저장
      await this.loginAttemptRepository.create({
        userId: user.id,
        username: email,
        success: true,
        timestamp: new Date(),
      });

      return user;
    } catch (error) {
      // 실패한 로그인 시도 기록
      if (email) {
        await this.loginAttemptRepository.create({
          username: email,
          success: false,
          timestamp: new Date(),
        });
      }

      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async login(
    user: any,
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
      const payload = await this.jwtService.verify(refreshToken);
      const storedToken = await this.redis.get(`refresh_token:${payload.sub}`);

      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }

      const accessToken = await this.generateAccessToken(
        payload.sub,
        payload.email,
        payload.role,
      );

      return {
        accessToken,
        expiresIn: this.jwtAccessExpiration,
      };
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.redis.del(`refresh_token:${userId}`);
  }

  private async generateTokens(user: any) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user.id, user.email, user.role),
      this.generateRefreshToken(user.id, user.email, user.role),
    ]);

    return { accessToken, refreshToken };
  }

  private async generateAccessToken(
    userId: string,
    email: string,
    role: string,
  ): Promise<string> {
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

  private async generateRefreshToken(
    userId: string,
    email: string,
    role: string,
  ): Promise<string> {
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
      timestamp: new Date(),
    });
    await attempt.save();
  }

  private async getLoginAttempts(userId: string): Promise<number> {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    return this.loginAttemptModel.countDocuments({
      userId,
      status: LoginStatus.INVALID_CREDENTIALS,
      timestamp: { $gte: fifteenMinutesAgo },
    });
  }

  private async getUserFromUserService(email: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`http://localhost:3001/users/email/${email}`),
      );
      return data;
    } catch (error) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const decoded = this.jwtService.verify(token);
      const storedToken = await this.redis.get(`token:${decoded.sub}`);
      return token === storedToken;
    } catch {
      return false;
    }
  }
}
