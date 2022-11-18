import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Helpers } from 'src/exam/helpers.service';
import { AnswerService } from '../../../answer/domain/ports/answer.service';
import { CourseService } from '../../../course/domain/ports/course.service';
import { EventService } from '../../../events/event-service.service';
import { Exam, iExam, questionForExam } from '../entities/exam.model';
import { ExamRepository } from './exam.repository';
import { formatISO } from 'date-fns';

@Injectable()
export class ExamService {
  constructor(
    @Inject(ExamRepository) private readonly Exam: ExamRepository,
    public readonly eventService: EventService,
    private readonly answerService: AnswerService,
    private readonly courseService: CourseService,
    private readonly helpers: Helpers,
  ) {}

  async create(userId: string, courseId: string, amount: number) {
    const answers = await this.answerService.findManyByCourseId(courseId);
    const selectedAnswers = this.helpers.selectAnswersForExam(answers, amount);

    const newExam = new Exam({
      user: userId,
      subject: answers[0].subject,
      course: courseId,
      questions: selectedAnswers.map(({ question, id }) => [
        { ...question, selected: '', time: 0 },
        id,
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
      date: formatISO(new Date()),
      time: 0,
    };
    for (const question of questions) {
      const [{ options, selected, time }, answerId] = question as unknown as [
        questionForExam,
        string,
      ];
      let isCorrect = options.filter((option) => option.id === selected)[0]
        ?.isCorrect;
      if (typeof isCorrect !== 'boolean') isCorrect = false;
      await this.answerService.update(answerId, { isCorrect, time });
      isCorrect ? results.right_answers++ : results.wrong_answers++;
      results.time += time;
    }
    await this.courseService.addExamResult(course, results);
    const updatedExam = await this.Exam.findByIdAndUpdate(id, { results });
    return updatedExam;
  }
}
