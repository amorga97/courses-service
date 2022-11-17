import { Schema } from 'mongoose';
import { Question } from 'src/question/domain/entities/question.model';

export const questionSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    options: { type: [], required: true },
    selected: { type: String, required: false, default: null },
    time: { type: Number, required: true, default: null },
    subject: { type: String, required: true },
  },
  { _id: false },
);

export const resultsSchema = new Schema(
  {
    right_answers: { type: Number, required: true },
    wrong_anserts: { type: Number, required: true },
    time: { type: Number, required: true },
  },
  { _id: false },
);

export const examSchema = new Schema({
  user: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
    length: 24,
  },
  course: {
    type: String,
    required: true,
    length: 24,
  },
  questions: {
    type: Array<
      [
        {
          question: { type: questionSchema };
          answer: { type: Types.ObjectId; ref: 'Answer' };
        },
      ]
    >,
  },
  results: {
    type: resultsSchema,
    required: false,
  },
})
  .set('toJSON', {
    transform: (_, ret) => {
      delete ret.__v;
      delete ret._id;
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

export type questionForExam = Question & {
  selected: string | null;
  time: number;
};
export interface iExam {
  id?: string;
  user: string;
  subject: string;
  course: string;
  questions: Array<(questionForExam | string)[]>;
  results?: {
    right_answers: number;
    wrong_answers: number;
    time: number;
  };
}

export interface iExamUpdateData {
  questions: Array<(Partial<questionForExam> | string)[]>;
}

export class Exam implements iExam {
  id?: string;
  user: string;
  subject: string;
  course: string;
  questions: Array<(questionForExam | string)[]>;

  constructor({ user, subject, course, questions }: Omit<iExam, 'id'>) {
    {
      this.user = user;
      this.subject = subject;
      this.course = course;
      this.questions = questions;
    }
  }
}
