import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from '../entities/message.entity';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  async findAll() {
    return await this.messageRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    return await this.messageRepository.findOne({ where: { id } });
  }

  async create(createDto: CreateMessageDto) {
    const message = this.messageRepository.create(createDto);
    return await this.messageRepository.save(message);
  }

  async update(id: number, updateDto: UpdateMessageDto) {
    await this.messageRepository.update(id, updateDto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    await this.messageRepository.delete(id);
    return { success: true };
  }

  async updateSortOrder(items: { id: number; sortOrder: number }[]) {
    for (const item of items) {
      await this.messageRepository.update(item.id, { sortOrder: item.sortOrder });
    }
    return { success: true };
  }
}
