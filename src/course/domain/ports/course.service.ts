import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AnswerService } from 'src/answer/domain/ports/answer.service';
import {
  CreateCourseEvent,
  RemoveCourseEvent,
  UpdateCourseEvent,
} from '../../../events/course.events';
import { EventService } from '../../../events/event-service.service';
import { CreateCourseDto } from '../../adapters/dto/create-course.dto';
import { UpdateCourseDto } from '../../adapters/dto/update-course.dto';
import { Course } from '../entities/course.model';
import { CourseRepository } from './course.repository';

@Injectable()
export class CourseService {
  constructor(
    @Inject(CourseRepository) private readonly Course: CourseRepository,
    public readonly eventService: EventService,
    private readonly answerService: AnswerService,
  ) {}

  async create({ subject, user }: CreateCourseDto) {
    try {
      const registeredCourse = await this.Course.create(
        new Course(user, subject, 4),
      );
      await this.answerService.createAnswersBySubject(subject, user);
      this.eventService.emit(new CreateCourseEvent(registeredCourse));
      return registeredCourse;
    } catch (err) {
      if (err.code === 11000)
        throw new ConflictException(
          'A Course is already registered with the information you provided',
        );
      throw new BadRequestException(err.message, err.code);
    }
  }

  async findOne(id: string, withQuestions: boolean) {
    const Course = await this.Course.findById(id);
    if (Course === null) throw new NotFoundException();
    // if (withQuestions) {
    //   const questions = await this.Question.find({ Course: Course.id });
    //   return { ...Course, questions };
    // }
    return Course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    const updatedCourse = await this.Course.findByIdAndUpdate(
      id,
      updateCourseDto,
    );
    if (updatedCourse === null) throw new NotFoundException('Course not found');
    this.eventService.emit(new UpdateCourseEvent(updatedCourse));
    return updatedCourse;
  }

  async remove(id: string) {
    const removedCourse = await this.Course.findByIdAndDelete(id);
    // const { deletedCount } = await this.Question.deleteManyByCourseId(id);
    this.eventService.emit(new RemoveCourseEvent({ id }));
    return {
      Course: removedCourse,
      // 'deleted-questions': deletedCount,
    };
  }
}
