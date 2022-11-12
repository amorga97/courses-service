import {
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @MaxLength(200)
  title: string;
  @IsString()
  author: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsString()
  institution?: string;
  @IsOptional()
  @ValidateNested({ each: true })
  meta_data?: string[][];
}
