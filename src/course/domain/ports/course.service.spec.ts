import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { iSubject, Subject, subjectSchema } from '../entities/course.model';
import { SubjectService } from './course.service';
import { SubjectRepository } from './course.repository';
import { SubjectInMemoryRepository } from '../../adapters/db/subject-in-memory.repository';
import {
  iQuestion,
  questionSchema,
} from '../../../questions/domain/entities/question.model';
import { QuestionRepository } from '../../../questions/domain/ports/question.repository';
import { QuestionInMemoryRepository } from '../../../questions/adapters/db/question-in-memory.repository';
import { EventService } from '../../../events/event-service.service';
import {
  CreateSubjectEvent,
  RemoveSubjectEvent,
  UpdateSubjectEvent,
} from '../../../events/subject.events';

describe('SubjectService', () => {
  let service: SubjectService;

  const mockAuthorId = '62b9a9f34e0dfa462d7dcbaf';

  const mockSubject: iSubject = {
    title: 'test subject',
    author: mockAuthorId,
  };

  const mockSubjectInDb = { ...mockSubject, id: '62b9a9f34e0dfa462d7dcbaf' };

  const mockQuestion: iQuestion = {
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
    toObject: jest.fn().mockReturnValue(mockSubjectInDb),
  };

  const mockSubjectModel = {
    create: jest.fn().mockResolvedValue(mockQueryResult),
    findOne: jest.fn().mockResolvedValue(mockQueryResult),
    findById: jest.fn().mockResolvedValue(mockQueryResult),
    findByIdAndUpdate: jest.fn().mockResolvedValue({
      toObject: jest.fn().mockReturnValue({
        ...mockSubjectInDb,
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
        { provide: EventService, useValue: { emit: jest.fn() } },
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
    test('Then it should return the new subject saved to the DB and emit an event', async () => {
      const result = await service.create(mockSubject);
      expect(result).toEqual(mockSubjectInDb);
      expect(service.eventService.emit).toHaveBeenCalledWith(
        new CreateSubjectEvent(mockSubjectInDb as unknown as Subject),
      );
    });
  });

  describe('When calling service.create with info from an already registered subject', () => {
    test('Then it should throw an error and no event should be emitted', async () => {
      mockSubjectModel.create.mockImplementation(async () => {
        const error = { code: 11000 };
        throw error;
      });
      expect(async () => {
        await service.create(mockSubject);
      }).rejects.toThrow();
      expect(service.eventService.emit).not.toHaveBeenCalled();
    });
  });

  describe('When calling service.findOne with a valid subject id with questions', () => {
    test('Then it should return the subject from the db', async () => {
      const result = await service.findOne('id', true);
      expect(result).toEqual({ ...mockSubjectInDb, questions: [mockQuestion] });
    });
  });

  describe('When calling service.findOne with a valid subject id without questions', () => {
    test('Then it should return the subject from the db', async () => {
      expect(await service.findOne('id', false)).toEqual(mockSubjectInDb);
    });
  });

  describe('When calling service.findOne with an invalid subject id', () => {
    test('Then it should throw an error', async () => {
      mockSubjectModel.findById.mockResolvedValueOnce(null);
      expect(async () => {
        await service.findOne('id', false);
      }).rejects.toThrow();
    });
  });

  describe('When calling service.update with a valid subject id', () => {
    test('Then it should return the updated subject data and emit an event', async () => {
      const result = await service.update('id', {
        ...mockSubjectInDb,
        title: 'updated',
      });
      expect(result).toEqual({
        ...mockSubjectInDb,
        title: 'updated',
      });
      expect(service.eventService.emit).toHaveBeenCalledWith(
        new UpdateSubjectEvent({
          ...mockSubjectInDb,
          title: 'updated',
        } as unknown as Subject),
      );
    });
  });

  describe('When calling service.update with an invalid subject id', () => {
    test('Then it should throw an error and no events should be emitted', async () => {
      mockSubjectModel.findByIdAndUpdate.mockResolvedValueOnce(null);
      expect(async () => {
        await service.update('id', { ...mockSubject, title: 'updated' });
      }).rejects.toThrow();
      expect(service.eventService.emit).not.toHaveBeenCalled();
    });
  });

  describe('When calling service.remove with a valid subject id', () => {
    test('Then it should return the deleted subject and emit an event', async () => {
      const mockResponse = {
        'deleted-questions': 1,
        subject: mockSubjectInDb,
      };
      mockSubjectModel.findById.mockResolvedValueOnce({
        delete: jest.fn().mockResolvedValue({
          toObject: jest.fn().mockReturnValue(mockSubjectInDb),
        }),
      });
      expect(await service.remove('id')).toEqual(mockResponse);
      expect(service.eventService.emit).toHaveBeenCalledWith(
        new RemoveSubjectEvent({ id: 'id' }),
      );
    });
  });

  describe('When calling service.remove with an invalid subject id', () => {
    test('Then it should throw an error and no events should be emitted', async () => {
      mockSubjectModel.findById.mockResolvedValueOnce(null);
      expect(async () => {
        await service.remove('id');
      }).rejects.toThrow();
      expect(service.eventService.emit).not.toHaveBeenCalled();
    });
  });
});
