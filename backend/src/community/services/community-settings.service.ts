import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunitySettingsEntity } from '../entities/community-settings.entity';

@Injectable()
export class CommunitySettingsService {
  constructor(
    @InjectRepository(CommunitySettingsEntity)
    private readonly settingsRepository: Repository<CommunitySettingsEntity>,
  ) {}

  async getAll() {
    const settings = await this.settingsRepository.find();
    const result: any = {};

    settings.forEach(setting => {
      result[setting.key] = setting.value;
    });

    return result;
  }

  async getSetting(key: string) {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    return setting?.value;
  }

  async setSetting(key: string, value: string, description?: string) {
    let setting = await this.settingsRepository.findOne({ where: { key } });

    if (setting) {
      setting.value = value;
      if (description) setting.description = description;
      return await this.settingsRepository.save(setting);
    } else {
      setting = this.settingsRepository.create({ key, value, description });
      return await this.settingsRepository.save(setting);
    }
  }

  async updateSettings(settings: { date: string; participants: number }) {
    await this.setSetting('date', settings.date, '社区日期');
    await this.setSetting('participants', settings.participants.toString(), '参与人数');
    return { success: true };
  }
}
