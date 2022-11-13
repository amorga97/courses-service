import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { QuestionEventActions } from 'src/questions/domain/entities/question-actions.enum';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CreateQuestionDto } from '../dto/create-questiondto';
import { UpdateQuestionDto } from '../dto/update-question.dto';
import { EventInfo } from '../../../events/events.model';
import { Question } from '../../../questions/domain/entities/question.model';
import { QuestionService } from '../../../questions/domain/ports/question.service';

@Controller('question')
export class QuestionController {
  logger = new Logger('Question controller');
  constructor(
    private readonly questionService: QuestionService,
    public readonly eventEmitter: EventEmitter2,
  ) {}

  @EventPattern('question')
  handleEvent({ action, data }: EventInfo<Question>) {
    this.eventEmitter.emit(action, data);
  }

  @OnEvent(QuestionEventActions.CREATE)
  async handleQuestionCreatedEvent(createQuestionDto: CreateQuestionDto) {
    try {
      const question = await this.questionService.create(createQuestionDto);
      this.logger.log(`Created Question ${question.id}`);
    } catch (err) {
      this.logger.error('[Create]', err);
    }
  }

  @OnEvent(QuestionEventActions.UPDATE)
  async handleQuestionUpdatedEvent(updateQuestionDto: UpdateQuestionDto) {
    try {
      const question = await this.questionService.update(
        updateQuestionDto.id,
        updateQuestionDto,
      );
      this.logger.log(`Updated Question ${question.id}`);
    } catch (err) {
      this.logger.error('[Update]', err);
    }
  }

  @OnEvent(QuestionEventActions.REMOVE)
  async handleQuestionRemovedEvent({ id }: { id: string }) {
    try {
      const { id: removedQuestionId } = await this.questionService.remove(id);
      this.logger.log(`Removed Question ${removedQuestionId}`);
    } catch (err) {
      this.logger.error('[Remove]', err);
    }
  }
}
