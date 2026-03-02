import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardSettingController } from './reward-setting.controller';
import { RewardSettingService } from './services/reward-setting.service';
import { RewardSettingEntity } from './entities/reward-setting.entity';
import { RewardClaimEntity } from './entities/reward-claim.entity';
import { UserAccountEntity } from '../user/entities/user-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RewardSettingEntity,
      RewardClaimEntity,
      UserAccountEntity,
    ]),
  ],
  controllers: [RewardSettingController],
  providers: [RewardSettingService],
  exports: [RewardSettingService],
})
export class RewardModule {}
