import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User, Profile, UserProfile } from '../entities';
import { Client } from 'pg';

// Postgres 데이터베이스 생성 유틸리티 함수
const createPostgresDatabase = async (configService: ConfigService) => {
  const dbName = configService.get<string>('DB_DATABASE');

  const client = new Client({
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    user: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: 'postgres', // 기본 데이터베이스에 연결
  });

  try {
    await client.connect();
    // 데이터베이스가 존재하는지 확인
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName],
    );

    // 데이터베이스가 없으면 생성
    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database ${dbName} created successfully`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await client.end();
  }
};

export const getPostgresConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  // 데이터베이스 자동 생성 실행
  await createPostgresDatabase(configService);

  const nodeEnv = configService.get<string>('NODE_ENV');
  const isDevMode = nodeEnv === 'development';

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [User, Profile, UserProfile],
    synchronize: isDevMode, // 개발 환경에서만 true
    logging: isDevMode, // 개발 환경에서만 SQL 로깅
    // 프로덕션 환경을 위한 추가 설정
    ssl: !isDevMode ? { rejectUnauthorized: false } : false,
    extra: {
      max: isDevMode ? 10 : 100, // 프로덕션에서 더 많은 연결 풀
    },
  };
};
