import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class UpdateExamDto {
  @IsOptional()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdateProgressDto)
  progress?: { answered: number; total: number };
  @IsOptional()
  @IsNumber()
  success_rate?: number;
}

export class UpdateProgressDto {
  @IsOptional()
  @IsNumber()
  answered: number;
  @IsOptional()
  @IsNumber()
  total: number;
}
