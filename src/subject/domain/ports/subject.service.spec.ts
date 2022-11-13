import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { iSubject, subjectSchema } from '../entities/subject.model';
import { SubjectService } from './subject.service';
import { SubjectRepository } from './subject.repository';
import { SubjectInMemoryRepository } from '../../adapters/db/subject-in-memory.repository';
import {
  iQuestion,
  questionSchema,
} from '../../../questions/domain/entities/question.model';
import { QuestionRepository } from '../../../questions/domain/ports/question.repository';
import { QuestionInMemoryRepository } from '../../../questions/adapters/db/question-in-memory.repository';

describe('SubjectService', () => {
  let service: SubjectService;

  const mockAuthorId = '62b9a9f34e0dfa462d7dcbaf';

  const mockSubject: iSubject = {
    id: '62b9a9f34e0dfa462d7dcbaf',
    title: 'test subject',
    author: mockAuthorId,
  };

  const mockQuestion: iQuestion = {
    id: '62b9a9f34e0dfa462d7dcbaf',
    subject: '123123123',
    title: 'Test',
    options: [
      {
        description: 'this is a test option',
        isCorrect: true,
      },
    ],
  };

  const mockQueryResult = {
    toObject: jest.fn().mockReturnValue(mockSubject),
  };

  const mockSubjectModel = {
    create: jest.fn().mockResolvedValue(mockQueryResult),
    findOne: jest.fn().mockResolvedValue(mockQueryResult),
    findById: jest.fn().mockResolvedValue(mockQueryResult),
    findOneAndUpdate: jest.fn().mockResolvedValue({
      toObject: jest.fn().mockReturnValue({
        ...mockSubject,
        title: 'updated',
      }),
    }),
  };

  const mockQuestionModel = {
    find: jest.fn().mockResolvedValue([mockQuestion]),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectService,
        { provide: SubjectRepository, useClass: SubjectInMemoryRepository },
        { provide: QuestionRepository, useClass: QuestionInMemoryRepository },
      ],
      imports: [
        MongooseModule.forFeature([{ name: 'Subject', schema: subjectSchema }]),
        MongooseModule.forFeature([
          { name: 'Question', schema: questionSchema },
        ]),
      ],
    })
      .overrideProvider(getModelToken('Subject'))
      .useValue(mockSubjectModel)
      .overrideProvider(getModelToken('Question'))
      .useValue(mockQuestionModel)
      .compile();

    service = module.get<SubjectService>(SubjectService);
  });

  describe('When calling service.create with a new subjects info', () => {
    test('Then it should return the new subject saved to the DB', async () => {
      const result = await service.create(mockSubject);
      expect(result).toEqual(mockSubject);
    });
  });

  describe('When calling service.create with info from an already registered subject', () => {
    test('Then it should throw an error and no event should be emitted', async () => {
      mockSubjectModel.create.mockImplementation(async () => {
        const error = { code: 11000 };
        throw error;
      });
      const result = await service.create(mockSubject);
      expect(result).toBeNull();
    });
  });

  describe('When calling service.findOne with a valid subject id with questions', () => {
    test('Then it should return the subject from the db', async () => {
      const result = await service.findOne('id', true);
      expect(result).toEqual({ ...mockSubject, questions: [mockQuestion] });
    });
  });

  describe('When calling service.findOne with a valid subject id without questions', () => {
    test('Then it should return the subject from the db', async () => {
      expect(await service.findOne('id', false)).toEqual(mockSubject);
    });
  });

  describe('When calling service.findOne with an invalid subject id', () => {
    test('Then it should throw an error', async () => {
      mockSubjectModel.findOne.mockResolvedValueOnce({
        toObject: jest.fn().mockReturnValue(null),
      });
      const result = await service.findOne('id', false);
      expect(result).toBeNull();
    });
  });

  describe('When calling service.update with a valid subject id', () => {
    test('Then it should return the updated subject data', async () => {
      const result = await service.update('id', {
        ...mockSubject,
        title: 'updated',
      });
      expect(result).toEqual({
        ...mockSubject,
        title: 'updated',
      });
    });
  });

  describe('When calling service.update with an invalid subject id', () => {
    test('Then it should throw an error', async () => {
      mockSubjectModel.findOneAndUpdate.mockResolvedValueOnce({
        toObject: jest.fn().mockReturnValue(null),
      });
      const result = await service.update('id', {
        ...mockSubject,
        title: 'updated',
      });
      expect(result).toBeNull();
    });
  });

  describe('When calling service.remove with a valid subject id', () => {
    test('Then it should return the deleted subject and emit an event', async () => {
      mockSubjectModel.findOne.mockResolvedValueOnce({
        delete: jest.fn().mockResolvedValue({
          toObject: jest.fn().mockReturnValue(mockSubject),
        }),
      });
      expect(await service.remove('id')).toEqual(mockSubject);
    });
  });

  describe('When calling service.remove with an invalid subject id', () => {
    test('Then it should throw an error', async () => {
      mockSubjectModel.findOne.mockResolvedValueOnce(null);
      const result = await service.remove('id');
      expect(result).toBeNull();
    });
  });
});
