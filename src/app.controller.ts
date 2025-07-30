import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ErrorCodes } from './common/error-codes';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Root endpoint' })
  @ApiResponse({ status: 200, description: 'Service is running' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-error')
  @ApiOperation({ summary: 'Test error handling' })
  @ApiResponse({ status: 400, description: 'Custom error response' })
  testError() {
    throw new HttpException(
      {
        error: 'Custom Error',
        code: ErrorCodes.NOT_FOUND,
        message: 'This is a test error',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
