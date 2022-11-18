import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateExamDto {
  @IsString()
  @IsNotEmpty()
  user: string;
  @IsString()
  @Length(24)
  course: string;
}
