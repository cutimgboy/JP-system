import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserIdentityEntity } from '../entities/user-identity.entity';

@Injectable()
export class UserIdentityService {
  constructor(
    @InjectRepository(UserIdentityEntity)
    private readonly identityRepository: Repository<UserIdentityEntity>,
  ) {}

  async create(data: {
    userId: number;
    name: string;
    idNumber: string;
    idFrontImage: string;
    idBackImage: string;
    selfieImage: string;
  }) {
    const identity = this.identityRepository.create({
      ...data,
      status: 0,
    });
    return this.identityRepository.save(identity);
  }

  async findByUserId(userId: number) {
    return this.identityRepository.find({
      where: { userId },
      order: { createTime: 'DESC' },
    });
  }

  async findAll(
    status?: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    records: UserIdentityEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const where: Record<string, number> = {};

    if (status !== undefined && !Number.isNaN(Number(status))) {
      where.status = Number(status);
    }

    const [records, total] = await this.identityRepository.findAndCount({
      where,
      relations: ['user'],
      order: { createTime: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      records,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.max(Math.ceil(total / safeLimit), 1),
    };
  }
}
