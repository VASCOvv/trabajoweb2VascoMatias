import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS: permite que el frontend Vue consuma la API.
  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' });

  // Validación global de DTOs con class-validator.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades que no están en el DTO
      forbidNonWhitelisted: true, // y responde 400 si vienen propiedades extra
      transform: true,
    }),
  );

  // Swagger disponible en http://localhost:3000/docs
  const config = new DocumentBuilder()
    .setTitle('GameHub IPVG API')
    .setDescription('API REST para torneos de videojuegos y eSports del IPVG')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config), {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`API escuchando en http://localhost:${port}  |  Swagger: http://localhost:${port}/docs`);
}
bootstrap();
