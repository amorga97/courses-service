import { iExam } from '../entities/exam.model';

export interface ExamRepository {
  create({}: iExam): Promise<iExam>;
  findOne({}: Partial<iExam>): Promise<iExam>;
  findById(id: string): Promise<iExam>;
  findManyByCourseId(courseId: string): Promise<iExam[]>;
  findByIdAndUpdate(id: string, {}: Partial<iExam>): Promise<iExam>;
  findByIdAndDelete(id: string): Promise<iExam>;
  exists(id: string): Promise<boolean>;
}

export const ExamRepository = Symbol('ExamRepository');
