import { CourseEventActions } from './Course.events';

export interface EventData<T> {
  topic: 'course' | 'answer';
  info: EventInfo<T>;
}

export interface EventInfo<T> {
  action: CourseEventActions;
  data: T | { id: string };
}
