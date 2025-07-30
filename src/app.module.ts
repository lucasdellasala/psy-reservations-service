import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { TopicsModule } from './topics/topics.module';
import { TherapistsModule } from './therapists/therapists.module';
import { HttpLoggerMiddleware } from './logger/http-logger.middleware';

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    CommonModule,
    HealthModule,
    TopicsModule,
    TherapistsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
