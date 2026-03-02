import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MessageService } from './services/message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';

@Controller('api/messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  /**
   * 获取所有消息（公开接口）
   */
  @Get()
  async getAllMessages() {
    return await this.messageService.findAll();
  }
}

@Controller('api/admin/messages')
@UseGuards(JwtAuthGuard)
export class AdminMessageController {
  constructor(private readonly messageService: MessageService) {}

  /**
   * 获取所有消息
   */
  @Get()
  async getAllMessages() {
    return await this.messageService.findAll();
  }

  /**
   * 创建消息
   */
  @Post()
  async createMessage(@Body() createDto: CreateMessageDto) {
    return await this.messageService.create(createDto);
  }

  /**
   * 更新消息
   */
  @Put(':id')
  async updateMessage(
    @Param('id') id: string,
    @Body() updateDto: UpdateMessageDto,
  ) {
    return await this.messageService.update(+id, updateDto);
  }

  /**
   * 删除消息
   */
  @Delete(':id')
  async deleteMessage(@Param('id') id: string) {
    await this.messageService.remove(+id);
    return { success: true };
  }

  /**
   * 批量更新排序
   */
  @Put('sort-order')
  async updateSortOrder(@Body() items: { id: number; sortOrder: number }[]) {
    await this.messageService.updateSortOrder(items);
    return { success: true };
  }
}
