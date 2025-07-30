import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import pinoHttp from 'pino-http';
import pino from 'pino';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly httpLogger: ReturnType<typeof pinoHttp>;

  constructor() {
    const logger = pino({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    });

    this.httpLogger = pinoHttp({ logger });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.httpLogger(req, res);
    next();
  }
}
