import { Module } from '@nestjs/common';
import { CourseService } from './domain/ports/course.service';
import { MongooseModule } from '@nestjs/mongoose';
import { courseSchema } from './domain/entities/course.model';
import { CourseRepository } from './domain/ports/course.repository';
import { CourseInMemoryRepository } from './adapters/db/course-in-memory.repository';
import { CourseController } from './adapters/api/course.controller';
import { EventService } from 'src/events/event-service.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AnswerService } from 'src/answer/domain/ports/answer.service';
import { AnswerRepository } from 'src/answer/domain/ports/answer.repository';
import { AnswerInMemoryRepository } from 'src/answer/adapters/db/answer-in-memory.repository';
import { answerSchema } from 'src/answer/domain/entities/answer.model';
import { AnswerModule } from 'src/answer/answer.module';
import { SubjectRepository } from 'src/subject/domain/ports/subject.repository';
import { SubjectInMemoryRepository } from 'src/subject/adapters/db/subject-in-memory.repository';
import { QuestionRepository } from 'src/question/domain/ports/question.repository';
import { QuestionInMemoryRepository } from 'src/question/adapters/db/question-in-memory.repository';
import { subjectSchema } from 'src/subject/domain/entities/subject.model';
import { questionSchema } from 'src/question/domain/entities/question.model';

@Module({
  imports: [
    AnswerModule,
    MongooseModule.forFeature([{ name: 'Course', schema: courseSchema }]),
    MongooseModule.forFeature([{ name: 'Answer', schema: answerSchema }]),
    MongooseModule.forFeature([{ name: 'Subject', schema: subjectSchema }]),
    MongooseModule.forFeature([{ name: 'Question', schema: questionSchema }]),
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
            groupId: 'users-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [CourseController],
  providers: [
    CourseService,
    { provide: CourseRepository, useClass: CourseInMemoryRepository },
    { provide: AnswerRepository, useClass: AnswerInMemoryRepository },
    { provide: SubjectRepository, useClass: SubjectInMemoryRepository },
    { provide: QuestionRepository, useClass: QuestionInMemoryRepository },
    EventService,
    AnswerService,
  ],
})
export class CourseModule {}
