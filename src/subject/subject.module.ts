import { Module } from '@nestjs/common';
import { SubjectService } from './domain/ports/subject.service';
import { MongooseModule } from '@nestjs/mongoose';
import { subjectSchema } from './domain/entities/subject.model';
import { SubjectRepository } from './domain/ports/subject.repository';
import { SubjectInMemoryRepository } from './adapters/db/subject-in-memory.repository';
import { SubjectController } from './adapters/api/subject.controller';
import { QuestionRepository } from 'src/questions/domain/ports/question.repository';
import { QuestionInMemoryRepository } from 'src/questions/adapters/db/question-in-memory.repository';
import { questionSchema } from 'src/questions/domain/entities/question.model';
import { EventService } from 'src/events/event-service.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
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
  controllers: [SubjectController],
  providers: [
    SubjectService,
    { provide: SubjectRepository, useClass: SubjectInMemoryRepository },
    { provide: QuestionRepository, useClass: QuestionInMemoryRepository },
    EventService,
  ],
})
export class SubjectModule {}
