import { Test, TestingModule } from '@nestjs/testing';
import { CreateAnswerDto } from '../dto/create-answer.dto';
import { AnswerController } from './answer.controller';
import { AnswerService } from '../../domain/ports/answer.service';

describe('AnswerController', () => {
  const mockAnswer = {
    user: '',
    subject: '',
    question: '',
    course: '',
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

  let controller: AnswerController;
  let service: AnswerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnswerController],
      providers: [
        {
          provide: AnswerService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findAllBySubject: jest.fn(),
            findAllByUser: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AnswerController>(AnswerController);
    service = module.get<AnswerService>(AnswerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('When calling controller.create', () => {
    test('Then service.create should be called', async () => {
      controller.create(mockAnswer as CreateAnswerDto);
      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('When calling controller.findAll with a Subject id provided', () => {
    test('Then service.findOneBySubject should be called', async () => {
      controller.findAll('subjectId');
      expect(service.findAllBySubject).toHaveBeenCalled();
    });
  });

  describe('When calling controller.findAll with no Subject id provided', () => {
    test('Then service.findOneByUser should be called', async () => {
      controller.findAll(undefined);
      expect(service.findAllBySubject).toHaveBeenCalled();
    });
  });

  describe('When calling controller.findOne', () => {
    test('Then service.findOne should be called', async () => {
      controller.findOne('id');
      expect(service.findOne).toHaveBeenCalled();
    });
  });

  describe('When calling controller.update', () => {
    test('Then service.update should be called', async () => {
      await controller.update('', { time: 123, isCorrect: true });
      expect(service.update).toHaveBeenCalled();
    });
  });

  describe('When calling controller.remove', () => {
    test('Then service.findOne should be called', async () => {
      await controller.remove('');
      expect(service.remove).toHaveBeenCalled();
    });
  });
});
