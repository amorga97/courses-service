import { Answer } from '../answer/domain/entities/answer.model';
import { EventData, EventInfo } from './events.model';

export const enum AnswerEventActions {
  CREATE = 'ANSWER_CREATE',
  CREATE_MANY = 'ANSWER_CREATE_MANY',
  UPDATE = 'ANSWER_UPDATE',
  REMOVE = 'ANSWER_REMOVE',
  REMOVE_MANY_BY_COURSEID = 'ANSWER_REMOVE_MANY_BY_COURSEID',
}

export class CreateAnswerEvent implements EventData<Answer> {
  topic: 'answer';
  info: EventInfo<Answer>;
  constructor(Answer: Answer) {
    this.topic = 'answer';
    this.info = { action: AnswerEventActions.CREATE, data: Answer };
  }

  toString() {
    return JSON.stringify(this);
  }
}
export class CreateManyAnswersEvent implements EventData<Answer> {
  topic: 'answer';
  info: EventInfo<Answer>;
  constructor(answers: Answer[]) {
    this.topic = 'answer';
    this.info = { action: AnswerEventActions.CREATE, data: answers };
  }

  toString() {
    return JSON.stringify(this);
  }
}
export class UpdateAnswerEvent implements EventData<Answer> {
  topic: 'answer';
  info: EventInfo<Answer>;
  constructor(Answer: Answer) {
    this.topic = 'answer';
    this.info = { action: AnswerEventActions.UPDATE, data: Answer };
  }

  toString() {
    return JSON.stringify(this);
  }
}

export class RemoveAnswerEvent implements EventData<Answer> {
  topic: 'answer';
  info: EventInfo<Answer>;
  constructor(data: { id: string }) {
    this.topic = 'answer';
    this.info = this.info = { action: AnswerEventActions.REMOVE, data };
  }

  toString() {
    return JSON.stringify(this);
  }
}

export class RemoveManyAnswersByCourseIdEvent implements EventData<Answer> {
  topic: 'answer';
  info: EventInfo<Answer>;
  constructor(data: { id: string }) {
    this.topic = 'answer';
    this.info = this.info = {
      action: AnswerEventActions.REMOVE_MANY_BY_COURSEID,
      data,
    };
  }

  toString() {
    return JSON.stringify(this);
  }
}
