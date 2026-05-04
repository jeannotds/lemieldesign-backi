import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    // ✅ Active CORS
  app.enableCors({
    // origin: 'http://localhost:3000', // ton frontend Next.js
     origin: [
      'http://localhost:3000', // dev
      'https://lemieldesign-hhmr.vercel.app', // prod
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

    // ⚡ Active la validation partout
  app.useGlobalPipes(new ValidationPipe());

  // await app.listen(3000);
  // process.env.PORT est le port de l'application 3000 est le port du conteneur
  await app.listen(process.env.PORT || 3000, '0.0.0.0'); // 0.0.0.0 permet de rendre l'application accessible depuis l'extérieur 0.0.0.0 est l'adresse IP de la machine
}
bootstrap();
