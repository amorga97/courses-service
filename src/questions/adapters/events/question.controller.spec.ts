import { Test, TestingModule } from '@nestjs/testing';
import { CreateQuestionDto } from '../dto/create-questiondto';
import { QuestionController } from './question.controller';
import { QuestionService } from '../../domain/ports/question.service';

describe('QuestionController', () => {
  const mockQuestion = {
    subject: '',
    title: '',
    options: [],
  };

  let controller: QuestionController;
  let service: QuestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionController],
      providers: [
        {
          provide: QuestionService,
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

    controller = module.get<QuestionController>(QuestionController);
    service = module.get<QuestionService>(QuestionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('When calling controller.create', () => {
    test('Then service.create should be called', async () => {
      controller.create(mockQuestion as CreateQuestionDto);
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
      await controller.update('', {});
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
