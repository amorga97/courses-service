import { Schema, SchemaTypes, Types } from 'mongoose';

const statsSchema = new Schema(
  {
    answers: { type: Number, required: true },
    correct: { type: Number, required: true },
    wrong: { type: Number, required: true },
  },
  { _id: false },
);

const lastAnswerSchema = new Schema(
  {
    date: { type: String, required: true },
    correct: { type: Boolean, required: true },
  },
  { _id: false },
);

export const answerSchema = new Schema({
  user: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
    length: 24,
  },
  question: { type: SchemaTypes.ObjectId, ref: 'Question', required: true },
  average_answer_time: { type: Number, required: true },
  stats: {
    type: statsSchema,
    required: true,
  },
  last_answer: {
    type: lastAnswerSchema,
    required: true,
  },
})
  .set('toJSON', {
    transform: (_, ret) => {
      delete ret.__v;
    },
  })
  .set('toObject', {
    transform: (_, ret) => {
      delete ret.__v;
      delete ret._id;
      return ret;
    },
    virtuals: true,
  });

export interface iAnswer {
  id?: string;
  user: string;
  subject: string;
  question: Types.ObjectId;
  average_answer_time: number;
  stats: {
    answers: number;
    correct: number;
    wrong: number;
  };
  last_answer: {
    date: string;
    correct: boolean;
  };
}

export class Answer implements iAnswer {
  id?: string;
  user: string;
  subject: string;
  question: Types.ObjectId;
  average_answer_time: number;
  stats: { answers: number; correct: number; wrong: number };
  last_answer: { date: string; correct: boolean };

  constructor({
    user,
    subject,
    question,
    date,
  }: {
    user: string;
    subject: string;
    question: Types.ObjectId;
    date: string;
  }) {
    this.user = user;
    this.subject = subject;
    this.average_answer_time;
    this.question = question;
    this.average_answer_time = 0;
    this.stats = { answers: 0, correct: 0, wrong: 0 };
    this.last_answer = { correct: true, date };
  }
}
