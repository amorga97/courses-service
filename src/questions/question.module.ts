import { Module } from '@nestjs/common';
import { QuestionService } from './domain/ports/question.service';
import { QuestionController } from './adapters/api/question.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { questionSchema } from './domain/entities/question.model';
import { subjectSchema } from '../subject/domain/entities/subject.model';
import { QuestionInMemoryRepository } from './adapters/db/question-in-memory.repository';
import { QuestionRepository } from './domain/ports/question.repository';
import { SubjectRepository } from '../subject/domain/ports/subject.repository';
import { SubjectInMemoryRepository } from 'src/subject/adapters/db/subject-in-memory.repository';
import { EventService } from 'src/events/event-service.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Question', schema: questionSchema },
      { name: 'Subject', schema: subjectSchema },
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
  controllers: [QuestionController],
  providers: [
    QuestionService,
    {
      provide: QuestionRepository,
      useClass: QuestionInMemoryRepository,
    },
    {
      provide: SubjectRepository,
      useClass: SubjectInMemoryRepository,
    },
    EventService,
  ],
})
export class QuestionModule {}
