import { Module } from '@nestjs/common';
import { CourseService } from './domain/ports/course.service';
import { MongooseModule } from '@nestjs/mongoose';
import { courseSchema } from './domain/entities/course.model';
import { CourseRepository } from './domain/ports/course.repository';
import { CourseInMemoryRepository } from './adapters/db/course-in-memory.repository';
import { SubjectController } from './adapters/api/course.controller';
import { EventService } from 'src/events/event-service.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Course', schema: courseSchema }]),
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
    CourseService,
    { provide: CourseRepository, useClass: CourseInMemoryRepository },
    EventService,
  ],
})
export class CourseModule {}
