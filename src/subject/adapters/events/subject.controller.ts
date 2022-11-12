import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { SubjectService } from '../../domain/ports/subject.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { SubjectEventActions } from 'src/subject/domain/entities/subject-actions.enum';
import { Subject } from 'src/subject/domain/entities/subject.model';
import { EventInfo } from 'src/events/events.model';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';

@Controller()
export class SubjectController {
  logger = new Logger('Subject controller');
  constructor(
    private readonly subjectService: SubjectService,
    private eventEmitter: EventEmitter2,
  ) {}

  @EventPattern('subject')
  handleEvent({ action, data }: EventInfo<Subject>) {
    this.eventEmitter.emit(action, data);
  }

  @OnEvent(SubjectEventActions.CREATE)
  async handleSubjectCreatedEvent(createSubjectDto: CreateSubjectDto) {
    const { id } = await this.subjectService.create(createSubjectDto);
    this.logger.log(`Created subject ${id}`);
  }

  @OnEvent(SubjectEventActions.UPDATE)
  async handleSubjectUpdatedEvent(updateSubjectDto: UpdateSubjectDto) {
    const { id } = await this.subjectService.update(
      updateSubjectDto.id,
      updateSubjectDto,
    );
    this.logger.log(`Updated subject ${id}`);
  }

  @OnEvent(SubjectEventActions.REMOVE)
  async handleSubjectRemovedEvent({ id }: { id: string }) {
    const { id: removedId } = await this.subjectService.remove(id);
    this.logger.log(`Removed subject ${removedId}`);
  }
}
