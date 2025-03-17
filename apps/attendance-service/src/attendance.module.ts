import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { TerminusModule } from '@nestjs/terminus';
import { AttendanceController } from './controllers/attendance.controller';
import { HealthController } from './controllers/health.controller';
import { AttendanceService } from './services/attendance.service';
import { Attendance, AttendanceSchema } from './entities/attendance.entity';
import { GPSValidationStrategy } from './strategies/gps-validation.strategy';
import { QRValidationStrategy } from './strategies/qr-validation.strategy';
import { AttendanceRepository } from './repositories/attendance.repository';
import { getMongoDBConfig, getRedisConfig } from './config/database.config';
import { RedisHealthIndicator } from './health/redis.health';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? 'apps/attendance-service/.env.production'
          : 'apps/attendance-service/.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getMongoDBConfig,
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
    RedisHealthIndicator,
  ],
})
export class AttendanceModule {}
