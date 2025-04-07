import { ConfigService } from '@nestjs/config';
import { RedisModuleOptions } from '@nestjs-modules/ioredis';
import { RedisType } from '../interfaces/redis.interface';

export const getRedisConfig = (
  configService: ConfigService,
): RedisModuleOptions => {
  const type = configService.get<RedisType>('REDIS_TYPE');
  const host = configService.get<string>('REDIS_HOST');
  const port = configService.get<number>('REDIS_PORT');
  const password = configService.get<string>('REDIS_PASSWORD');

  return type === 'single'
    ? {
        type,
        url: `redis://:${password}@${host}:${port}`,
      }
    : {
        type,
        nodes: [{ host, port }],
      };
};
