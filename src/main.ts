import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    // ✅ Active CORS
  app.enableCors({
    origin: 'http://localhost:3000', // ton frontend Next.js
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

    // ⚡ Active la validation partout
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
