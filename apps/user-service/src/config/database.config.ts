import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Client } from 'pg';
import { User } from '../entities/user.entity';

export async function createDatabase(config: ConfigService) {
  const client = new Client({
    host: config.get('DB_HOST'),
    port: config.get('DB_PORT'),
    user: config.get('DB_USERNAME'),
    password: config.get('DB_PASSWORD'),
    database: 'postgres', // 기본 데이터베이스로 연결
  });

  try {
    await client.connect();
    const dbName = config.get('DB_DATABASE');

    // 데이터베이스 존재 여부 확인
    const checkDb = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName],
    );

    // 데이터베이스가 없으면 생성
    if (checkDb.rowCount === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created successfully`);
    }
  } catch (error) {
    console.error('Error while creating database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

export const getDatabaseConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  // 데이터베이스 자동 생성 실행
  await createDatabase(configService);

  const nodeEnv = configService.get('NODE_ENV', 'development');
  const isDevMode = nodeEnv === 'development';

  return {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [User],
    synchronize: isDevMode, // 개발 환경에서만 true
    logging: isDevMode, // 개발 환경에서만 SQL 로깅
    // 프로덕션 환경을 위한 추가 설정
    ssl: !isDevMode ? { rejectUnauthorized: false } : false,
    extra: {
      max: isDevMode ? 10 : 100, // 프로덕션에서 더 많은 연결 풀
    },
  };
};
