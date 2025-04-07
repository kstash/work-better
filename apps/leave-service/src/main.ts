import { NestFactory } from '@nestjs/core';
import { LeaveModule } from './leave.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(LeaveModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') as number;

  // 전역 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS 설정
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL'),
    credentials: true,
  });

  // 전역 prefix 설정
  app.setGlobalPrefix('leave');

  await app.listen(port);
  console.log(`Leave service is running on port ${port}`);
}

bootstrap();
