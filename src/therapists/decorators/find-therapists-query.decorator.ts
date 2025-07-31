import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export const FindTherapistsQuery = () =>
  applyDecorators(
    ApiQuery({
      name: 'topicIds',
      required: false,
      description: 'Comma-separated list of topic IDs',
    }),
    ApiQuery({
      name: 'requireAll',
      required: false,
      description: 'When true, therapist must have ALL specified topics',
    }),
    ApiQuery({
      name: 'modality',
      required: false,
      enum: ['online', 'in_person'],
      description: 'Filter by modality',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      description: 'Number of results to return',
      type: Number,
    }),
    ApiQuery({
      name: 'offset',
      required: false,
      description: 'Number of results to skip',
      type: Number,
    }),
  );
