import { FilterQuery } from 'mongoose';
import { iQuestion } from 'src/question/domain/entities/question.model';
import { iAnswer } from '../entities/answer.model';

export interface AnswerRepository {
  create({}: iAnswer): Promise<iAnswer>;
  find({}: FilterQuery<iAnswer>): Promise<iAnswer[]>;
  findById(id: string): Promise<iAnswer>;
  findByIdAndUpdate(id: string, {}: Partial<iAnswer>): Promise<iAnswer>;
  findByIdAndDelete(id: string): Promise<iAnswer>;
  deleteManyBySubjectId(subjectId: string): Promise<{ deletedCount: number }>;
  deleteManyByCourseId(courseId: string): Promise<{ deletedCount: number }>;
  createManyFromQuestions({
    questions,
    subjectId,
    userId,
    courseId,
  }: {
    questions: iQuestion[];
    subjectId: string;
    userId: string;
    courseId: string;
  }): Promise<iAnswer[]>;
}

export const AnswerRepository = Symbol('AnswerRepository');
