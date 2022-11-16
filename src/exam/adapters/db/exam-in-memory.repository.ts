import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { iExam } from '../../domain/entities/exam.model';
import { ExamRepository } from '../../domain/ports/exam.repository';

@Injectable()
export class ExamInMemoryRepository implements ExamRepository {
  constructor(@InjectModel('Exam') private readonly Exam: Model<iExam>) {}

  async create(examData: iExam) {
    return (await this.Exam.create(examData)).toObject();
  }
  async findById(id: string) {
    const exam = await this.Exam.findById(id);
    if (exam === null) return null;
    return exam.toObject();
  }
  async findOne(search: any) {
    const exam = await this.Exam.findOne(search);
    if (exam === null) return null;
    return exam.toObject();
  }
  async findByIdAndUpdate(id: string, updatedexamData: Partial<iExam>) {
    const exam = await this.Exam.findByIdAndUpdate(id, updatedexamData, {
      new: true,
    });
    if (exam === null) throw new NotFoundException();
    return exam.toObject();
  }
  async findByIdAndDelete(id: string) {
    const exam = await this.Exam.findById(id);
    if (exam === null) throw new NotFoundException();
    return (await exam.delete()).toObject();
  }

  async exists(id: string) {
    return (await this.Exam.exists({ id })) ? true : false;
  }
}
