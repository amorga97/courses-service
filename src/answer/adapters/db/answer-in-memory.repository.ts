import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { iAnswer } from '../../domain/entities/answer.model';
import { AnswerRepository } from '../../domain/ports/answer.repository';

@Injectable()
export class AnswerInMemoryRepository implements AnswerRepository {
  constructor(
    @InjectModel('Answer')
    private readonly Answer: Model<iAnswer>,
  ) {}

  async find(searchObject: FilterQuery<iAnswer>) {
    return await this.Answer.find(searchObject);
  }

  async create(AnswerData: iAnswer) {
    const answer = await this.Answer.create(AnswerData);
    return answer.toObject();
  }

  async findById(id: string) {
    return await this.Answer.findById(id);
  }

  async findByIdAndUpdate(id: string, updateAnswerData: Partial<iAnswer>) {
    const answer = await this.Answer.findByIdAndUpdate(id, updateAnswerData, {
      new: true,
    });
    if (answer === null) throw new NotFoundException();
    return answer.toObject();
  }
  async findByIdAndDelete(id: string) {
    const deletedAnswer = await this.Answer.findById(id);
    if (deletedAnswer === null) throw new NotFoundException();
    return (await deletedAnswer.delete()).toObject();
  }

  async deleteManyBySubjectId(subjectId: string) {
    return await this.Answer.deleteMany({ subject: subjectId });
  }
}
