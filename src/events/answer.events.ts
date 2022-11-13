import { Answer } from '../answer/domain/entities/answer.model';
import { EventData, EventInfo } from './events.model';

export const enum AnswerEventActions {
  CREATE = 'ANSWER_CREATE',
  UPDATE = 'ANSWER_UPDATE',
  REMOVE = 'ANSWER_REMOVE',
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
