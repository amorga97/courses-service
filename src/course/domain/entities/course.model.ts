import { Schema } from 'mongoose';

const progressSchema = new Schema(
  {
    answered: Number,
    total: Number,
  },
  { _id: false },
);

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
    required: true,
  },
  success_rate: {
    type: Number,
    required: false,
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

export interface iCourse {
  id?: string;
  user: string;
  subject: string;
  progress: {
    answered: number;
    total: number;
  };
  success_rate?: number;
}

export class Course implements iCourse {
  id?: string;
  user: string;
  subject: string;
  progress: { answered: number; total: number };
  success_rate?: number;

  constructor(user: string, subject: string, total: number) {
    {
      this.user = user;
      this.subject = subject;
      this.progress = { answered: 0, total };
    }
  }
}
