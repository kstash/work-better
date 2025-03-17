import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { TerminusModule } from '@nestjs/terminus';
import { Leave, LeaveSchema } from './entities/leave.entity';
import {
  LeaveBalance,
  LeaveBalanceSchema,
} from './entities/leave-balance.entity';
import { LeaveService } from './services/leave.service';
import { LeaveController } from './controllers/leave.controller';
import { HealthController } from './controllers/health.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LeaveRepository } from './repositories/leave.repository';
import { LeaveBalanceRepository } from './repositories/leave-balance.repository';
import { getMongoDBConfig, getRedisConfig } from './config/database.config';
import { RedisHealthIndicator } from './health/redis.health';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? 'apps/leave-service/.env.production'
          : 'apps/leave-service/.env',
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getMongoDBConfig,
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Leave.name, schema: LeaveSchema },
      { name: LeaveBalance.name, schema: LeaveBalanceSchema },
    ]),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getRedisConfig,
      inject: [ConfigService],
    }),
    HttpModule,
    TerminusModule,
  ],
  controllers: [LeaveController, HealthController],
  providers: [
    LeaveService,
    JwtStrategy,
    LeaveRepository,
    LeaveBalanceRepository,
    RedisHealthIndicator,
    {
      provide: 'AUTH_SERVICE',
      useFactory: (configService: ConfigService) => {
        return configService.get('AUTH_SERVICE_URL');
      },
      inject: [ConfigService],
    },
  ],
})
export class LeaveModule {}
