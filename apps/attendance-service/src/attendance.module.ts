import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceService } from './services/attendance.service';
import { Attendance, AttendanceSchema } from './entities/attendance.entity';
import { GPSValidationStrategy } from './services/validation/gps-validation.strategy';
import { QRValidationStrategy } from './services/validation/qr-validation.strategy';
import { AttendanceRepository } from './repositories/attendance.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/attendance-service/.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get('MONGO_HOST');
        const port = configService.get('MONGO_PORT');
        const username = configService.get('MONGO_USERNAME');
        const password = configService.get('MONGO_PASSWORD');
        const database = configService.get('MONGO_DATABASE');

        const uri = `mongodb://${username}:${password}@${host}:${port}/${database}`;

        return {
          uri,
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
    ]),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'single',
        url: `redis://:${configService.get('REDIS_PASSWORD')}@${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    GPSValidationStrategy,
    QRValidationStrategy,
    AttendanceRepository,
  ],
})
export class AttendanceModule {}
