import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { iSubject } from '../../domain/entities/subject.model';
import { SubjectRepository } from '../../domain/ports/subject.repository';

@Injectable()
export class SubjectInMemoryRepository implements SubjectRepository {
  constructor(
    @InjectModel('Subject') private readonly Subject: Model<iSubject>,
  ) {}

  async create(SubjectData: iSubject) {
    return (await this.Subject.create(SubjectData)).toObject();
  }
  async findById(id: string) {
    const subject = await this.Subject.findById(id);
    if (subject === null) return null;
    return subject.toObject();
  }
  async findOne(search: any) {
    const subject = await this.Subject.findOne(search);
    if (subject === null) return null;
    return subject;
  }
  async findByIdAndUpdate(id: string, updatedSubjectData: Partial<iSubject>) {
    const subject = await this.Subject.findByIdAndUpdate(
      id,
      updatedSubjectData,
      {
        new: true,
      },
    );
    if (subject === null) return null;
    return subject.toObject();
  }
  async findByIdAndDelete(id: string) {
    const subject = await this.Subject.findById(id);
    if (subject === null) return null;
    return (await subject.delete()).toObject();
  }

  async exists(id: string) {
    return (await this.Subject.exists({ id })) ? true : false;
  }
}
