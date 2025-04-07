import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule, getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { TerminusModule } from '@nestjs/terminus';
import { AttendanceController, HealthController } from './controllers';
import { AttendanceService } from './services';
import { Attendance, AttendanceSchema } from './entities';
import { GPSValidationStrategy, QRValidationStrategy } from './strategies';
import { AttendanceRepository } from './repositories';
import {
  getMongoConfig,
  getRedisConfig,
  RedisHealthIndicator,
} from '@work-better/common';
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
      { name: Attendance.name, schema: AttendanceSchema },
    ]),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getRedisConfig,
      inject: [ConfigService],
    }),
    TerminusModule,
  ],
  controllers: [AttendanceController, HealthController],
  providers: [
    AttendanceService,
    GPSValidationStrategy,
    QRValidationStrategy,
    AttendanceRepository,
    {
      provide: RedisHealthIndicator,
      useFactory: (redis) => new RedisHealthIndicator(redis),
      inject: [getRedisConnectionToken()],
    },
  ],
})
export class AttendanceModule {}
