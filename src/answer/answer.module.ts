import { Module } from '@nestjs/common';
import { AnswerService } from './domain/ports/answer.service';
import { AnswerController } from './adapters/api/answer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { answerSchema } from './domain/entities/answer.model';
import { subjectSchema } from '../subject/domain/entities/subject.model';
import { AnswerInMemoryRepository } from './adapters/db/answer-in-memory.repository';
import { AnswerRepository } from './domain/ports/answer.repository';
import { SubjectRepository } from '../subject/domain/ports/subject.repository';
import { SubjectInMemoryRepository } from 'src/subject/adapters/db/subject-in-memory.repository';
import { EventService } from 'src/events/event-service.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QuestionRepository } from 'src/question/domain/ports/question.repository';
import { QuestionInMemoryRepository } from 'src/question/adapters/db/question-in-memory.repository';
import { questionSchema } from 'src/question/domain/entities/question.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Answer', schema: answerSchema },
      { name: 'Subject', schema: subjectSchema },
      { name: 'Question', schema: questionSchema },
    ]),
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
  controllers: [AnswerController],
  providers: [
    AnswerService,
    {
      provide: AnswerRepository,
      useClass: AnswerInMemoryRepository,
    },
    {
      provide: SubjectRepository,
      useClass: SubjectInMemoryRepository,
    },
    {
      provide: QuestionRepository,
      useClass: QuestionInMemoryRepository,
    },
    EventService,
  ],
})
export class AnswerModule {}
