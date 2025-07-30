import {
  ExceptionFilter,
  Global,
  Module,
  PipeTransform,
  Type,
} from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

@Global()
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter as unknown as Type<ExceptionFilter>,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe as unknown as Type<PipeTransform>,
    },
  ],
})
export class CommonModule {}
