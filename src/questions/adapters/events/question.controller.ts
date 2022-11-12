import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { QuestionEventActions } from 'src/questions/domain/entities/question-actions.enum';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CreateQuestionDto } from '../dto/create-questiondto';
import { UpdateQuestionDto } from '../dto/update-question.dto';
import { EventInfo } from 'src/events/events.model';
import { Question } from 'src/questions/domain/entities/question.model';
import { QuestionService } from 'src/questions/domain/ports/question.service';

@Controller('question')
export class QuestionController {
  logger = new Logger('Question controller');
  constructor(
    private readonly questionService: QuestionService,
    private eventEmitter: EventEmitter2,
  ) {}

  @EventPattern('question')
  handleEvent({ action, data }: EventInfo<Question>) {
    this.eventEmitter.emit(action, data);
  }

  @OnEvent(QuestionEventActions.CREATE)
  async handleQuestionCreatedEvent(createQuestionDto: CreateQuestionDto) {
    const questionForDb = { ...createQuestionDto, _id: createQuestionDto.id };
    delete questionForDb.id;
    const { question } = await this.questionService.create(questionForDb);
    this.logger.log(`Created Question ${question.id}`);
  }

  @OnEvent(QuestionEventActions.UPDATE)
  async handleQuestionUpdatedEvent(updateQuestionDto: UpdateQuestionDto) {
    const { question } = await this.questionService.update(
      updateQuestionDto.id,
      updateQuestionDto,
    );
    this.logger.log(`Updated Question ${question.id}`);
  }

  @OnEvent(QuestionEventActions.REMOVE)
  async handleQuestionRemovedEvent({ id }: { id: string }) {
    const { id: removedQuestionId } = await this.questionService.remove(id);
    this.logger.log(`Removed Question ${removedQuestionId}`);
  }
}
