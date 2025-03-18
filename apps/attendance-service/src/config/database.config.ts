import { RedisModuleOptions } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getMongoDBConfig = (
  configService: ConfigService,
): MongooseModuleOptions => {
  const host = configService.get<string>('MONGO_HOST');
  const port = configService.get<number>('MONGO_PORT');
  const username = configService.get<string>('MONGO_USERNAME');
  const password = configService.get<string>('MONGO_PASSWORD');
  const database = configService.get<string>('MONGO_DATABASE');

  const uri = `mongodb://${username}:${password}@${host}:${port}/${database}`;

  return {
    uri,
    maxPoolSize: 50,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
  };
};

export const getRedisConfig = (
  configService: ConfigService,
): RedisModuleOptions => {
  const host = configService.get<string>('REDIS_HOST');
  const port = configService.get<number>('REDIS_PORT');
  const password = configService.get<string>('REDIS_PASSWORD');

  return {
    type: 'single',
    url: `redis://:${password}@${host}:${port}`,
  };
};
