import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

  create(data: Partial<Conversation>) {
    const conversation = this.conversationRepository.create(data);
    return this.conversationRepository.save(conversation);
  }

  findAll() {
    return this.conversationRepository.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: number) {
    return this.conversationRepository.findOneBy({ id });
  }

  update(id: number, data: Partial<Conversation>) {
    return this.conversationRepository.update(id, data);
  }

  remove(id: number) {
    return this.conversationRepository.delete(id);
  }
} 