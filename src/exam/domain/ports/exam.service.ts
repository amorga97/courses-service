import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AnswerService } from '../../../answer/domain/ports/answer.service';
import { CourseService } from '../../../course/domain/ports/course.service';
import { EventService } from '../../../events/event-service.service';
import { QuestionService } from '../../../question/domain/ports/question.service';
import { Exam, iExam, questionForExam } from '../entities/exam.model';
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

    //TODO Definir y programar comportamiento de la creación de preguntas

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

  async update(
    examId: string,
    questions: [Partial<questionForExam>, string][],
  ) {
    return await this.Exam.findByIdAndUpdate(examId, { questions });
  }

  async submit(id: string) {
    const exam = await this.Exam.findById(id);
    if (exam === null) throw new NotFoundException('Exam not found');
    const { questions, course } = exam;
    const results: iExam['results'] = {
      right_answers: 0,
      wrong_answers: 0,
      time: 0,
    };
    for (const question of questions) {
      const [{ options, selected, time }, answerId] = question as unknown as [
        questionForExam,
        string,
      ];
      console.log(question);
      let isCorrect = options.filter((option) => option._id === selected)[0]
        .isCorrect;
      if (typeof isCorrect !== 'boolean') isCorrect = false;
      await this.answerService.update(answerId, { isCorrect, time });
      isCorrect ? results.right_answers++ : results.wrong_answers++;
      results.time += time;
    }
    await this.courseService.addExamResult(course, results);
    return await this.Exam.findByIdAndUpdate(id, { results });
  }
}
