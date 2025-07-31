import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import {
  CreateSessionDocs,
  GetSessionDocs,
  CancelSessionDocs,
} from './sessions.swagger';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CreateSessionDocs()
  async createSession(
    @Body() createSessionDto: CreateSessionDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(idempotencyKey)) {
      throw new BadRequestException('Idempotency-Key must be a valid UUID');
    }

    const session = await this.sessionsService.createSession(
      createSessionDto,
      idempotencyKey,
    );

    if (session.idempotencyKey === idempotencyKey) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Session already exists',
        data: session,
      };
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Session created successfully',
      data: session,
    };
  }

  @Get(':id')
  @GetSessionDocs()
  async findOne(@Param('id') id: string) {
    const session = await this.sessionsService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Session retrieved successfully',
      data: session,
    };
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @CancelSessionDocs()
  async cancelSession(@Param('id') id: string) {
    const session = await this.sessionsService.cancelSession(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Session canceled successfully',
      data: session,
    };
  }
}
