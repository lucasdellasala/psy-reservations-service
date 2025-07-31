import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('PSY Reservations Service')
  .setDescription('API para gestión de reservas psicológicas')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
