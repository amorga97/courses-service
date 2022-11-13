import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  user: string;
  @IsString()
  @Length(24)
  subject: string;
}

export class ProgressDto {
  @IsNumber()
  answered: number;
  @IsNumber()
  total: number;
}
