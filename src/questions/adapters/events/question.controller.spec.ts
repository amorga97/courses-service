import { Test, TestingModule } from '@nestjs/testing';
import { QuestionController } from './question.controller';
import { QuestionService } from '../../domain/ports/question.service';
import { EventInfo } from '../../../events/events.model';
import { Question } from '../../../questions/domain/entities/question.model';
import { QuestionEventActions } from '../../../questions/domain/entities/question-actions.enum';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('QuestionController', () => {
  const mockQuestion = {
    id: 'id',
    subject: '',
    title: '',
    options: [],
  };

  const mockQuestionEvent = (action: QuestionEventActions) => ({
    action,
    data: mockQuestion,
  });

  let controller: QuestionController;
  let service: QuestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot({
          delimiter: '.',
        }),
      ],
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

  describe('When calling controller.handleEvent with create event', () => {
    test('Then service.create should be called', async () => {
      const spy = jest
        .spyOn(controller.eventEmitter, 'emit')
        .mockImplementation(() => null);
      controller.handleEvent(
        mockQuestionEvent(
          QuestionEventActions.CREATE,
        ) as unknown as EventInfo<Question>,
      );
      expect(spy).toHaveBeenCalledWith(
        QuestionEventActions.CREATE,
        mockQuestion,
      );
      controller.handleQuestionCreatedEvent(mockQuestion);
      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('When calling controller.handleEvent with update event', () => {
    test('Then service.update should be called', async () => {
      const spy = jest
        .spyOn(controller.eventEmitter, 'emit')
        .mockImplementation(() => null);
      controller.handleEvent(
        mockQuestionEvent(
          QuestionEventActions.UPDATE,
        ) as unknown as EventInfo<Question>,
      );
      expect(spy).toHaveBeenCalledWith(
        QuestionEventActions.UPDATE,
        mockQuestion,
      );
      controller.handleQuestionUpdatedEvent(mockQuestion);
      expect(service.update).toHaveBeenCalled();
    });
  });

  describe('When calling controller.handleEvent with remove event', () => {
    test('Then service.findOne should be called', async () => {
      const spy = jest
        .spyOn(controller.eventEmitter, 'emit')
        .mockImplementation(() => null);
      controller.handleEvent(
        mockQuestionEvent(
          QuestionEventActions.REMOVE,
        ) as unknown as EventInfo<Question>,
      );
      expect(spy).toHaveBeenCalledWith(
        QuestionEventActions.REMOVE,
        mockQuestion,
      );
      controller.handleQuestionRemovedEvent(mockQuestion);
      expect(service.remove).toHaveBeenCalled();
    });
  });
});
