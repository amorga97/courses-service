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
      let registeredCourse = await this.Course.create(
        new Course(user, subject),
      );
      const answers = await this.answerService.createAnswersBySubject(
        subject,
        user,
        registeredCourse.id,
      );
      registeredCourse = await this.Course.findByIdAndUpdate(
        registeredCourse.id,
        { progress: { answered: 0, total: answers.length } },
      );
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

  async findOne(id: string, withAnswers: boolean) {
    const course = await this.Course.findById(id);
    if (course === null) throw new NotFoundException();
    if (withAnswers) {
      const answers = await this.answerService.findAllBySubject(course.subject);
      return { course, answers };
    }
    return { course, answers: null };
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
    const { deleted } = await this.answerService.deleteManyByCourseId(id);
    this.eventService.emit(new RemoveCourseEvent({ id }));
    return {
      Course: removedCourse,
      'deleted-questions': deleted,
    };
  }
}
