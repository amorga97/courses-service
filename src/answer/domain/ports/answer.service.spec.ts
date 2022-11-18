import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AnswerInMemoryRepository } from '../../adapters/db/answer-in-memory.repository';
import {
  Subject,
  subjectSchema,
} from '../../../subject/domain/entities/subject.model';
import { Answer, answerSchema } from '../entities/answer.model';
import { AnswerRepository } from './answer.repository';
import { AnswerService } from './answer.service';
import { SubjectRepository } from '../../../subject/domain/ports/subject.repository';
import { SubjectInMemoryRepository } from '../../../subject/adapters/db/subject-in-memory.repository';
import { EventService } from '../../../events/event-service.service';
import { QuestionRepository } from '../../../question/domain/ports/question.repository';
import { QuestionInMemoryRepository } from '../../../question/adapters/db/question-in-memory.repository';
import {
  Question,
  questionSchema,
} from '../../../question/domain/entities/question.model';
import {
  CreateAnswerEvent,
  CreateManyAnswersEvent,
  RemoveAnswerEvent,
  RemoveManyAnswersByCourseIdEvent,
} from '../../../events/answer.events';

describe('AnswerService', () => {
  const mockSubjectId = '62b9a9f34e0dfa462d7dcbaf';

  const mockAnswer = {
    user: '62b9a9f34e0dfa462d7dcbaf',
    subject: '62b9a9f34e0dfa462d7dcbaf',
    question: '62b9a9f34e0dfa462d7dcbaf',
    course: '62b9a9f34e0dfa462d7dcbaf',
    average_answer_time: 0,
    stats: {
      answers: 0,
      correct: 0,
      wrong: 0,
    },
    last_answer: {
      date: '',
      correct: true,
    },
  };

  const mockSubject: Subject = {
    id: '',
    title: '',
    author: '',
  };

  const mockQuestion: Question = {
    id: '62b9a9f34e0dfa462d7dcbaf',
    subject: '',
    title: '',
    options: [],
  };

  const mockSubjectModel = {
    findById: jest.fn().mockResolvedValue(mockSubject),
    findByIdAndUpdate: jest.fn().mockResolvedValue(mockSubject),
    exists: jest.fn().mockResolvedValue(true),
  };

  const mockQuesionModel = {
    findOne: jest.fn().mockResolvedValue(mockQuestion),
    find: jest.fn().mockResolvedValue([mockQuestion]),
  };

  const mockAnswerModel = {
    create: jest.fn().mockResolvedValue({
      toObject: jest
        .fn()
        .mockReturnValue({ ...mockAnswer, id: '62b9a9f34e0dfa462d7dcbaf' }),
    }),
    insertMany: jest.fn().mockResolvedValue([
      {
        toObject: jest
          .fn()
          .mockReturnValue({ ...mockAnswer, id: '62b9a9f34e0dfa462d7dcbaf' }),
      },
    ]),
    find: jest.fn().mockReturnValue(mockAnswer),
    findById: jest.fn().mockReturnValue(mockAnswer),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      toObject: jest.fn().mockReturnValue({
        ...mockAnswer,
        id: '62b9a9f34e0dfa462d7dcbaf',
      }),
    }),
    findByIdAndDelete: jest.fn().mockResolvedValue(mockAnswer),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  };

  let service: AnswerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswerService,
        {
          provide: AnswerRepository,
          useClass: AnswerInMemoryRepository,
        },
        {
          provide: SubjectRepository,
          useClass: SubjectInMemoryRepository,
        },
        {
          provide: QuestionRepository,
          useClass: QuestionInMemoryRepository,
        },
        { provide: EventService, useValue: { emit: jest.fn() } },
      ],
      imports: [
        MongooseModule.forFeature([
          { name: 'Answer', schema: answerSchema },
          { name: 'Subject', schema: subjectSchema },
          { name: 'Question', schema: questionSchema },
        ]),
      ],
    })
      .overrideProvider(getModelToken('Answer'))
      .useValue(mockAnswerModel)
      .overrideProvider(getModelToken('Subject'))
      .useValue(mockSubjectModel)
      .overrideProvider(getModelToken('Question'))
      .useValue(mockQuesionModel)
      .compile();

    service = module.get<AnswerService>(AnswerService);
  });

  describe('When calling service.create with valid params', () => {
    test('It should create a new Answer and emit an event', async () => {
      const result = await service.create(mockAnswer);
      expect(result).toHaveProperty('answer', {
        ...mockAnswer,
        id: '62b9a9f34e0dfa462d7dcbaf',
      });
      expect(service.eventService.emit).toHaveBeenCalledWith(
        new CreateAnswerEvent({
          ...mockAnswer,
          id: '62b9a9f34e0dfa462d7dcbaf',
        } as unknown as Answer),
      );
    });
  });

  describe('When calling service.create with invalid request body', () => {
    test('It should throw an error and no events should be emitted', async () => {
      mockAnswerModel.create.mockImplementationOnce(async () => {
        const error = new Error();
        error.name = 'ValidationError';
        throw error;
      });
      expect(async () => {
        await service.create(mockAnswer);
      }).rejects.toThrow();
      expect(service.eventService.emit).not.toHaveBeenCalled();
    });
  });

  describe('When calling service.create with the id of a non existing subject', () => {
    test('It should throw an error and no events should be emitted', async () => {
      mockSubjectModel.exists.mockResolvedValueOnce(null);
      expect(service.create(mockAnswer)).rejects.toThrow();
      expect(service.eventService.emit).not.toHaveBeenCalled();
    });
  });

  describe('When calling service.createAnswersBySubject with valid params', () => {
    test('It should create a new array of Answers and emit an event', async () => {
      const result = await service.createAnswersBySubject(
        mockSubjectId,
        'userId',
        'courseId',
      );
      expect(result).toEqual([
        {
          ...mockAnswer,
          id: '62b9a9f34e0dfa462d7dcbaf',
        },
      ]);
      expect(service.eventService.emit).toHaveBeenCalledWith(
        new CreateManyAnswersEvent([
          {
            ...mockAnswer,
            id: '62b9a9f34e0dfa462d7dcbaf',
          } as unknown as Answer,
        ]),
      );
    });
  });

  describe('When calling service.createAnswersBySubject with inexistent subjectId', () => {
    test('It should create a new array of Answers and emit an event', async () => {
      mockQuesionModel.find.mockResolvedValueOnce(null);
      expect(async () => {
        await service.createAnswersBySubject(
          mockSubjectId,
          'userId',
          'courseId',
        );
      }).rejects.toThrow();
      expect(service.eventService.emit).not.toHaveBeenCalled();
    });
  });

  describe('When calling service.findAllBySubject with an existing subject id', () => {
    test('It should return an array of Answers', async () => {
      mockAnswerModel.find.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue([
          {
            toObject: jest.fn().mockReturnValue(mockAnswer),
          },
        ]),
      });
      expect(await service.findAllBySubject(mockSubjectId)).toEqual([
        mockAnswer,
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

  describe('When calling service.findOne with an existing Answer id', () => {
    test('It should return a Answer', async () => {
      expect(await service.findOne('id')).toEqual(mockAnswer);
    });
  });

  describe('When calling service.findOne with a non existing Answer id', () => {
    test('It should throw an error', async () => {
      mockAnswerModel.findById.mockReturnValueOnce(null);
      expect(async () => {
        await service.findOne('id');
      }).rejects.toThrow();
    });
  });

  describe('When calling service.update with an existing Answer id', () => {
    test('It should return the updated Answer and emit an event', async () => {
      const answer = { ...mockAnswer, id: '62b9a9f34e0dfa462d7dcbaf' };
      mockAnswerModel.findById.mockResolvedValueOnce(answer);
      mockAnswerModel.findByIdAndUpdate.mockResolvedValueOnce({
        toObject: jest.fn().mockReturnValue(answer),
      });
      const result = await service.update('id', {
        isCorrect: true,
        time: 12,
      });
      expect(result).toHaveProperty('Answer', {
        ...answer,
        subject: mockSubjectId,
        average_answer_time: 12,
      });
      expect(service.eventService.emit).toHaveBeenCalledWith(
        ...(service.eventService.emit as jest.Mock).mock.calls[0],
      );
    });
  });

  describe('When calling service.update with a non existing Answer id', () => {
    test('It should throw an error and no events should be emitted', async () => {
      mockAnswerModel.findByIdAndUpdate.mockReturnValueOnce(null);
      expect(async () => {
        await service.update('id', { isCorrect: true, time: 12 });
      }).rejects.toThrow();
      expect(service.eventService.emit).not.toHaveBeenCalled();
    });
  });

  describe('When calling service.delete with an existing Answer id', () => {
    test('It should return the deleted Answer', async () => {
      mockAnswerModel.findById.mockResolvedValueOnce({
        delete: jest.fn().mockResolvedValue({
          toObject: jest.fn().mockReturnValue({
            ...mockAnswer,
            id: '62b9a9f34e0dfa462d7dcbaf',
          }),
        }),
      });
      expect(await service.remove('id')).toEqual({
        ...mockAnswer,
        id: '62b9a9f34e0dfa462d7dcbaf',
      });
      expect(service.eventService.emit).toHaveBeenCalledWith(
        new RemoveAnswerEvent({
          id: 'id',
        }),
      );
    });
  });

  describe('When calling service.delete with a non existing Answer id', () => {
    test('It should throw an error and no events should be emitted', async () => {
      mockAnswerModel.findById.mockResolvedValueOnce(null);
      expect(async () => {
        await service.remove('id');
      }).rejects.toThrow();
      expect(service.eventService.emit).not.toHaveBeenCalled();
    });
  });

  describe('When calling service.deleteManyByCourseId with an existing Course id', () => {
    test('It should return the number deleted Answer', async () => {
      expect(await service.deleteManyByCourseId('id')).toEqual({
        deleted: 1,
      });
      expect(service.eventService.emit).toHaveBeenCalledWith(
        new RemoveManyAnswersByCourseIdEvent({
          id: 'id',
        }),
      );
    });
  });
});
