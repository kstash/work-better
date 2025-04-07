import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getPostgresConfig } from '@work-better/common';
import { User } from '@work-better/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { HealthController } from './controllers/health.controller';
import { PostgresHealthIndicator } from '@work-better/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? 'apps/user-service/.env.production'
          : 'apps/user-service/.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getPostgresConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController, HealthController],
  providers: [UserService, PostgresHealthIndicator],
})
export class UserModule {}
