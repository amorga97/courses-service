import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuestionRepository } from '../../../questions/domain/ports/question.repository';
import { CreateSubjectDto } from '../../adapters/dto/create-subject.dto';
import { UpdateSubjectDto } from '../../adapters/dto/update-subject.dto';
import { SubjectRepository } from './subject.repository';

@Injectable()
export class SubjectService {
  constructor(
    @Inject(SubjectRepository) private readonly Subject: SubjectRepository,
    @Inject(QuestionRepository) private readonly Question: QuestionRepository,
  ) {}

  async create(createSubjectDto: CreateSubjectDto) {
    try {
      const registeredSubject = await this.Subject.create(createSubjectDto);
      return registeredSubject;
    } catch (err) {
      if (err.code === 11000)
        throw new ConflictException(
          'A Subject is already registered with the information you provided',
        );
    }
  }

  async findOne(id: string, withQuestions: boolean) {
    const subject = await this.Subject.findById(id);
    if (subject === null) throw new NotFoundException();
    if (withQuestions) {
      const questions = await this.Question.find({ subject: subject._id });
      return { ...subject, questions };
    }
    return subject;
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    const updatedSubject = await this.Subject.findByIdAndUpdate(id, {
      ...updateSubjectDto,
    });
    if (updatedSubject === null)
      throw new NotFoundException('Subject not found');
    return updatedSubject;
  }

  async remove(id: string) {
    const removedSubject = await this.Subject.findByIdAndDelete(id);
    return removedSubject;
  }
}
