import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionDto } from './create-questiondto';

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {}
