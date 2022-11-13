import { Test, TestingModule } from '@nestjs/testing';
import { CreateCourseDto } from '../dto/create-course.dto';
import { CourseController } from './course.controller';
import { CourseService } from '../../domain/ports/course.service';

describe('CourseController', () => {
  const mockSubjectToAdd: CreateCourseDto = {
    user: '1234',
    subject: '1234',
  };

  let controller: CourseController;
  let service: CourseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseController],
      providers: [
        {
          provide: CourseService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CourseController>(CourseController);
    service = module.get<CourseService>(CourseService);
  });

  describe('When calling controller.create', () => {
    test('Then service.create should be called', async () => {
      controller.create(mockSubjectToAdd as CreateCourseDto);
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
