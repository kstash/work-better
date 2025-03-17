import { RedisModuleOptions } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getMongoDBConfig = async (
  configService: ConfigService,
): Promise<MongooseModuleOptions> => {
  const host = String(await configService.get('MONGO_HOST'));
  const port = Number(await configService.get('MONGO_PORT'));
  const username = String(await configService.get('MONGO_USERNAME'));
  const password = String(await configService.get('MONGO_PASSWORD'));
  const database = String(await configService.get('MONGO_DATABASE'));

  const uri = `mongodb://${username}:${password}@${host}:${port}/${database}`;

  return {
    uri,
    maxPoolSize: 50,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
  };
};

export const getRedisConfig = async (
  configService: ConfigService,
): Promise<RedisModuleOptions> => {
  const host = String(await configService.get('REDIS_HOST'));
  const port = Number(await configService.get('REDIS_PORT'));
  const password = String(await configService.get('REDIS_PASSWORD'));

  return {
    type: 'single',
    url: `redis://:${password}@${host}:${port}`,
  };
};
