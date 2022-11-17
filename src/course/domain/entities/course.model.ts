import { Schema } from 'mongoose';

const progressSchema = new Schema(
  {
    answered: Number,
    total: Number,
  },
  { _id: false },
);

// results?: {
//     right_answers: number;
//     wrong_answers: number;
//     time: number;
//   };

const examResultSchema = new Schema({
  right_answers: { type: Number, required: true },
  wrong_answers: { type: Number, required: true },
  time: { type: Number, required: true },
}).set('toObject', {
  transform: (_, ret) => {
    delete ret.__v;
    delete ret._id;
    return ret;
  },
  virtuals: true,
});

export const courseSchema = new Schema({
  user: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
    length: 24,
  },
  progress: {
    type: progressSchema,
    required: false,
  },
  success_rate: {
    type: Number,
    required: false,
  },
  exams_results: {
    type: [examResultSchema],
    required: false,
    default: [],
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

export interface iExamResult {
  right_answers: number;
  wrong_answers: number;
  time: number;
}

export interface iCourse {
  id?: string;
  user: string;
  subject: string;
  progress: {
    answered: number;
    total: number;
  };
  success_rate?: number;
  exams_results: iExamResult[];
}

export class Course implements iCourse {
  id?: string;
  user: string;
  subject: string;
  progress: { answered: number; total: number };
  success_rate?: number;
  exams_results: iExamResult[];

  constructor(user: string, subject: string) {
    this.user = user;
    this.subject = subject;
    this.exams_results = [];
  }
}
