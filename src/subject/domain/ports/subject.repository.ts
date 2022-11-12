import { iSubject } from '../entities/subject.model';

export interface SubjectRepository {
  create({}: iSubject): Promise<iSubject>;
  findOne({}: Partial<iSubject>): Promise<iSubject>;
  findById(id: string): Promise<iSubject>;
  findByIdAndUpdate(id: string, {}: Partial<iSubject>): Promise<iSubject>;
  findByIdAndDelete(id: string): Promise<iSubject>;
  exists(id: string): Promise<boolean>;
}

export const SubjectRepository = Symbol('SubjectRepository');
