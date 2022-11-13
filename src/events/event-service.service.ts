import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Answer } from 'src/answer/domain/entities/answer.model';
import { Course } from 'src/course/domain/entities/course.model';
import { EventData } from './events.model';

@Injectable()
export class EventService {
  constructor(@Inject('COURSES') private readonly coursesClient: ClientKafka) {}

  emit({ topic, info }: EventData<Course | Answer>) {
    this.coursesClient.emit(topic, info);
  }
}
