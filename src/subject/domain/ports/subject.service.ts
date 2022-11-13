import { Inject, Injectable, Logger } from '@nestjs/common';
import { QuestionRepository } from '../../../questions/domain/ports/question.repository';
import { CreateSubjectDto } from '../../adapters/dto/create-subject.dto';
import { UpdateSubjectDto } from '../../adapters/dto/update-subject.dto';
import { SubjectRepository } from './subject.repository';

@Injectable()
export class SubjectService {
  logger = new Logger('Subject Service');
  constructor(
    @Inject(SubjectRepository) private readonly Subject: SubjectRepository,
    @Inject(QuestionRepository) private readonly Question: QuestionRepository,
  ) {}

  async create(createSubjectDto: CreateSubjectDto) {
    try {
      const registeredSubject = await this.Subject.create(createSubjectDto);
      return registeredSubject;
    } catch (err) {
      this.logger.error(err);
    }
  }

  async findOne(id: string, withQuestions: boolean) {
    const subject = await this.Subject.findById(id);
    if (subject === null) {
      this.logger.error('Subject not found');
      return;
    }
    if (withQuestions) {
      const questions = await this.Question.find({ subject: subject.id });
      return { ...subject, questions };
    }
    return subject;
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    const updatedSubject = await this.Subject.findByIdAndUpdate(id, {
      ...updateSubjectDto,
    });
    if (updatedSubject === null) {
      this.logger.error('Subject not found');
      return;
    }
    return updatedSubject;
  }

  async remove(id: string) {
    const removedSubject = await this.Subject.findByIdAndDelete(id);
    await this.Question.deleteManyBySubjectId(id);
    if (removedSubject === null) {
      this.logger.error('Subject not found');
      return;
    }
    return removedSubject;
  }
}
