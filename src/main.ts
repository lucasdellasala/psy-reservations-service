import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { swaggerConfig } from './swagger/swagger.config';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = parseInt(process.env.PORT || '5000', 10);

  // JSON parsing middleware
  app.use(json({ limit: '10mb' }));

  // CORS configuration
  const corsOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ];

  // Add origins from environment variables
  for (let i = 1; i <= 10; i++) {
    const envOrigin = process.env[`CORS_ORIGIN_${i}`];
    if (envOrigin) {
      corsOrigins.push(envOrigin);
    }
  }

  // Add origins from CORS_ORIGINS environment variable (comma-separated)
  const additionalOrigins = process.env.CORS_ORIGINS;
  if (additionalOrigins) {
    const origins = additionalOrigins.split(',').map(origin => origin.trim());
    corsOrigins.push(...origins);
  }

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Idempotency-Key',
      'X-Requested-With',
    ],
    credentials: true,
  });

  console.log('CORS origins configured:', corsOrigins);

  // Swagger setup
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `Swagger documentation available at: http://localhost:${port}/api`,
  );
}

bootstrap();
