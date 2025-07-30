import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    this.logger.log('HTTP Request started', 'HTTP');

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(`HTTP Request completed - ${responseTime}ms`, 'HTTP');
        },
        error: (error: unknown) => {
          const responseTime = Date.now() - now;
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `HTTP Request failed - ${responseTime}ms - ${errorMessage}`,
            undefined,
            'HTTP',
          );
        },
      }),
    );
  }
}
