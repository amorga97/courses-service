import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AnswerService } from 'src/answer/domain/ports/answer.service';
import { CourseService } from 'src/course/domain/ports/course.service';
import { EventService } from 'src/events/event-service.service';
import { QuestionService } from 'src/question/domain/ports/question.service';
import { Exam } from '../entities/exam.model';
import { ExamRepository } from './exam.repository';

@Injectable()
export class ExamService {
  constructor(
    @Inject(ExamRepository) private readonly Exam: ExamRepository,
    public readonly eventService: EventService,
    private readonly questionService: QuestionService,
    private readonly answerService: AnswerService,
    private readonly courseService: CourseService,
  ) {}

  async create(userId: string, subjectId: string, courseId: string) {
    const questions = await this.questionService.findAllBySubject(subjectId);
    const answers = await this.answerService.findManyByCourseId(courseId);
    if (questions.length !== answers.length)
      throw new BadRequestException('Subject Id and Course Id do not match.');

    const newExam = new Exam({
      user: userId,
      subject: subjectId,
      course: courseId,
      questions: questions.map((question, i) => [
        { ...question },
        answers[i].id,
      ]),
    });

    return await this.Exam.create(newExam);
  }

  async findByCourseId(courseId: string) {
    return await this.Exam.findManyByCourseId(courseId);
  }
}
