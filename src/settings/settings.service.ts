import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { UpdateColorDto } from './dto/update-color.dto';
import { SettingsEntity } from './entities/setting.entity';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { UpdateCallScheduleDto } from './dto/update-call-schedule.dto';
import { UpdateSemesterTermsDto } from './dto/update-semester-terms.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SettingsEntity)
    private repository: Repository<SettingsEntity>,
  ) {}

  find(id: number) {
    return this.repository.findOne({ where: { id } });
  }

  // create(dto: UpdateSettingDto) {
  //   const entity = this.repository.create(dto);
  //   return this.repository.save(entity);
  // }

  async updateColor(dto: UpdateColorDto) {
    const settings = await this.repository.findOne({ where: { id: 1 } });
    if (!settings) throw new NotFoundException('Не знайдено');
    return this.repository.save({ ...settings, colors: { ...settings.colors, ...dto } });
  }

  async updateCallSchedule(dto: UpdateCallScheduleDto) {
    const settings = await this.repository.findOne({ where: { id: 1 } });
    if (!settings) throw new NotFoundException('Не знайдено');
    return this.repository.save({ ...settings, callSchedule: { ...settings.callSchedule, ...dto } });
  }

  async updateSemesterTerms(dto: UpdateSemesterTermsDto) {
    const settings = await this.repository.findOne({ where: { id: 1 } });
    if (!settings) throw new NotFoundException('Не знайдено');
    return this.repository.save({ ...settings, ...dto });
  }

  update(id: number, dto: UpdateSettingDto) {
    return this.repository.update({ id }, dto);
  }
}
