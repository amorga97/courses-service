import { Schema } from 'mongoose';
import { iQuestion } from 'src/question/domain/entities/question.model';

export const subjectSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    length: 24,
  },
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
  },
  description: {
    type: String,
    required: false,
    minlength: 250,
    maxlength: 2000,
  },
  institution: {
    type: String,
    required: false,
    minlength: 3,
    maxlength: 100,
  },
  author: {
    type: String,
    required: true,
  },
  meta_data: {
    type: [[String, String]],
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

export interface iSubject {
  id: string;
  title: string;
  author: string;
  description?: string;
  institution?: string;
  meta_data?: string[][];
  questions?: iQuestion[];
}

export class Subject implements iSubject {
  id: string;
  title: string;
  author: string;
  description?: string;
  institution?: string;
  meta_data?: string[][];
  questions?: iQuestion[];
}

export interface SubjectInDb extends Omit<Subject, '_id'> {
  id: string;
}
