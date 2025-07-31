import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiHeader,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

export const CreateSessionDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create a new session',
      description: 'Create a new therapy session with idempotency support',
    }),
    ApiHeader({
      name: 'Idempotency-Key',
      description: 'UUID for idempotency',
      required: true,
    }),
    ApiResponse({
      status: 201,
      description: 'Session created successfully',
    }),
    ApiResponse({
      status: 200,
      description: 'Session already exists (idempotency)',
    }),
    ApiResponse({
      status: 409,
      description: 'SLOT_TAKEN - Session slot is already taken',
    }),
    ApiResponse({
      status: 422,
      description:
        'OUT_OF_WINDOW - Session time is not within availability window',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid data or missing Idempotency-Key',
    }),
  );

export const GetSessionDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get session by ID',
      description:
        'Retrieve a session with timezone-converted start and end times',
    }),
    ApiParam({
      name: 'id',
      description: 'Session ID',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Session retrieved successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Session not found',
    }),
  );

export const CancelSessionDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Cancel session',
      description: 'Cancel a session (idempotent operation)',
    }),
    ApiParam({
      name: 'id',
      description: 'Session ID',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Session canceled successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Session not found',
    }),
  );
