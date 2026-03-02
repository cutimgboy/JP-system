import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityController, AdminCommunityController } from './community.controller';
import { LeaderboardService } from './services/leaderboard.service';
import { CommunitySettingsService } from './services/community-settings.service';
import { LeaderboardEntity } from './entities/leaderboard.entity';
import { CommunitySettingsEntity } from './entities/community-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaderboardEntity, CommunitySettingsEntity]),
  ],
  controllers: [CommunityController, AdminCommunityController],
  providers: [LeaderboardService, CommunitySettingsService],
  exports: [LeaderboardService, CommunitySettingsService],
})
export class CommunityModule {}
