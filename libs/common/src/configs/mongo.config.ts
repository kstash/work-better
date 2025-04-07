import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getMongoConfig = (
  configService: ConfigService,
): MongooseModuleOptions => {
  const host = configService.get<string>('MONGO_HOST');
  const port = configService.get<number>('MONGO_PORT');
  const username = configService.get<string>('MONGO_USERNAME');
  const password = configService.get<string>('MONGO_PASSWORD');
  const database = configService.get<string>('MONGO_DATABASE');
  const authSource = configService.get<string>('MONGO_AUTH_SOURCE');
  const uri = `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=${authSource}`;

  const maxPoolSize = configService.get<number>('MONGO_MAX_POOL_SIZE');
  const serverSelectionTimeoutMS = configService.get<number>(
    'MONGO_SERVER_SELECTION_TIMEOUT_MS',
  );
  const socketTimeoutMS = configService.get<number>('MONGO_SOCKET_TIMEOUT_MS');

  return {
    uri,
    maxPoolSize,
    serverSelectionTimeoutMS,
    socketTimeoutMS,
  };
};
