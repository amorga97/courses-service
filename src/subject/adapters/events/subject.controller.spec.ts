import { Test, TestingModule } from '@nestjs/testing';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { SubjectController } from './subject.controller';
import { SubjectService } from '../../domain/ports/subject.service';

describe('SubjectController', () => {
  const mockSubjectToAdd: CreateSubjectDto = {
    title: '',
    author: '',
  };

  let controller: SubjectController;
  let service: SubjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      controller.create(mockSubjectToAdd as CreateSubjectDto);
      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('When calling controller.findOne', () => {
    test('Then service.findOne should be called', async () => {
      controller.findOne('', true);
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
