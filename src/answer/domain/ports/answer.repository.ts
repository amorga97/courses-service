import { FilterQuery } from 'mongoose';
import { iAnswer } from '../entities/answer.model';

export interface AnswerRepository {
  create({}: iAnswer): Promise<iAnswer>;
  find({}: FilterQuery<iAnswer>): Promise<iAnswer[]>;
  findById(id: string): Promise<iAnswer>;
  findByIdAndUpdate(id: string, {}: Partial<iAnswer>): Promise<iAnswer>;
  findByIdAndDelete(id: string): Promise<iAnswer>;
  deleteManyBySubjectId(subjectId: string): Promise<{ deletedCount: number }>;
}

export const AnswerRepository = Symbol('AnswerRepository');
