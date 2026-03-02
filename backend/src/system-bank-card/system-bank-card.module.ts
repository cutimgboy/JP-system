import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemBankCardController } from './system-bank-card.controller';
import { SystemBankCardService } from './services/system-bank-card.service';
import { SystemBankCardEntity } from './entities/system-bank-card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemBankCardEntity])],
  controllers: [SystemBankCardController],
  providers: [SystemBankCardService],
  exports: [SystemBankCardService],
})
export class SystemBankCardModule {}
