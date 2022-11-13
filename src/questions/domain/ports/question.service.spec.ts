import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { QuestionInMemoryRepository } from '../../adapters/db/question-in-memory.repository';
import {
  iSubject,
  subjectSchema,
} from '../../../subject/domain/entities/subject.model';
import { iQuestion, questionSchema } from '../entities/question.model';
import { QuestionRepository } from './question.repository';
import { QuestionService } from './question.service';
import { SubjectRepository } from '../../../subject/domain/ports/subject.repository';
import { SubjectInMemoryRepository } from '../../../subject/adapters/db/subject-in-memory.repository';

describe('QuestionService', () => {
  const mockOption = {
    description: 'mock option',
    isCorrect: false,
  };

  const mockSubjectId = '62b9a9f34e0dfa462d7dcbaf';

  const mockQuestion: iQuestion = {
    id: '62b9a9f34e0dfa462d7dcbaf',
    options: [
      mockOption,
      mockOption,
      mockOption,
      { ...mockOption, isCorrect: true },
    ],
    subject: mockSubjectId,
    title: 'test question',
  };

  const mockSubject: iSubject = {
    id: '62b9a9f34e0dfa462d7dcbaf',
    title: 'test subject',
    author: '62b9a9f34e0dfa462d7dcbaf',
  };

  const mockSubjectModel = {
    findById: jest.fn().mockResolvedValue(mockSubject),
    findByIdAndUpdate: jest.fn().mockResolvedValue(mockSubject),
    exists: jest.fn().mockReturnValue(true),
  };

  const mockQuestionModel = {
    create: jest.fn().mockResolvedValue({
      toObject: jest
        .fn()
        .mockReturnValue({ ...mockQuestion, id: '62b9a9f34e0dfa462d7dcbaf' }),
    }),
    find: jest.fn().mockReturnValue(mockQuestion),
    findOne: jest.fn().mockReturnValue(mockQuestion),
    findOneAndUpdate: jest.fn().mockReturnValue({
      toObject: jest.fn().mockReturnValue({
        ...mockQuestion,
        id: '62b9a9f34e0dfa462d7dcbaf',
        title: 'updated',
      }),
    }),
    findOneAndDelete: jest.fn().mockResolvedValue(mockQuestion),
  };

  let service: QuestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        {
          provide: QuestionRepository,
          useClass: QuestionInMemoryRepository,
        },
        {
          provide: SubjectRepository,
          useClass: SubjectInMemoryRepository,
        },
      ],
      imports: [
        MongooseModule.forFeature([
          { name: 'Question', schema: questionSchema },
          { name: 'Subject', schema: subjectSchema },
        ]),
      ],
    })
      .overrideProvider(getModelToken('Question'))
      .useValue(mockQuestionModel)
      .overrideProvider(getModelToken('Subject'))
      .useValue(mockSubjectModel)
      .compile();

    service = module.get<QuestionService>(QuestionService);
  });

  describe('When calling service.create with valid params', () => {
    test('It should create a new question', async () => {
      const result = await service.create(mockQuestion);
      expect(result).toEqual(mockQuestion);
    });
  });

  describe('When calling service.create with invalid request body', () => {
    test('It should return null', async () => {
      mockQuestionModel.create.mockImplementationOnce(async () => {
        const error = new Error();
        error.name = 'ValidationError';
        throw error;
      });
      const result = await service.create(mockQuestion);
      expect(result).toBeNull();
    });
  });

  describe('When calling service.create with the id of a non existing subject', () => {
    test('It should return null', async () => {
      mockSubjectModel.exists.mockResolvedValueOnce(null);
      const result = await service.create(mockQuestion);
      expect(result).toBeNull();
    });
  });

  describe('When calling service.findAllBySubject with an existing subject id', () => {
    test('It should return an array of questions', async () => {
      mockQuestionModel.find.mockReturnValueOnce([mockQuestion]);
      expect(await service.findAllBySubject(mockSubjectId)).toEqual([
        mockQuestion,
      ]);
    });
  });

  describe('When calling service.findAllBySubject with a non existing subject id', () => {
    test('It should return null', async () => {
      mockSubjectModel.exists.mockResolvedValueOnce(false);
      const result = await service.findAllBySubject(mockSubjectId);
      expect(result).toBeNull();
    });
  });

  describe('When calling service.findOne with an existing question id', () => {
    test('It should return a question', async () => {
      expect(await service.findOne('id')).toEqual(mockQuestion);
    });
  });

  describe('When calling service.findOne with a non existing question id', () => {
    test('It should return null', async () => {
      mockQuestionModel.findOne.mockReturnValueOnce(null);
      const result = await service.findOne('id');
      expect(result).toBeNull();
    });
  });

  describe('When calling service.update with an existing question id', () => {
    test('It should return the updated', async () => {
      const result = await service.update('id', {
        ...mockQuestion,
        title: 'updated',
      });
      expect(result).toEqual({
        ...mockQuestion,
        title: 'updated',
      });
    });
  });

  describe('When calling service.update with a non existing question id', () => {
    test('It should return null', async () => {
      mockQuestionModel.findOneAndUpdate.mockReturnValueOnce(null);
      const result = await service.update('id', {
        ...mockQuestion,
        title: 'updated',
      });
      expect(result).toBeNull();
    });
  });

  describe('When calling service.delete with an existing question id', () => {
    test('It should return the deleted question', async () => {
      mockQuestionModel.findOne.mockResolvedValueOnce({
        delete: jest.fn().mockResolvedValue({
          toObject: jest.fn().mockReturnValue(mockQuestion),
        }),
      });
      expect(await service.remove('id')).toEqual(mockQuestion);
    });
  });

  describe('When calling service.delete with a non existing question id', () => {
    test('It should return null', async () => {
      mockQuestionModel.findOne.mockResolvedValueOnce(null);
      const result = await service.remove('id');
      expect(result).toBeNull();
    });
  });
});
