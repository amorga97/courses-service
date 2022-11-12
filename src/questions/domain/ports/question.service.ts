import { Inject, Injectable, Logger } from '@nestjs/common';
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
        this.logger.error('Invalid params');
      }
      this.logger.error(err.message);
      this.logger.error(err);
    }
  }

  async findAllBySubject(subjectId: string) {
    if (await this.Subject.exists(subjectId)) {
      return this.Question.find({ subject: subjectId });
    }
    this.logger.error('Subject not found');
  }

  async findOne(id: string) {
    const question = await this.Question.findById(id);
    if (question === null) this.logger.error('Question not found');
    return question;
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    const updatedQuestion = await this.Question.findByIdAndUpdate(
      id,
      updateQuestionDto,
    );
    if (updatedQuestion === null) this.logger.error('Question not found');
    return { question: updatedQuestion };
  }

  async remove(id: string) {
    const deletedQuestion = await this.Question.findByIdAndDelete(id);
    if (deletedQuestion === null) this.logger.error('Question not found');
    return deletedQuestion;
  }
}
