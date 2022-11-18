import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { questionForExam } from 'src/exam/domain/entities/exam.model';
export class UpdateExamDto {
  @IsOptional()
  @IsNotEmpty()
  questions: [QuestionDto, string][];
}

export class OptionDto {
  @IsNotEmpty()
  @IsString()
  description: string;
  @IsBoolean()
  isCorrect: boolean;
}
export class QuestionDto implements Partial<questionForExam> {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options: [];
  @IsString()
  selected: string;
  @IsNumber()
  time: number;
}
