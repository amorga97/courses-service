import { Test, TestingModule } from '@nestjs/testing';
import { ExamService } from '../../../exam/domain/ports/exam.service';
import { ExamController } from './exam.controller';

describe('ExamController', () => {
  let controller: ExamController;

  const mockExamService = {
    create: jest.fn(),
    update: jest.fn(),
    submit: jest.fn(),
    findByCourseId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamController],
      providers: [{ provide: ExamService, useValue: mockExamService }],
    }).compile();

    controller = module.get<ExamController>(ExamController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('When calling controller.create', () => {
    test('Then it should call examService.create', async () => {
      controller.create({ user: 'user', course: 'course' }, '10');
      expect(mockExamService.create).toHaveBeenCalled();
    });
  });
  describe('When calling controller.findByCourseId', () => {
    test('Then it should call examService.findByCourseId', async () => {
      controller.findByCourseId('id');
      expect(mockExamService.findByCourseId).toHaveBeenCalled();
    });
  });
  describe('When calling controller.update', () => {
    test('Then it should call examService.update', async () => {
      controller.update('id', { questions: [] });
      expect(mockExamService.update).toHaveBeenCalled();
    });
  });
  describe('When calling controller.submit', () => {
    test('Then it should call examService.submit', async () => {
      controller.submit('id');
      expect(mockExamService.submit).toHaveBeenCalled();
    });
  });
});
