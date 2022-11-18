import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { iCourse, Course, courseSchema } from '../entities/course.model';
import { CourseService } from './course.service';
import { CourseRepository } from './course.repository';
import { CourseInMemoryRepository } from '../../adapters/db/course-in-memory.repository';
import { AnswerRepository } from '../../../answer/domain/ports/answer.repository';
import { AnswerInMemoryRepository } from '../../../answer/adapters/db/answer-in-memory.repository';
import { EventService } from '../../../events/event-service.service';
import {
  CreateCourseEvent,
  RemoveCourseEvent,
  UpdateCourseEvent,
} from '../../../events/course.events';
import { iQuestion } from '../../../question/domain/entities/question.model';
import { answerSchema } from '../../../answer/domain/entities/answer.model';
import { AnswerService } from '../../../answer/domain/ports/answer.service';

describe('CourseService', () => {
  let service: CourseService;

  const mockId = '62b9a9f34e0dfa462d7dcbaf';

  const mockCourse: iCourse = {
    user: '1234',
    subject: '1234',
    progress: {
      answered: 0,
      total: 0,
    },
    exams_results: [
      {
        right_answers: 0,
        wrong_answers: 0,
        time: 0,
      },
    ],
  };

  const mockCourseInDb = { ...mockCourse, id: mockId };

  const mockQuestion: iQuestion = {
    id: '1234',
    subject: '1234',
    title: 'testing',
    options: [],
  };

  const mockAnswer = {
    user: '',
    subject: '',
    course: '',
    question: '',
    average_answer_time: 0,
    stats: {
      answers: 0,
      correct: 0,
      wrong: 0,
    },
    last_answer: {
      date: '',
      correct: false,
    },
  };

  const mockQueryResult = {
    toObject: jest.fn().mockReturnValue(mockCourseInDb),
  };

  const mockCourseModel = {
    create: jest.fn().mockResolvedValue(mockQueryResult),
    findOne: jest.fn().mockResolvedValue(mockQueryResult),
    findById: jest.fn().mockResolvedValue(mockQueryResult),
    findByIdAndUpdate: jest.fn().mockResolvedValue({
      toObject: jest.fn().mockReturnValue({
        ...mockCourseInDb,
        title: 'updated',
      }),
    }),
  };

  const mockAnswerModel = {
    find: jest.fn().mockResolvedValue([mockQuestion]),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  };

  const mockAnswerService = {
    createAnswersBySubject: jest.fn().mockResolvedValue([mockAnswer]),
    findAllBySubject: jest.fn().mockResolvedValue([mockAnswer]),
    deleteManyByCourseId: jest.fn().mockResolvedValue({ deleted: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        { provide: CourseRepository, useClass: CourseInMemoryRepository },
        { provide: AnswerRepository, useClass: AnswerInMemoryRepository },
        { provide: EventService, useValue: { emit: jest.fn() } },
        { provide: AnswerService, useValue: mockAnswerService },
      ],
      imports: [
        MongooseModule.forFeature([{ name: 'Course', schema: courseSchema }]),
        MongooseModule.forFeature([{ name: 'Answer', schema: answerSchema }]),
      ],
    })
      .overrideProvider(getModelToken('Course'))
      .useValue(mockCourseModel)
      .overrideProvider(getModelToken('Answer'))
      .useValue(mockAnswerModel)
      .compile();

    service = module.get<CourseService>(CourseService);
  });

  describe('When calling service.create with a new Courses info', () => {
    test('Then it should return the new Course saved to the DB and emit an event', async () => {
      mockCourseModel.findByIdAndUpdate.mockResolvedValueOnce({
        toObject: jest.fn().mockReturnValue(mockCourseInDb),
      });
      const result = await service.create(mockCourse);
      expect(result).toEqual(mockCourseInDb);
      expect(service.eventService.emit).toHaveBeenCalledWith(
        new CreateCourseEvent(mockCourseInDb as unknown as Course),
      );
    });
  });

  describe('When calling service.create with info from an already registered Course', () => {
    test('Then it should throw an error and no event should be emitted', async () => {
      mockCourseModel.create.mockImplementation(async () => {
        const error = { code: 11000 };
        throw error;
      });
      expect(async () => {
        await service.create(mockCourse);
      }).rejects.toThrow();
      expect(service.eventService.emit).not.toHaveBeenCalled();
    });
  });

  describe('When calling service.findOne with a valid Course id with answers', () => {
    test('Then it should return the Course from the db', async () => {
      const result = await service.findOne('id', true);
      expect(result).toEqual({
        course: { ...mockCourseInDb },
        answers: [mockAnswer],
      });
    });
  });

  describe('When calling service.findOne with a valid Course id without questions', () => {
    test('Then it should return the Course from the db', async () => {
      expect(await service.findOne('id', false)).toEqual({
        course: mockCourseInDb,
        answers: null,
      });
    });
  });

  describe('When calling service.findOne with an invalid Course id', () => {
    test('Then it should throw an error', async () => {
      mockCourseModel.findById.mockResolvedValueOnce(null);
      expect(async () => {
        await service.findOne('id', false);
      }).rejects.toThrow();
    });
  });

  describe('When calling service.update with a valid Course id', () => {
    test('Then it should return the updated Course data and emit an event', async () => {
      const result = await service.update('id', {
        ...mockCourseInDb,
        progress: { answered: 1, total: 2 },
      });
      expect(result).toEqual({
        ...mockCourseInDb,
        title: 'updated',
      });
      expect(service.eventService.emit).toHaveBeenCalledWith(
        new UpdateCourseEvent({
          ...mockCourseInDb,
          title: 'updated',
        } as unknown as Course),
      );
    });
  });

  describe('When calling service.update with an invalid Course id', () => {
    test('Then it should throw an error and no events should be emitted', async () => {
      mockCourseModel.findByIdAndUpdate.mockResolvedValueOnce(null);
      expect(async () => {
        await service.update('id', {
          ...mockCourse,
          progress: { answered: 1, total: 2 },
        });
      }).rejects.toThrow();
      expect(service.eventService.emit).not.toHaveBeenCalled();
    });
  });

  describe('When calling service.remove with a valid Course id', () => {
    test('Then it should return the deleted Course and emit an event', async () => {
      const mockResponse = {
        'deleted-answers': 1,
        Course: mockCourseInDb,
      };
      mockCourseModel.findById.mockResolvedValueOnce({
        delete: jest.fn().mockResolvedValue({
          toObject: jest.fn().mockReturnValue(mockCourseInDb),
        }),
      });
      expect(await service.remove('id')).toEqual(mockResponse);
      expect(service.eventService.emit).toHaveBeenCalledWith(
        new RemoveCourseEvent({ id: 'id' }),
      );
    });
  });

  describe('When calling service.remove with an invalid Course id', () => {
    test('Then it should throw an error and no events should be emitted', async () => {
      mockCourseModel.findById.mockResolvedValueOnce(null);
      expect(async () => {
        await service.remove('id');
      }).rejects.toThrow();
      expect(service.eventService.emit).not.toHaveBeenCalled();
    });
  });
});
