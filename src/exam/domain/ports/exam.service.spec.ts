import { Test, TestingModule } from '@nestjs/testing';
import { QuestionService } from '../../../question/domain/ports/question.service';
import { EventService } from '../../../events/event-service.service';
import { ExamInMemoryRepository } from '../../../exam/adapters/db/exam-in-memory.repository';
import { ExamRepository } from './exam.repository';
import { ExamService } from './exam.service';
import { AnswerService } from '../../../answer/domain/ports/answer.service';
import { CourseService } from '../../../course/domain/ports/course.service';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { examSchema, iExam, questionForExam } from '../entities/exam.model';

describe('ExamService', () => {
  let service: ExamService;

  const mockId = '62b9a9f34e0dfa462d7dcbaf';

  const mockExam: iExam = {
    id: mockId,
    user: '',
    subject: '',
    course: mockId,
    questions: [],
  };

  const mockExamQuestionTuple: [Partial<questionForExam>, string] = [
    {
      options: [{ description: 'title', isCorrect: true, _id: mockId }],
      selected: mockId,
      time: 20,
    },
    mockId,
  ];

  const mockExamModel = {
    create: jest.fn().mockResolvedValue({
      toObject: jest.fn().mockReturnValue({
        ...mockExam,
        questions: [mockExamQuestionTuple],
      }),
    }),
    find: jest
      .fn()
      .mockResolvedValue([{ toObject: jest.fn().mockReturnValue(mockExam) }]),
    findById: jest.fn().mockReturnValue({
      toObject: jest
        .fn()
        .mockReturnValue({ ...mockExam, questions: [mockExamQuestionTuple] }),
    }),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      toObject: jest.fn().mockReturnValue({
        ...mockExam,
        questions: [mockExamQuestionTuple],
      }),
    }),
    findByIdAndDelete: jest.fn().mockResolvedValue(mockExam),
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

  const mockOption = {
    description: 'mock option',
    isCorrect: false,
  };

  const mockQuestion = {
    options: [
      mockOption,
      mockOption,
      mockOption,
      { ...mockOption, isCorrect: true },
    ],
    subject: mockId,
    title: 'test question',
  };

  const mockQuestionService = {
    findAllBySubject: jest.fn().mockResolvedValue([mockQuestion]),
  };

  const mockAnswerService = {
    update: jest.fn(),
    findManyByCourseId: jest.fn().mockResolvedValue([mockAnswer]),
  };

  const mockCourseService = {
    addExamResult: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamService,
        { provide: ExamRepository, useClass: ExamInMemoryRepository },
        { provide: EventService, useValue: { emit: jest.fn() } },
        { provide: QuestionService, useValue: mockQuestionService },
        { provide: AnswerService, useValue: mockAnswerService },
        { provide: CourseService, useValue: mockCourseService },
      ],
      imports: [
        MongooseModule.forFeature([{ name: 'Exam', schema: examSchema }]),
      ],
    })
      .overrideProvider(getModelToken('Exam'))
      .useValue(mockExamModel)
      .compile();

    service = module.get<ExamService>(ExamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When calling service.create', () => {
    test('Should query the db for questions and answers, create a new exam and return it', async () => {
      const result = await service.create('id', mockId, mockId);
      expect(result).toEqual({
        ...mockExam,
        questions: [mockExamQuestionTuple],
      });
    });
  });

  describe('When calling service.findByCourseid with an invalid course id', () => {
    test('Then it should return an empty array', async () => {
      mockExamModel.find.mockResolvedValueOnce([]);
      const result = await service.findByCourseId('courseId');
      expect(result).toHaveLength(0);
    });
  });

  describe('When calling service.findByCourseid', () => {
    test('Then it should query the db and return an array of exams', async () => {
      const result = await service.findByCourseId('courseId');
      expect(result).toEqual([mockExam]);
    });
  });

  describe('When calling service.update with a correct exam id', () => {
    test('Then it should update the questions of that exam with the options provided', async () => {
      const result = await service.update('examId', [mockExamQuestionTuple]);
      expect(result).toEqual({
        ...mockExam,
        questions: [mockExamQuestionTuple],
      });
    });
  });

  describe('When calling service.update with an incorrect exam id', () => {
    test('Then it should throw a not found exception', async () => {
      mockExamModel.findByIdAndUpdate.mockResolvedValueOnce(null);
      expect(async () => {
        await service.update('examId', [mockExamQuestionTuple]);
      }).rejects.toThrowError('Not Found');
    });
  });

  describe('When calling service.submit with an incorrect exam id', () => {
    test('Then it should throw a not found exception', async () => {
      mockExamModel.findById.mockResolvedValueOnce(null);
      expect(async () => {
        await service.submit('badId');
      }).rejects.toThrowError('Exam not found');
    });
  });

  describe('When calling service.submit with a correct exam id', () => {
    test('Then it should find the exam, update the answers, push the results to the corresponding course and return the exam', async () => {
      const result = await service.submit('goodId');
      expect(result).toEqual({
        ...mockExam,
        questions: [mockExamQuestionTuple],
      });
      expect(mockAnswerService.update).toHaveBeenCalledTimes(1);
      expect(mockCourseService.addExamResult).toHaveBeenCalledWith(mockId, {
        right_answers: 1,
        time: 20,
        wrong_answers: 0,
      });
    });
  });
});
