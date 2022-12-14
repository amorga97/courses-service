import { iCourse, iExamResult } from '../entities/course.model';

export interface CourseRepository {
  create({}: iCourse): Promise<iCourse>;
  findOne({}: Partial<iCourse>): Promise<iCourse>;
  findById(id: string): Promise<iCourse>;
  findByIdAndUpdate(id: string, {}: Partial<iCourse>): Promise<iCourse>;
  findByIdAndDelete(id: string): Promise<iCourse>;
  exists(id: string): Promise<boolean>;
  pushNewExamResult(id: string, result: iExamResult): Promise<iCourse>;
}

export const CourseRepository = Symbol('CourseRepository');
