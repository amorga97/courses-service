import { SubjectEventActions } from 'src/subject/domain/entities/subject-actions.enum';

export interface EventData<T> {
  topic: 'subject' | 'question';
  info: EventInfo<T>;
}

export interface EventInfo<T> {
  action: SubjectEventActions;
  data: T | { id: string };
}
