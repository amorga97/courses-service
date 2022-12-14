import { Schema, SchemaTypes, Types } from 'mongoose';

const optionSchema = new Schema({
  description: String,
  isCorrect: Boolean,
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

export const questionSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    length: 24,
  },
  subject: { type: SchemaTypes.ObjectId, ref: 'Subject', required: true },
  title: { type: SchemaTypes.String, required: true },
  options: {
    type: [optionSchema],
    required: true,
    length: { min: 2 },
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

export interface iOption {
  id?: string;
  description: string;
  isCorrect: boolean;
}

export interface iQuestion {
  _id?: Types.ObjectId;
  id: string;
  subject: string;
  title: string;
  options: iOption[];
}

export class Question implements iQuestion {
  id: string;
  subject: string;
  title: string;
  options: iOption[];

  constructor({
    subject,
    title,
    options,
  }: {
    subject: string;
    title: string;
    options: iOption[];
  }) {
    this.subject = subject;
    this.title = title;
    this.options = options;
  }
}

export interface QuestionInDb extends Omit<Question, '_id'> {
  id: string;
}
