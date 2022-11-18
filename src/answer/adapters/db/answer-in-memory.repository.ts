import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { iQuestion } from 'src/question/domain/entities/question.model';
import {
  Answer,
  iAnswer,
  populatedAnswer,
} from '../../domain/entities/answer.model';
import { AnswerRepository } from '../../domain/ports/answer.repository';
import { formatISO } from 'date-fns';

@Injectable()
export class AnswerInMemoryRepository implements AnswerRepository {
  constructor(
    @InjectModel('Answer')
    private readonly Answer: Model<iAnswer>,
  ) {}

  async find(searchObject: FilterQuery<iAnswer>) {
    const answers = (
      await this.Answer.find(searchObject).populate('question', {
        __v: 0,
      })
    ).map((answer) => answer.toObject()) as populatedAnswer[];
    console.log(answers);
    return answers;
  }

  async create(AnswerData: iAnswer) {
    const answer = await this.Answer.create(AnswerData);
    return answer.toObject();
  }

  async createManyFromQuestions({
    questions,
    subjectId,
    userId,
    courseId,
  }: {
    questions: iQuestion[];
    subjectId: string;
    userId: string;
    courseId: string;
  }) {
    const answersToCreate = questions.map(
      (question) =>
        new Answer({
          date: formatISO(new Date()),
          question: question._id,
          subject: subjectId,
          course: courseId,
          user: userId,
        }),
    );
    const answersInDb = await this.Answer.insertMany(answersToCreate);
    return answersInDb.map((answer) => answer.toObject());
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

  async deleteManyByCourseId(courseId: string) {
    return await this.Answer.deleteMany({ course: courseId });
  }
}
