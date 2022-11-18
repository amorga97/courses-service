import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { AnswerInMemoryRepository } from 'src/answer/adapters/db/answer-in-memory.repository';
import { answerSchema } from 'src/answer/domain/entities/answer.model';
import { AnswerRepository } from 'src/answer/domain/ports/answer.repository';
import { AnswerService } from 'src/answer/domain/ports/answer.service';
import { CourseInMemoryRepository } from 'src/course/adapters/db/course-in-memory.repository';
import { courseSchema } from 'src/course/domain/entities/course.model';
import { CourseRepository } from 'src/course/domain/ports/course.repository';
import { CourseService } from 'src/course/domain/ports/course.service';
import { EventService } from 'src/events/event-service.service';
import { QuestionInMemoryRepository } from 'src/question/adapters/db/question-in-memory.repository';
import { QuestionRepository } from 'src/question/domain/ports/question.repository';
import { QuestionService } from 'src/question/domain/ports/question.service';
import { SubjectInMemoryRepository } from 'src/subject/adapters/db/subject-in-memory.repository';
import { subjectSchema } from 'src/subject/domain/entities/subject.model';
import { SubjectRepository } from 'src/subject/domain/ports/subject.repository';
import { ExamController } from './adapters/api/exam.controller';
import { ExamInMemoryRepository } from './adapters/db/exam-in-memory.repository';
import { examSchema, questionSchema } from './domain/entities/exam.model';
import { ExamRepository } from './domain/ports/exam.repository';
import { ExamService } from './domain/ports/exam.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'COURSES',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'auth',
            brokers: ['localhost:29092'],
          },
          consumer: {
            groupId: 'courses-consumer',
          },
        },
      },
    ]),
    MongooseModule.forFeature([{ name: 'Exam', schema: examSchema }]),
    MongooseModule.forFeature([{ name: 'Course', schema: courseSchema }]),
    MongooseModule.forFeature([{ name: 'Answer', schema: answerSchema }]),
    MongooseModule.forFeature([{ name: 'Question', schema: questionSchema }]),
    MongooseModule.forFeature([{ name: 'Subject', schema: subjectSchema }]),
  ],
  controllers: [ExamController],
  providers: [
    ExamService,
    EventService,
    QuestionService,
    AnswerService,
    CourseService,
    { provide: ExamRepository, useClass: ExamInMemoryRepository },
    { provide: QuestionRepository, useClass: QuestionInMemoryRepository },
    { provide: CourseRepository, useClass: CourseInMemoryRepository },
    { provide: SubjectRepository, useClass: SubjectInMemoryRepository },
    { provide: AnswerRepository, useClass: AnswerInMemoryRepository },
  ],
})
export class ExamModule {}
