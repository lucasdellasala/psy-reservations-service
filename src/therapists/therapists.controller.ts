import {
  Controller,
  Get,
  Param,
  NotFoundException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TherapistsService } from './therapists.service';
import { TherapistsSwagger } from './therapists.swagger';
import { FindTherapistsDto } from './dto/find-therapists.dto';
import { GetAvailabilityDto } from './dto/get-availability.dto';
import { FindTherapistsQuery } from './decorators/find-therapists-query.decorator';

@ApiTags(TherapistsSwagger.tags)
@Controller('therapists')
export class TherapistsController {
  constructor(private readonly therapistsService: TherapistsService) {}

  @Get()
  @ApiOperation(TherapistsSwagger.getAll.operation)
  @FindTherapistsQuery()
  @ApiResponse(TherapistsSwagger.getAll.response)
  async findAll(@Query() filters: FindTherapistsDto): Promise<any[]> {
    return this.therapistsService.findWithFilters(filters);
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

  @Get(':id/availability')
  @ApiOperation({
    summary: 'Get therapist availability',
    description: 'Get available time slots for a therapist in a specific week',
  })
  @ApiParam({ name: 'id', description: 'Therapist ID' })
  @ApiResponse({
    status: 200,
    description: 'Availability retrieved successfully',
    type: Object,
  })
  async getAvailability(
    @Param('id') id: string,
    @Query() query: GetAvailabilityDto,
  ): Promise<any> {
    try {
      // Obtener los tipos de sesión del terapeuta
      const sessionTypes = await this.therapistsService.findSessionTypes(id);
      if (sessionTypes.length === 0) {
        throw new NotFoundException('Therapist not found');
      }

      // Establecer valores por defecto
      const weekStart = query.weekStart || this.getCurrentWeekStart();
      const patientTz = query.patientTz || 'America/Argentina/Buenos_Aires';
      const stepMin = query.stepMin || 15;

      // Si no se especifica sessionTypeId, obtener disponibilidad para todos los tipos de sesión
      if (!query.sessionTypeId) {
        const allAvailability = await Promise.all(
          sessionTypes.map(async sessionType => {
            const availabilityResponse =
              await this.therapistsService.getAvailability(
                id,
                sessionType.id,
                weekStart,
                patientTz,
                stepMin,
              );
            return {
              sessionTypeId: sessionType.id,
              sessionTypeName: sessionType.name,
              availability: availabilityResponse.availability,
            };
          }),
        );

        return {
          therapistId: id,
          weekStart,
          patientTz,
          stepMin,
          sessionTypes: allAvailability,
        };
      }

      // Si se especifica sessionTypeId, obtener disponibilidad solo para ese tipo
      return this.therapistsService.getAvailability(
        id,
        query.sessionTypeId,
        weekStart,
        patientTz,
        stepMin,
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('is required')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  private getCurrentWeekStart(): string {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1); // Lunes = 1
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
  }
}
