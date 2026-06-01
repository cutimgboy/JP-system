import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from '../entities/message.entity';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { RedisService } from '../../redis/redis.service';

const MESSAGE_CACHE_KEY = 'public:messages:list';
const MESSAGE_CACHE_TTL_SECONDS = 60;

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    private readonly redisService: RedisService,
  ) {}

  async findAll() {
    const cached = await this.redisService.getJson<MessageEntity[]>(MESSAGE_CACHE_KEY);
    if (cached) {
      return cached;
    }

    const messages = await this.messageRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
    await this.redisService.setJson(MESSAGE_CACHE_KEY, messages, MESSAGE_CACHE_TTL_SECONDS);
    return messages;
  }

  async findOne(id: number) {
    return await this.messageRepository.findOne({ where: { id } });
  }

  async create(createDto: CreateMessageDto) {
    const message = this.messageRepository.create(createDto);
    const saved = await this.messageRepository.save(message);
    await this.invalidatePublicCache();
    return saved;
  }

  async update(id: number, updateDto: UpdateMessageDto) {
    await this.messageRepository.update(id, updateDto);
    await this.invalidatePublicCache();
    return await this.findOne(id);
  }

  async remove(id: number) {
    await this.messageRepository.delete(id);
    await this.invalidatePublicCache();
    return { success: true };
  }

  async updateSortOrder(items: { id: number; sortOrder: number }[]) {
    for (const item of items) {
      await this.messageRepository.update(item.id, { sortOrder: item.sortOrder });
    }
    await this.invalidatePublicCache();
    return { success: true };
  }

  private async invalidatePublicCache() {
    await this.redisService.del(MESSAGE_CACHE_KEY);
  }
}
