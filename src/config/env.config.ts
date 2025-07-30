import { IsString, IsNumber, IsIn, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class EnvironmentConfig {
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsIn(['development', 'production', 'test'])
  NODE_ENV: string;

  @IsString()
  @IsOptional()
  TZ: string = 'UTC';
}
