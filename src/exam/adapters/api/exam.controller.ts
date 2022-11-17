import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ExamService } from 'src/exam/domain/ports/exam.service';
import { CreateExamDto } from '../dto/create-exam.dto';
import { UpdateExamDto } from '../dto/update-exam.dto';

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() { questions }: UpdateExamDto) {
    return this.examService.update(id, questions);
  }

  @Post(':id')
  submit(@Param('id') id: string) {
    this.examService.submit(id);
  }

  // TODO: DELETE
}
