import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { iQuestion } from '../../domain/entities/question.model';
import { QuestionRepository } from '../../domain/ports/question.repository';

@Injectable()
export class QuestionInMemoryRepository implements QuestionRepository {
  constructor(
    @InjectModel('Question')
    private readonly Question: Model<iQuestion>,
  ) {}

  async find(searchObject: FilterQuery<iQuestion>) {
    return await this.Question.find(searchObject);
  }

  async create(questionData: iQuestion) {
    const question = await this.Question.create(questionData);
    return question.toObject();
  }

  async findById(id: string) {
    return await this.Question.findById(id);
  }

  async findByIdAndUpdate(id: string, updateQuestionData: Partial<iQuestion>) {
    const question = await this.Question.findByIdAndUpdate(
      id,
      updateQuestionData,
      {
        new: true,
      },
    );
    if (question === null) return null;
    return question.toObject();
  }
  async findByIdAndDelete(id: string) {
    const deletedQuestion = await this.Question.findById(id);
    if (deletedQuestion === null) return null;
    return (await deletedQuestion.delete()).toObject();
  }

  async deleteManyBySubjectId(subjectId: string) {
    return await this.Question.deleteMany({ subject: subjectId });
  }
}
