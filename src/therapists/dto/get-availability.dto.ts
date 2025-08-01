import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetAvailabilityDto {
  @IsOptional()
  @IsString()
  weekStart?: string;

  @IsString()
  sessionTypeId: string;

  @IsOptional()
  @IsString()
  patientTz?: string;

  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  @Min(5)
  @Max(120)
  stepMin?: number = 15;
}
