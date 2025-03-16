import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(UserModule);
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.USER_SERVICE_PORT || 3001;
  await app.listen(port);
  console.log(`User service is running on port ${port}`);
}

bootstrap();
