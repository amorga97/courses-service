import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { iCourse, iExamResult } from '../../domain/entities/course.model';
import { CourseRepository } from '../../domain/ports/course.repository';

@Injectable()
export class CourseInMemoryRepository implements CourseRepository {
  constructor(@InjectModel('Course') private readonly Course: Model<iCourse>) {}

  async create(CourseData: iCourse) {
    return (await this.Course.create(CourseData)).toObject();
  }
  async findById(id: string) {
    const course = await this.Course.findById(id);
    if (course === null) return null;
    return course.toObject();
  }
  async findOne(search: any) {
    const course = await this.Course.findOne(search);
    if (course === null) return null;
    return course;
  }
  async findByIdAndUpdate(id: string, updatedCourseData: Partial<iCourse>) {
    const course = await this.Course.findByIdAndUpdate(id, updatedCourseData, {
      new: true,
    });
    if (course === null) throw new NotFoundException();
    return course.toObject();
  }
  async findByIdAndDelete(id: string) {
    const course = await this.Course.findById(id);
    if (course === null) throw new NotFoundException();
    return (await course.delete()).toObject();
  }

  async exists(id: string) {
    return (await this.Course.exists({ id })) ? true : false;
  }

  async pushNewExamResult(id: string, result: iExamResult) {
    return (
      await this.Course.findByIdAndUpdate(
        id,
        {
          $push: { exams_results: result },
        },
        { new: true },
      )
    ).toObject();
  }
}
