import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum Modality {
  ONLINE = 'online',
  IN_PERSON = 'in_person',
}

export class FindTherapistsDto {
  @ApiPropertyOptional({
    description: 'Comma-separated list of topic IDs to filter by',
    type: String,
    example: 'topic1,topic2',
  })
  @IsOptional()
  @IsString()
  topicIds?: string;

  @ApiPropertyOptional({
    description:
      'When true, therapist must have ALL specified topics. When false, therapist must have ANY of the specified topics',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }): boolean => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  requireAll?: boolean;

  @ApiPropertyOptional({
    description: 'Filter therapists by modality',
    enum: Modality,
    example: 'online',
  })
  @IsOptional()
  @IsEnum(Modality)
  modality?: Modality;

  @ApiPropertyOptional({
    description: 'Number of results to return',
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Number of results to skip',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;
}
