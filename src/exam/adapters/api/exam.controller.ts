import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ExamService } from 'src/exam/domain/ports/exam.service';
import { CreateExamDto } from '../dto/create-exam.dto';

@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  create(@Body() { user, subject, course }: CreateExamDto) {
    return this.examService.create(user, subject, course);
  }

  @Get(':courseId')
  findByCourseId(@Param('courseId') courseId: string) {
    return this.examService.findByCourseId(courseId);
  }

  // TODO: UPDATE
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateExamDto: UpdateExamDto) {
  //   return this.examService.update(+id, updateExamDto);
  // }

  // TODO: SUBMIT

  // TODO: DELETE
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.examService.remove(+id);
  // }
}
