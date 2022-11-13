import {
  Inject,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { EventService } from '../../../events/event-service.service';
import {
  CreateAnswerEvent,
  RemoveAnswerEvent,
  UpdateAnswerEvent,
} from '../../../events/answer.events';
import { SubjectRepository } from '../../../subject/domain/ports/subject.repository';
import { CreateAnswerDto } from '../../adapters/dto/create-answer.dto';
import { UpdateAnswerDto } from '../../adapters/dto/update-answer.dto';
import { AnswerRepository } from './answer.repository';
import { Answer, iAnswer } from '../entities/answer.model';
import { Types } from 'mongoose';
import { QuestionRepository } from '../../../question/domain/ports/question.repository';

@Injectable()
export class AnswerService {
  logger = new Logger('Answer Service');
  constructor(
    @Inject(AnswerRepository)
    private readonly Answer: AnswerRepository,
    @Inject(SubjectRepository)
    private readonly Subject: SubjectRepository,
    @Inject(QuestionRepository)
    private readonly Question: QuestionRepository,
    public readonly eventService: EventService,
  ) {}

  async create(createAnswerDto: CreateAnswerDto) {
    try {
      if (!(await this.Subject.exists(createAnswerDto.subject))) {
        throw new Error(
          'The subject id provided is not associated to any existing subject',
        );
      }
      const question = await this.Question.findById(createAnswerDto.question);
      const answer = await this.Answer.create(
        new Answer({
          ...createAnswerDto,
          question: new Types.ObjectId(question.id),
          date: new Date().toUTCString(),
        }),
      );
      this.eventService.emit(new CreateAnswerEvent(answer));
      return {
        answer,
      };
    } catch (err) {
      if (err.name === 'ValidationError') {
        this.logger.error(err);
        throw new NotAcceptableException();
      }
      this.logger.error(err.message);
      throw new NotFoundException(err.message);
    }
  }

  async findAllBySubject(subjectId: string) {
    if (await this.Subject.exists(subjectId)) {
      return this.Answer.find({ subject: subjectId });
    }
    throw new NotFoundException();
  }

  async findOne(id: string) {
    const Answer = await this.Answer.findById(id);
    if (Answer === null) throw new NotFoundException();
    return Answer;
  }

  async update(id: string, { isCorrect, time }: UpdateAnswerDto) {
    const answer = await this.Answer.findById(id);
    this.addAnswer(answer, isCorrect, time, new Date().toUTCString());
    const updatedAnswer = await this.Answer.findByIdAndUpdate(id, answer);
    this.eventService.emit(new UpdateAnswerEvent(updatedAnswer));
    if (updatedAnswer === null) throw new NotFoundException();
    return { Answer: updatedAnswer };
  }

  async remove(id: string) {
    const deletedAnswer = await this.Answer.findByIdAndDelete(id);
    if (deletedAnswer === null) throw new NotFoundException();
    this.eventService.emit(new RemoveAnswerEvent({ id }));
    return deletedAnswer;
  }

  private addAnswer(
    answer: iAnswer,
    isCorrect: boolean,
    time: number,
    date: string,
  ) {
    answer.stats.answers++;
    isCorrect ? answer.stats.correct++ : answer.stats.wrong++;
    answer.average_answer_time =
      (answer.average_answer_time * (answer.stats.answers - 1) + time) /
      answer.stats.answers;
    answer.last_answer = { correct: isCorrect, date };
  }
}
