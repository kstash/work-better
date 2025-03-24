import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { TerminusModule } from '@nestjs/terminus';
import { AttendanceController, HealthController } from './controllers';
import { AttendanceService } from './services';
import { Attendance, AttendanceSchema } from './entities';
import { GPSValidationStrategy, QRValidationStrategy } from './strategies';
import { AttendanceRepository } from './repositories';
import { getMongoDBConfig, getRedisConfig } from './configs';
import { RedisHealthIndicator } from './health';

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
