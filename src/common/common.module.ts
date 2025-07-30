import {
  ExceptionFilter,
  Global,
  Module,
  NestInterceptor,
  PipeTransform,
  Type,
} from '@nestjs/common';
import { APP_FILTER, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { LoggerModule } from '../logger/logger.module';

@Global()
@Module({
  imports: [LoggerModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter as unknown as Type<ExceptionFilter>,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe as unknown as Type<PipeTransform>,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor as unknown as Type<NestInterceptor>,
    },
  ],
})
export class CommonModule {}
