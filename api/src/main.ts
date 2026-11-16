import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common'; // <-- Добавили

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Включаем глобальную валидацию
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Автоматически удаляет из тела запроса поля, которых нет в DTO
    transform: true, // Автоматически преобразует типы (например, строку в число, если в DTO указано число)
  }));

  app.enableCors();
  await app.listen(3000);
}
bootstrap();