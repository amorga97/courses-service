import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubjectModule } from './subject/subject.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { QuestionModule } from './question/question.module';
import { CourseModule } from './course/course.module';
import { AnswerModule } from './answer/answer.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    EventEmitterModule.forRoot({
      delimiter: '.',
    }),
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
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGO_USER}:${
        process.env.PASSWORD
      }@cluster0.pauk1.mongodb.net/${
        process.env.NODE_ENV === 'test'
          ? process.env.TEST_DBNAME
          : process.env.DBNAME
      }?retryWrites=true&w=majority`,
    ),
    SubjectModule,
    QuestionModule,
    CourseModule,
    AnswerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
