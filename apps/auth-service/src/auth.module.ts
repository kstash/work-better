import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RedisModule } from '@nestjs-modules/ioredis';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminusModule } from '@nestjs/terminus';
import {
  AuthController,
  HealthController,
  OAuthController,
} from './controllers';
import { AuthService } from './services';
import { JwtStrategy, GoogleStrategy, NaverStrategy } from './strategies';
import { LoginAttempt, LoginAttemptSchema } from './entities';
import { LoginAttemptRepository } from './repositories';
import { jwtConfig } from './configs';
import { RedisHealthIndicator, UserServiceHealthIndicator } from './health';
import { getMongoConfig, getRedisConfig } from '@work-better/common';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? path.resolve(process.cwd(), '.env.production')
          : path.resolve(process.cwd(), '.env'),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getMongoConfig,
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: LoginAttempt.name, schema: LoginAttemptSchema },
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: jwtConfig,
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getRedisConfig,
      inject: [ConfigService],
    }),
    HttpModule,
    TerminusModule,
  ],
  controllers: [AuthController, HealthController, OAuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    NaverStrategy,
    LoginAttemptRepository,
    RedisHealthIndicator,
    UserServiceHealthIndicator,
  ],
  exports: [AuthService],
})
export class AuthModule {}
