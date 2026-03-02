import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositController } from './deposit.controller';
import { DepositService } from './services/deposit.service';
import { DepositRecordEntity } from './entities/deposit-record.entity';
import { UserAccountEntity } from '../user/entities/user-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DepositRecordEntity, UserAccountEntity])],
  controllers: [DepositController],
  providers: [DepositService],
  exports: [DepositService],
})
export class DepositModule {}
