import { Course } from '../course/domain/entities/course.model';
import { EventData, EventInfo } from '../events/events.model';

export const enum CourseEventActions {
  CREATE = 'COURSE_CREATE',
  UPDATE = 'COURSE_UPDATE',
  REMOVE = 'COURSE_REMOVE',
}

export class CreateCourseEvent implements EventData<Course> {
  topic: 'course';
  info: EventInfo<Course>;
  constructor(Course: Course) {
    this.topic = 'course';
    this.info = { action: CourseEventActions.CREATE, data: Course };
  }

  toString() {
    return JSON.stringify(this);
  }
}
export class UpdateCourseEvent implements EventData<Course> {
  topic: 'course';
  info: EventInfo<Course>;
  constructor(Course: Course) {
    this.topic = 'course';
    this.info = { action: CourseEventActions.UPDATE, data: Course };
  }

  toString() {
    return JSON.stringify(this);
  }
}

export class RemoveCourseEvent implements EventData<Course> {
  topic: 'course';
  info: EventInfo<Course>;
  constructor(data: { id: string }) {
    this.topic = 'course';
    this.info = this.info = { action: CourseEventActions.REMOVE, data };
  }

  toString() {
    return JSON.stringify(this);
  }
}
