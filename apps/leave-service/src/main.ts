import { NestFactory } from '@nestjs/core';
import { LeaveModule } from './leave.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(LeaveModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3004;

  await app.listen(port);
  console.log(`Leave service is running on port ${port}`);
}

bootstrap();
