import { Test, TestingModule } from '@nestjs/testing';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { SubjectController } from './subject.controller';
import { SubjectService } from '../../domain/ports/subject.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SubjectEventActions } from '../../../subject/domain/entities/subject-actions.enum';
import { EventInfo } from '../../../events/events.model';
import { Subject } from '../../../subject/domain/entities/subject.model';

describe('SubjectController', () => {
  const mockSubject: CreateSubjectDto = {
    id: 'id',
    title: '',
    author: '',
  };

  const mockSubjectEvent = (action: SubjectEventActions) => ({
    action,
    data: mockSubject,
  });

  let controller: SubjectController;
  let service: SubjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot({
          delimiter: '.',
        }),
      ],
      controllers: [SubjectController],
      providers: [
        {
          provide: SubjectService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SubjectController>(SubjectController);
    service = module.get<SubjectService>(SubjectService);
  });

  describe('When calling controller.create', () => {
    test('Then service.create should be called', async () => {
      const spy = jest
        .spyOn(controller.eventEmitter, 'emit')
        .mockImplementation(() => null);
      controller.handleEvent(
        mockSubjectEvent(
          SubjectEventActions.CREATE,
        ) as unknown as EventInfo<Subject>,
      );
      expect(spy).toHaveBeenCalledWith(SubjectEventActions.CREATE, mockSubject);
      controller.handleSubjectCreatedEvent(mockSubject as CreateSubjectDto);
      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('When calling controller.update', () => {
    test('Then service.update should be called', async () => {
      const spy = jest
        .spyOn(controller.eventEmitter, 'emit')
        .mockImplementation(() => null);
      controller.handleEvent(
        mockSubjectEvent(
          SubjectEventActions.UPDATE,
        ) as unknown as EventInfo<Subject>,
      );
      expect(spy).toHaveBeenCalledWith(SubjectEventActions.UPDATE, mockSubject);
      await controller.handleSubjectUpdatedEvent(mockSubject);
      expect(service.update).toHaveBeenCalled();
    });
  });

  describe('When calling controller.remove', () => {
    test('Then service.findOne should be called', async () => {
      const spy = jest
        .spyOn(controller.eventEmitter, 'emit')
        .mockImplementation(() => null);
      controller.handleEvent(
        mockSubjectEvent(
          SubjectEventActions.REMOVE,
        ) as unknown as EventInfo<Subject>,
      );
      expect(spy).toHaveBeenCalledWith(SubjectEventActions.REMOVE, mockSubject);
      await controller.handleSubjectRemovedEvent(mockSubject);
      expect(service.remove).toHaveBeenCalled();
    });
  });
});
