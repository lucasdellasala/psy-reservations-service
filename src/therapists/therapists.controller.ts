import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TherapistsService } from './therapists.service';

@ApiTags('therapists')
@Controller('therapists')
export class TherapistsController {
  constructor(private readonly therapistsService: TherapistsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get therapist profile by ID' })
  @ApiParam({ name: 'id', description: 'Therapist ID' })
  @ApiResponse({
    status: 200,
    description: 'Therapist profile with topics',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        timezone: { type: 'string' },
        topics: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Therapist not found' })
  async findOne(@Param('id') id: string) {
    const therapist = await this.therapistsService.findOne(id);
    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }
    return therapist;
  }

  @Get(':id/session-types')
  @ApiOperation({ summary: 'Get therapist session types' })
  @ApiParam({ name: 'id', description: 'Therapist ID' })
  @ApiResponse({
    status: 200,
    description: 'List of therapist session types',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          durationMin: { type: 'number' },
          priceMinor: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Therapist not found' })
  async findSessionTypes(@Param('id') id: string) {
    const sessionTypes = await this.therapistsService.findSessionTypes(id);
    if (sessionTypes.length === 0) {
      throw new NotFoundException('Therapist not found');
    }
    return sessionTypes;
  }
}
