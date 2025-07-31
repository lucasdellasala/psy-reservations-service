import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TherapistsService } from './therapists.service';
import { TherapistsSwagger } from './therapists.swagger';

@ApiTags(TherapistsSwagger.tags)
@Controller('therapists')
export class TherapistsController {
  constructor(private readonly therapistsService: TherapistsService) {}

  @Get()
  @ApiOperation(TherapistsSwagger.getAll.operation)
  @ApiResponse(TherapistsSwagger.getAll.response)
  async findAll(): Promise<any[]> {
    return this.therapistsService.findAll();
  }

  @Get(':id')
  @ApiOperation(TherapistsSwagger.getOne.operation)
  @ApiParam(TherapistsSwagger.getOne.param)
  @ApiResponse(TherapistsSwagger.getOne.response)
  @ApiResponse(TherapistsSwagger.getOne.notFound)
  async findOne(@Param('id') id: string): Promise<any> {
    const therapist = await this.therapistsService.findOne(id);
    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }
    return therapist;
  }

  @Get(':id/session-types')
  @ApiOperation(TherapistsSwagger.getSessionTypes.operation)
  @ApiParam(TherapistsSwagger.getSessionTypes.param)
  @ApiResponse(TherapistsSwagger.getSessionTypes.response)
  @ApiResponse(TherapistsSwagger.getSessionTypes.notFound)
  async findSessionTypes(@Param('id') id: string): Promise<any[]> {
    const sessionTypes = await this.therapistsService.findSessionTypes(id);
    if (sessionTypes.length === 0) {
      throw new NotFoundException('Therapist not found');
    }
    return sessionTypes;
  }
}
