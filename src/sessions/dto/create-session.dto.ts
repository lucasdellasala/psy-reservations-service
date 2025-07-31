import { IsString, IsNotEmpty, IsEmail, IsISO8601 } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({
    description: 'ID del terapeuta',
    example: 't1',
  })
  @IsString()
  @IsNotEmpty()
  therapistId: string;

  @ApiProperty({
    description: 'ID del tipo de sesión',
    example: 'st1',
  })
  @IsString()
  @IsNotEmpty()
  sessionTypeId: string;

  @ApiProperty({
    description: 'Fecha y hora de inicio en UTC',
    example: '2025-07-29T20:00:00Z',
  })
  @IsISO8601()
  startUtc: string;

  @ApiProperty({
    description: 'ID del paciente',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    description: 'Nombre del paciente',
    example: 'Lucas',
  })
  @IsString()
  @IsNotEmpty()
  patientName: string;

  @ApiProperty({
    description: 'Email del paciente',
    example: 'lucas@mail.com',
  })
  @IsEmail()
  patientEmail: string;

  @ApiProperty({
    description: 'Zona horaria del paciente',
    example: 'America/Argentina/Buenos_Aires',
  })
  @IsString()
  @IsNotEmpty()
  patientTz: string;
}
