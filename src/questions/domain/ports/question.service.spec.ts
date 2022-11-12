import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { QuestionInMemoryRepository } from '../../adapters/db/question-in-memory.repository';
import { subjectSchema } from '../../../subject/domain/entities/subject.model';
import {
  iQuestion,
  Question,
  questionSchema,
} from '../entities/question.model';
import { QuestionRepository } from './question.repository';
import { QuestionService } from './question.service';
import { SubjectRepository } from '../../../subject/domain/ports/subject.repository';
import { SubjectInMemoryRepository } from '../../../subject/adapters/db/subject-in-memory.repository';
import { EventService } from '../../../events/event-service.service';
import {
  CreateQuestionEvent,
  RemoveQuestionEvent,
  UpdateQuestionEvent,
} from '../../../events/question.events';

describe('QuestionService', () => {
  const mockOption = {
    description: 'mock option',
    isCorrect: false,
  };

  const mockSubjectId = '62b9a9f34e0dfa462d7dcbaf';

  const mockQuestion: Omit<iQuestion, '_id'> = {
    options: [
      mockOption,
      mockOption,
      mockOption,
      { ...mockOption, isCorrect: true },
    ],
    subject: mockSubjectId,
    title: 'test question',
  };

  const mockBar = {
    id: 'testID',
    reservations: [],
    save: jest.fn(),
  };

  const mockSubjectModel = {
    findById: jest.fn().mockResolvedValue(mockBar),
    findByIdAndUpdate: jest.fn().mockResolvedValue(mockBar),
    exists: jest.fn().mockReturnValue(true),
  };

  const mockQuestionModel = {
    create: jest.fn().mockResolvedValue({
      toObject: jest
        .fn()
        .mockReturnValue({ ...mockQuestion, id: '62b9a9f34e0dfa462d7dcbaf' }),
    }),
    find: jest.fn().mockReturnValue(mockQuestion),
    findById: jest.fn().mockReturnValue(mockQuestion),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      toObject: jest.fn().mockReturnValue({
        ...mockQuestion,
        id: '62b9a9f34e0dfa462d7dcbaf',
        title: 'updated',
      }),
    }),
    findByIdAndDelete: jest.fn().mockResolvedValue(mockQuestion),
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
        { provide: EventService, useValue: { emit: jest.fn() } },
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
    test('It should create a new question and emit an event', async () => {
      const result = await service.create(mockQuestion);
      expect(result).toHaveProperty('question', {
        ...mockQuestion,
        id: '62b9a9f34e0dfa462d7dcbaf',
      });
      expect(service.eventService.emit).toHaveBeenCalledWith(
        new CreateQuestionEvent({
          ...mockQuestion,
          id: '62b9a9f34e0dfa462d7dcbaf',
        } as unknown as Question),
      );
    });
  });

  describe('When calling service.create with invalid request body', () => {
    test('It should throw an error and no events should be emitted', async () => {
      mockQuestionModel.create.mockImplementationOnce(async () => {
        const error = new Error();
        error.name = 'ValidationError';
        throw error;
      });
      expect(async () => {
        await service.create(mockQuestion);
      }).rejects.toThrow();
      expect(service.eventService.emit).not.toHaveBeenCalled();
    });
  });

  describe('When calling service.create with the id of a non existing subject', () => {
    test('It should throw an error and no events should be emitted', async () => {
      mockSubjectModel.exists.mockResolvedValueOnce(null);
      expect(service.create(mockQuestion)).rejects.toThrow();
      expect(service.eventService.emit).not.toHaveBeenCalled();
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
    test('It should throw an error', async () => {
      mockSubjectModel.exists.mockResolvedValueOnce(false);
      expect(async () => {
        await service.findAllBySubject(mockSubjectId);
      }).rejects.toThrow();
    });
  });

  describe('When calling service.findOne with an existing question id', () => {
    test('It should return a question', async () => {
      expect(await service.findOne('id')).toEqual(mockQuestion);
    });
  });

  describe('When calling service.findOne with a non existing question id', () => {
    test('It should throw an error', async () => {
      mockQuestionModel.findById.mockReturnValueOnce(null);
      expect(async () => {
        await service.findOne('id');
      }).rejects.toThrow();
    });
  });

  describe('When calling service.update with an existing question id', () => {
    test('It should return the updated question and emit an event', async () => {
      const result = await service.update('id', {
        ...mockQuestion,
        title: 'updated',
      });
      expect(result).toHaveProperty('question', {
        ...mockQuestion,
        id: '62b9a9f34e0dfa462d7dcbaf',
        subject: mockSubjectId,
        title: 'updated',
      });
      expect(service.eventService.emit).toHaveBeenCalledWith(
        new UpdateQuestionEvent({
          ...mockQuestion,
          title: 'updated',
          id: '62b9a9f34e0dfa462d7dcbaf',
          subject: mockSubjectId,
        } as unknown as Question),
      );
    });
  });

  describe('When calling service.update with a non existing question id', () => {
    test('It should throw an error and no events should be emitted', async () => {
      mockQuestionModel.findByIdAndUpdate.mockReturnValueOnce(null);
      expect(async () => {
        await service.update('id', { ...mockQuestion, title: 'updated' });
      }).rejects.toThrow();
      expect(service.eventService.emit).not.toHaveBeenCalled();
    });
  });

  describe('When calling service.delete with an existing question id', () => {
    test('It should return the deleted question', async () => {
      mockQuestionModel.findById.mockResolvedValueOnce({
        delete: jest.fn().mockResolvedValue({
          toObject: jest.fn().mockReturnValue({
            ...mockQuestion,
            id: '62b9a9f34e0dfa462d7dcbaf',
          }),
        }),
      });
      expect(await service.remove('id')).toEqual({
        ...mockQuestion,
        id: '62b9a9f34e0dfa462d7dcbaf',
      });
      expect(service.eventService.emit).toHaveBeenCalledWith(
        new RemoveQuestionEvent({
          id: 'id',
        }),
      );
    });
  });

  describe('When calling service.delete with a non existing question id', () => {
    test('It should throw an error and no events should be emitted', async () => {
      mockQuestionModel.findById.mockResolvedValueOnce(null);
      expect(async () => {
        await service.remove('id');
      }).rejects.toThrow();
      expect(service.eventService.emit).not.toHaveBeenCalled();
    });
  });
});
