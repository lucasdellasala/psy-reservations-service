import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('PSY Reservations Service')
  .setDescription('API para gestión de reservas psicológicas')
  .setVersion('1.0')
  .addTag('reservations', 'Gestión de reservas')
  .addTag('psychologists', 'Gestión de psicólogos')
  .addTag('patients', 'Gestión de pacientes')
  .addBearerAuth()
  .build();
