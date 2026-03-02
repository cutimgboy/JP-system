import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageController, AdminMessageController } from './message.controller';
import { MessageService } from './services/message.service';
import { MessageEntity } from './entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity])],
  controllers: [MessageController, AdminMessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
