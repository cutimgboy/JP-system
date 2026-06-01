import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaderboardEntity } from '../entities/leaderboard.entity';
import { CreateLeaderboardDto } from '../dto/create-leaderboard.dto';
import { UpdateLeaderboardDto } from '../dto/update-leaderboard.dto';
import { RedisService } from '../../redis/redis.service';

const LEADERBOARD_CACHE_KEY = 'public:community:leaderboard';
const LEADERBOARD_CACHE_TTL_SECONDS = 60;

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(LeaderboardEntity)
    private readonly leaderboardRepository: Repository<LeaderboardEntity>,
    private readonly redisService: RedisService,
  ) {}

  async findAll() {
    const cached = await this.redisService.getJson<LeaderboardEntity[]>(LEADERBOARD_CACHE_KEY);
    if (cached) {
      return cached;
    }

    const leaderboard = await this.leaderboardRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', rank: 'ASC' },
    });
    await this.redisService.setJson(LEADERBOARD_CACHE_KEY, leaderboard, LEADERBOARD_CACHE_TTL_SECONDS);
    return leaderboard;
  }

  async findOne(id: number) {
    return await this.leaderboardRepository.findOne({ where: { id } });
  }

  async create(createDto: CreateLeaderboardDto) {
    const leaderboard = this.leaderboardRepository.create(createDto);
    const saved = await this.leaderboardRepository.save(leaderboard);
    await this.invalidatePublicCache();
    return saved;
  }

  async update(id: number, updateDto: UpdateLeaderboardDto) {
    await this.leaderboardRepository.update(id, updateDto);
    await this.invalidatePublicCache();
    return await this.findOne(id);
  }

  async remove(id: number) {
    await this.leaderboardRepository.delete(id);
    await this.invalidatePublicCache();
    return { success: true };
  }

  async updateSortOrder(items: { id: number; sortOrder: number }[]) {
    for (const item of items) {
      await this.leaderboardRepository.update(item.id, { sortOrder: item.sortOrder });
    }
    await this.invalidatePublicCache();
    return { success: true };
  }

  private async invalidatePublicCache() {
    await this.redisService.del(LEADERBOARD_CACHE_KEY);
  }
}
