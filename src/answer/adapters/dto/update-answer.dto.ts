import { IsBoolean, IsNumber } from 'class-validator';

export class UpdateAnswerDto {
  @IsNumber()
  time: number;
  @IsBoolean()
  isCorrect: boolean;
}
