import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaderboardEntity } from '../entities/leaderboard.entity';
import { CreateLeaderboardDto } from '../dto/create-leaderboard.dto';
import { UpdateLeaderboardDto } from '../dto/update-leaderboard.dto';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(LeaderboardEntity)
    private readonly leaderboardRepository: Repository<LeaderboardEntity>,
  ) {}

  async findAll() {
    return await this.leaderboardRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', rank: 'ASC' },
    });
  }

  async findOne(id: number) {
    return await this.leaderboardRepository.findOne({ where: { id } });
  }

  async create(createDto: CreateLeaderboardDto) {
    const leaderboard = this.leaderboardRepository.create(createDto);
    return await this.leaderboardRepository.save(leaderboard);
  }

  async update(id: number, updateDto: UpdateLeaderboardDto) {
    await this.leaderboardRepository.update(id, updateDto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    await this.leaderboardRepository.delete(id);
    return { success: true };
  }

  async updateSortOrder(items: { id: number; sortOrder: number }[]) {
    for (const item of items) {
      await this.leaderboardRepository.update(item.id, { sortOrder: item.sortOrder });
    }
    return { success: true };
  }
}
