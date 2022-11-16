import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateAnswerDto {
  @IsNotEmpty()
  @IsString()
  user: string;
  @IsNotEmpty()
  @IsString()
  @Length(24)
  subject: string;
  @IsNotEmpty()
  @IsString()
  @Length(24)
  course: string;
  @IsNotEmpty()
  @IsString()
  @Length(24)
  question: string;
}
