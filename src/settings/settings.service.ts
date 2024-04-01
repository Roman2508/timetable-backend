import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { SettingsEntity } from './entities/setting.entity';
import { UpdateSettingDto } from './dto/update-setting.dto';

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

  update(id: number, dto: UpdateSettingDto) {
    return this.repository.update({ id }, dto);
  }
}
