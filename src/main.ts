import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';

  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Prefijo global para las rutas (ej: /api/usuarios)
  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  // Usar el puerto de Render o 3000 por defecto
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
