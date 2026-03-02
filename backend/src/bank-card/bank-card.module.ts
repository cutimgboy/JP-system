import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankCardController } from './bank-card.controller';
import { BankCardService } from './services/bank-card.service';
import { BankCardEntity } from './entities/bank-card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BankCardEntity])],
  controllers: [BankCardController],
  providers: [BankCardService],
  exports: [BankCardService],
})
export class BankCardModule {}
