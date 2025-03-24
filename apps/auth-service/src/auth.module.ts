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
import { JwtStrategy, GoogleStrategy } from './strategies';
import { LoginAttempt, LoginAttemptSchema } from './entities';
import { LoginAttemptRepository } from './repositories';
import { jwtConfig, getMongoDBConfig, getRedisConfig } from './configs';
import { RedisHealthIndicator, UserServiceHealthIndicator } from './health';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? 'apps/auth-service/.env.production'
          : 'apps/auth-service/.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getMongoDBConfig,
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
    LoginAttemptRepository,
    RedisHealthIndicator,
    UserServiceHealthIndicator,
  ],
  exports: [AuthService],
})
export class AuthModule {}
