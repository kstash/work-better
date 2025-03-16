import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { Leave, LeaveSchema } from './entities/leave.entity';
import {
  LeaveBalance,
  LeaveBalanceSchema,
} from './entities/leave-balance.entity';
import { LeaveService } from './services/leave.service';
import { LeaveController } from './controllers/leave.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LeaveRepository } from './repositories/leave.repository';
import { LeaveBalanceRepository } from './repositories/leave-balance.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/leave-service/.env',
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
      { name: Leave.name, schema: LeaveSchema },
      { name: LeaveBalance.name, schema: LeaveBalanceSchema },
    ]),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'single',
        url: `redis://:${configService.get('REDIS_PASSWORD')}@${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`,
      }),
      inject: [ConfigService],
    }),
    HttpModule,
  ],
  controllers: [LeaveController],
  providers: [
    LeaveService,
    JwtStrategy,
    LeaveRepository,
    LeaveBalanceRepository,
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
