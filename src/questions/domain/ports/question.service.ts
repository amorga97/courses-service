import {
  Inject,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { SubjectRepository } from '../../../subject/domain/ports/subject.repository';
import { CreateQuestionDto } from '../../adapters/dto/create-questiondto';
import { UpdateQuestionDto } from '../../adapters/dto/update-question.dto';
import { QuestionRepository } from './question.repository';

@Injectable()
export class QuestionService {
  logger = new Logger('Question Service');
  constructor(
    @Inject(QuestionRepository)
    private readonly Question: QuestionRepository,
    @Inject(SubjectRepository)
    private readonly Subject: SubjectRepository,
  ) {}

  async create(createQuestionDto: CreateQuestionDto) {
    try {
      if (!(await this.Subject.exists(createQuestionDto.subject))) {
        throw new Error(
          'The subject id provided is not associated to any existing subject',
        );
      }
      const question = await this.Question.create(createQuestionDto);
      return {
        question,
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
      return this.Question.find({ subject: subjectId });
    }
    throw new NotFoundException();
  }

  async findOne(id: string) {
    const question = await this.Question.findById(id);
    if (question === null) throw new NotFoundException();
    return question;
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    const updatedQuestion = await this.Question.findByIdAndUpdate(
      id,
      updateQuestionDto,
    );
    if (updatedQuestion === null) throw new NotFoundException();
    return { question: updatedQuestion };
  }

  async remove(id: string) {
    const deletedQuestion = await this.Question.findByIdAndDelete(id);
    if (deletedQuestion === null) throw new NotFoundException();
    return deletedQuestion;
  }
}
