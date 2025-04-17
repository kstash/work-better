import * as dotenv from 'dotenv';
import { DataSourceOptions } from 'typeorm';

dotenv.config();

export const getTypeOrmBaseConfig = (
  type: 'postgres' | 'mysql',
  entities: any[],
  migrations: any[],
): DataSourceOptions => ({
  type,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities,
  migrations,
  logging: true,
  ...(process.env.NODE_ENV === 'production'
    ? {
        ssl: {
          rejectUnauthorized: true,
        },
      }
    : {}),
});
