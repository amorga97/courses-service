import { FilterQuery } from 'mongoose';
import { iQuestion } from '../entities/question.model';

export interface QuestionRepository {
  create({}: iQuestion): Promise<iQuestion>;
  find({}: FilterQuery<iQuestion>): Promise<iQuestion[]>;
  findById(id: string): Promise<iQuestion>;
  findByIdAndUpdate(id: string, {}: Partial<iQuestion>): Promise<iQuestion>;
  findByIdAndDelete(id: string): Promise<iQuestion>;
  deleteManyBySubjectId(subjectId: string): Promise<{ deletedCount: number }>;
}

export const QuestionRepository = Symbol('QuestionRepository');
